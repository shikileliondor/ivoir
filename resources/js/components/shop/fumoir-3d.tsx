import { Canvas, useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useLogoTexture } from '@/components/shop/product-3d/shared';

/** Réf mutable partagée entre la section scroll et la scène (0 → 1). */
export interface ProgressRef {
    current: number;
}

// ---------------------------------------------------------------------------
// Dimensions du Fumoir Aurora Smoker, d'après les rendus CAO du produit
// (storage/images/fumoir*.jpeg) : armoire bordeaux sur quatre pieds carrés,
// grande porte chambre + petite porte foyer taupe (plaque logo crème, bande
// inox), verrous chromés, rail à crochets, deux grilles maille, tiroir à
// cendres bleu, cheminée décalée vers l'avant-gauche du toit.
// Mêmes cotes que le modèle de la fiche produit (aurora-smoker-model).
// ---------------------------------------------------------------------------
const W = 0.52; // largeur du caisson
const D = 0.5; // profondeur
const H = 1.3; // hauteur du caisson
const T = 0.012; // épaisseur de tôle
const LEG = 0.32; // hauteur des pieds
const LEG_S = 0.045; // section carrée des pieds
const BODY_Y = LEG + H / 2; // centre du caisson

// Ouvertures de la façade (coordonnées locales, caisson centré en y).
const MAIN = { x: 0.22, y0: -0.12, y1: 0.6 }; // chambre de fumage
const FIRE = { x: 0.2, y0: -0.46, y1: -0.2 }; // foyer
const DRAWER = { x: 0.21, y0: -0.62, y1: -0.5 }; // passage du tiroir

// Cheminée décalée vers l'avant-gauche, comme sur les rendus.
const CHIMNEY_X = -0.13;
const CHIMNEY_Z = 0.12;
const CHIMNEY_TOP = LEG + H + 0.14;

/** Fenêtres de progression [début, fin] de chaque pièce pendant l'assemblage. */
const WINDOWS = {
    legs: [0.02, 0.24],
    body: [0.18, 0.44],
    interior: [0.4, 0.6],
    doorUpper: [0.56, 0.74],
    doorLower: [0.62, 0.8],
    drawer: [0.76, 0.9],
    smoke: [0.9, 0.985],
} as const;

// ---------------------------------------------------------------------------
// Géométries et textures procédurales
// ---------------------------------------------------------------------------

/** Rectangle arrondi utilisable comme trou de découpe. */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number): THREE.Path {
    const path = new THREE.Path();
    path.moveTo(x + r, y);
    path.lineTo(x + w - r, y);
    path.quadraticCurveTo(x + w, y, x + w, y + r);
    path.lineTo(x + w, y + h - r);
    path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    path.lineTo(x + r, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - r);
    path.lineTo(x, y + r);
    path.quadraticCurveTo(x, y, x + r, y);

    return path;
}

/** Façade du caisson : trois découpes (chambre, foyer, passage du tiroir). */
function frontGeo(): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, -H / 2);
    shape.lineTo(W / 2, -H / 2);
    shape.lineTo(W / 2, H / 2);
    shape.lineTo(-W / 2, H / 2);
    shape.closePath();

    for (const o of [MAIN, FIRE, DRAWER]) {
        shape.holes.push(roundedRectPath(-o.x, o.y0, o.x * 2, o.y1 - o.y0, 0.01));
    }

    return new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
}

/** Maille fine des grilles (losanges ajourés). */
function makeRackAlpha(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#000';

        const step = 22;

        for (let row = 0; row * step < 512 - 16; row++) {
            const offset = row % 2 === 1 ? step / 2 : 0;

            for (let x = 18 + offset; x < 512 - 18; x += step) {
                const y = 18 + row * step;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-5, -5, 10, 10);
                ctx.restore();
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;

    return texture;
}

function makeSmokeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(226,224,228,0.85)');
    gradient.addColorStop(0.45, 'rgba(206,203,208,0.4)');
    gradient.addColorStop(1, 'rgba(200,198,202,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

interface SmokePuff {
    phase: number;
    speed: number;
    drift: number;
}

function buildSmoke(): SmokePuff[] {
    return Array.from({ length: 14 }, () => ({
        phase: Math.random(),
        speed: 0.07 + Math.random() * 0.05,
        drift: (Math.random() - 0.5) * 0.16,
    }));
}

// ---------------------------------------------------------------------------
// Scène
// ---------------------------------------------------------------------------

/**
 * Environnement studio (reflets sur les métaux) généré localement, sans réseau.
 * Appelé depuis `onCreated` du Canvas ; libéré avec le contexte WebGL.
 */
function setupStudioEnvironment(state: RootState): void {
    const pmrem = new THREE.PMREMGenerator(state.gl);
    state.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    state.scene.environmentIntensity = 0.55;
    pmrem.dispose();
}

/** Caméra en arc de cercle autour du produit, pilotée par la progression. */
function CameraRig({ progress }: { progress: ProgressRef }) {
    useFrame(({ camera, viewport }) => {
        const p = THREE.MathUtils.smoothstep(progress.current, 0, 1);
        const angle = THREE.MathUtils.lerp(-0.55, 0.4, p);
        // Recule sur les cadrages étroits (mobile portrait) pour garder le produit entier.
        const fit = THREE.MathUtils.clamp(1.3 / viewport.aspect, 1, 2);
        const radius = THREE.MathUtils.lerp(3.4, 2.95, p) * fit;
        const height = THREE.MathUtils.lerp(2.1, 1.5, p);
        camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
        // La visée remonte en fin de course pour cadrer cheminée et fumée.
        camera.lookAt(0, THREE.MathUtils.lerp(0.8, 1.02, p), 0);
    });

    return null;
}

/** 1 quand la pièce n'est pas encore arrivée, 0 une fois en place. */
function remaining(p: number, [start, end]: readonly [number, number]): number {
    return 1 - THREE.MathUtils.smoothstep(p, start, end);
}

function FumoirModel({ progress }: { progress: ProgressRef }) {
    const rootRef = useRef<THREE.Group>(null);
    const legsRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const interiorRef = useRef<THREE.Group>(null);
    const doorUpperRef = useRef<THREE.Group>(null);
    const doorLowerRef = useRef<THREE.Group>(null);
    const drawerRef = useRef<THREE.Group>(null);
    const puffRefs = useRef<(THREE.Sprite | null)[]>([]);
    const smokeAmount = useRef(0);

    const materials = useMemo(
        () => ({
            bordeaux: new THREE.MeshStandardMaterial({ color: '#6f383d', metalness: 0.3, roughness: 0.6 }),
            innerDark: new THREE.MeshStandardMaterial({ color: '#2a1d1d', metalness: 0.25, roughness: 0.85 }),
            taupe: new THREE.MeshStandardMaterial({ color: '#90806f', metalness: 0.3, roughness: 0.55 }),
            blue: new THREE.MeshStandardMaterial({ color: '#7d99b8', metalness: 0.4, roughness: 0.45 }),
            cream: new THREE.MeshStandardMaterial({ color: '#eae2cd', metalness: 0.1, roughness: 0.6 }),
            chrome: new THREE.MeshStandardMaterial({ color: '#b8b3ac', metalness: 0.8, roughness: 0.3 }),
        }),
        [],
    );

    const rackAlpha = useMemo(() => makeRackAlpha(), []);
    const rackMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#332e29',
                metalness: 0.55,
                roughness: 0.5,
                alphaMap: rackAlpha,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            }),
        [rackAlpha],
    );

    const geometries = useMemo(
        () => ({
            front: frontGeo(),
            wallBack: new THREE.BoxGeometry(W, H, T),
            wallSide: new THREE.BoxGeometry(T, H, D),
            slab: new THREE.BoxGeometry(W, T, D),
            chimney: new THREE.CylinderGeometry(0.045, 0.045, 0.14, 24, 1, true),
            chimneyCap: new THREE.CircleGeometry(0.045, 24),
            leg: new THREE.BoxGeometry(LEG_S, LEG, LEG_S),
            rod: new THREE.CylinderGeometry(0.009, 0.009, W - 0.08, 16).rotateZ(Math.PI / 2),
            hookStem: new THREE.CylinderGeometry(0.0035, 0.0035, 0.05, 8),
            hookCurl: new THREE.TorusGeometry(0.011, 0.003, 8, 12, Math.PI),
            rack: new THREE.PlaneGeometry(W - 0.06, D - 0.08).rotateX(-Math.PI / 2),
            rackRail: new THREE.BoxGeometry(0.012, 0.012, D - 0.1),
            partition: new THREE.BoxGeometry(W - 2 * T, T, D - 2 * T),
            doorUpper: new THREE.BoxGeometry(0.5, 0.78, T),
            doorLower: new THREE.BoxGeometry(0.5, 0.3, T),
            plate: new THREE.BoxGeometry(0.17, 0.115, 0.008),
            inoxBand: new THREE.BoxGeometry(0.5, 0.014, T + 0.002),
            hinge: new THREE.BoxGeometry(0.018, 0.045, 0.014),
            latchBody: new THREE.BoxGeometry(0.022, 0.05, 0.012),
            latchPin: new THREE.CylinderGeometry(0.005, 0.005, 0.05, 10).rotateZ(Math.PI / 2),
            trayBottom: new THREE.BoxGeometry(0.4, 0.012, 0.34),
            trayFront: new THREE.BoxGeometry(0.4, 0.09, 0.012),
            traySide: new THREE.BoxGeometry(0.012, 0.09, 0.316),
            handleSlot: new THREE.BoxGeometry(0.1, 0.018, 0.02),
            handleLip: new THREE.BoxGeometry(0.13, 0.03, 0.012),
        }),
        [],
    );

    // Vrai logo du site (personnalisable dans l'admin), couleurs d'origine
    // conservées : lisible sur la plaque crème de la porte.
    const plateLogo = useLogoTexture(false);
    const smokeTexture = useMemo(() => makeSmokeTexture(), []);
    const puffs = useMemo(() => buildSmoke(), []);

    useEffect(() => {
        rootRef.current?.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }, []);

    useFrame(({ clock }) => {
        const p = progress.current;
        const t = clock.getElapsedTime();

        if (rootRef.current) {
            rootRef.current.rotation.y = THREE.MathUtils.lerp(-0.85, 0.25, THREE.MathUtils.smoothstep(p, 0, 1));
        }

        if (legsRef.current) {
            legsRef.current.position.y = -0.9 * remaining(p, WINDOWS.legs);
        }

        if (bodyRef.current) {
            bodyRef.current.position.y = BODY_Y + 1.5 * remaining(p, WINDOWS.body);
        }

        // Grilles, rail et cloisons glissent par la façade ouverte.
        if (interiorRef.current) {
            interiorRef.current.position.z = 1.1 * remaining(p, WINDOWS.interior);
        }

        // Les portes arrivent de la gauche, légèrement inclinées, comme sur
        // la vue éclatée des rendus, puis se plaquent sur la façade.
        if (doorUpperRef.current) {
            const k = remaining(p, WINDOWS.doorUpper);
            doorUpperRef.current.position.set(-1.35 * k, BODY_Y + 0.24 + 0.15 * k, D / 2 + T / 2 + 0.002 + 0.55 * k);
            doorUpperRef.current.rotation.y = -0.55 * k;
        }

        if (doorLowerRef.current) {
            const k = remaining(p, WINDOWS.doorLower);
            doorLowerRef.current.position.set(-1.35 * k, BODY_Y - 0.33 + 0.05 * k, D / 2 + T / 2 + 0.002 + 0.75 * k);
            doorLowerRef.current.rotation.y = -0.55 * k;
        }

        // Le tiroir bleu se glisse dans son passage, en restant entrouvert.
        if (drawerRef.current) {
            drawerRef.current.position.z = 0.12 + 0.85 * remaining(p, WINDOWS.drawer);
        }

        // Fumée : s'élève de la cheminée en toute fin d'assemblage.
        const smokeTarget = THREE.MathUtils.smoothstep(p, WINDOWS.smoke[0], WINDOWS.smoke[1]);
        smokeAmount.current += (smokeTarget - smokeAmount.current) * 0.06;
        const smoke = smokeAmount.current;

        puffs.forEach((puff, index) => {
            const sprite = puffRefs.current[index];

            if (!sprite) {
                return;
            }

            // Panache compact qui dérive sur le côté pour rester dans le cadre.
            const life = (t * puff.speed + puff.phase) % 1;
            const scale = (0.08 + life * 0.34) * (0.6 + 0.4 * smoke);
            sprite.position.set(
                CHIMNEY_X + 0.22 * life + puff.drift * life + 0.04 * Math.sin(t * 0.9 + puff.phase * 7),
                CHIMNEY_TOP + 0.03 + life * 0.5,
                CHIMNEY_Z + puff.drift * 0.5 * life,
            );
            sprite.scale.set(scale, scale, 1);
            (sprite.material as THREE.SpriteMaterial).opacity = smoke * Math.sin(Math.PI * life) * 0.6;
        });
    });

    return (
        <group ref={rootRef}>
            {/* Quatre pieds carrés */}
            <group ref={legsRef}>
                {[1, -1].flatMap((sx) =>
                    [1, -1].map((sz) => (
                        <mesh
                            key={`${sx}:${sz}`}
                            geometry={geometries.leg}
                            material={materials.bordeaux}
                            position={[sx * (W / 2 - LEG_S), LEG / 2, sz * (D / 2 - LEG_S)]}
                        />
                    )),
                )}
            </group>

            {/* Caisson : façade percée, parois, cheminée décalée, verrous */}
            <group ref={bodyRef} position={[0, BODY_Y, 0]}>
                <mesh geometry={geometries.front} material={materials.bordeaux} position={[0, 0, D / 2 - T]} />
                <mesh geometry={geometries.wallBack} material={materials.bordeaux} position={[0, 0, -(D / 2 - T / 2)]} />
                <mesh geometry={geometries.wallSide} material={materials.bordeaux} position={[W / 2 - T / 2, 0, 0]} />
                <mesh geometry={geometries.wallSide} material={materials.bordeaux} position={[-(W / 2 - T / 2), 0, 0]} />
                <mesh geometry={geometries.slab} material={materials.innerDark} position={[0, -(H / 2 - T / 2), 0]} />
                <mesh geometry={geometries.slab} material={materials.bordeaux} position={[0, H / 2 - T / 2, 0]} />

                {/* Cheminée vers l'avant-gauche du toit */}
                <mesh
                    geometry={geometries.chimney}
                    material={materials.bordeaux}
                    position={[CHIMNEY_X, H / 2 + 0.07, CHIMNEY_Z]}
                />
                <mesh
                    geometry={geometries.chimneyCap}
                    material={materials.innerDark}
                    position={[CHIMNEY_X, H / 2 + 0.139, CHIMNEY_Z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                />

                {/* Verrous chromés sur le montant droit, un par porte,
                    en saillie pour venir plaquer les portes fermées */}
                {[0.25, -0.3].map((y) => (
                    <group key={y} position={[0.245, y, D / 2 + T + 0.012]}>
                        <mesh geometry={geometries.latchBody} material={materials.chrome} />
                        <mesh
                            geometry={geometries.latchPin}
                            material={materials.chrome}
                            position={[-0.02, 0.008, 0.006]}
                        />
                    </group>
                ))}
            </group>

            {/* Rail à crochets, grilles maille et cloisons internes */}
            <group ref={interiorRef} position={[0, BODY_Y, 0]}>
                <mesh geometry={geometries.rod} material={materials.chrome} position={[0, 0.545, 0.02]} />
                {[-0.12, -0.04, 0.05, 0.13].map((x) => (
                    <group key={x} position={[x, 0.545, 0.02]}>
                        <mesh geometry={geometries.hookStem} material={materials.chrome} position={[0, -0.026, 0]} />
                        <mesh
                            geometry={geometries.hookCurl}
                            material={materials.chrome}
                            position={[0, -0.055, 0]}
                            rotation={[Math.PI / 2, 0, Math.PI]}
                        />
                    </group>
                ))}

                {[0.3, 0.02].map((y) => (
                    <group key={y}>
                        <mesh geometry={geometries.rack} material={rackMaterial} position={[0, y, 0]} />
                        <mesh
                            geometry={geometries.rackRail}
                            material={materials.innerDark}
                            position={[W / 2 - T - 0.008, y - 0.008, 0]}
                        />
                        <mesh
                            geometry={geometries.rackRail}
                            material={materials.innerDark}
                            position={[-(W / 2 - T - 0.008), y - 0.008, 0]}
                        />
                    </group>
                ))}

                {/* Cloison chambre / foyer, puis sole du foyer */}
                <mesh geometry={geometries.partition} material={materials.innerDark} position={[0, -0.16, 0]} />
                <mesh geometry={geometries.partition} material={materials.innerDark} position={[0, -0.47, 0]} />
            </group>

            {/* Grande porte chambre : plaque logo crème, bande inox, charnières */}
            <group ref={doorUpperRef} position={[0, BODY_Y + 0.24, D / 2 + T / 2 + 0.002]}>
                <mesh geometry={geometries.doorUpper} material={materials.taupe} />
                <mesh geometry={geometries.plate} material={materials.cream} position={[0, 0.23, T / 2 + 0.004]} />
                {plateLogo && (
                    <mesh position={[0, 0.23, T / 2 + 0.0085]}>
                        {/* Le fichier logo fait 516 × 480 px */}
                        <planeGeometry args={[0.115, 0.115 * (480 / 516)]} />
                        <meshStandardMaterial
                            map={plateLogo}
                            transparent
                            alphaTest={0.15}
                            metalness={0.2}
                            roughness={0.6}
                            polygonOffset
                            polygonOffsetFactor={-1}
                        />
                    </mesh>
                )}
                <mesh geometry={geometries.inoxBand} material={materials.chrome} position={[0, -0.397, 0]} />
                {[0.28, -0.28].map((y) => (
                    <mesh
                        key={y}
                        geometry={geometries.hinge}
                        material={materials.chrome}
                        position={[-0.245, y, T / 2 + 0.005]}
                    />
                ))}
            </group>

            {/* Petite porte foyer */}
            <group ref={doorLowerRef} position={[0, BODY_Y - 0.33, D / 2 + T / 2 + 0.002]}>
                <mesh geometry={geometries.doorLower} material={materials.taupe} />
                <mesh
                    geometry={geometries.hinge}
                    material={materials.chrome}
                    position={[-0.245, 0, T / 2 + 0.005]}
                />
            </group>

            {/* Tiroir à cendres bleu : bac plat ouvert, poignée en façade */}
            <group ref={drawerRef} position={[0, BODY_Y - 0.56, 0.12]}>
                <mesh geometry={geometries.trayBottom} material={materials.blue} position={[0, -0.044, 0]} />
                <mesh geometry={geometries.trayFront} material={materials.blue} position={[0, 0, 0.164]} />
                <mesh geometry={geometries.trayFront} material={materials.blue} position={[0, 0, -0.164]} />
                <mesh geometry={geometries.traySide} material={materials.blue} position={[0.194, 0, 0]} />
                <mesh geometry={geometries.traySide} material={materials.blue} position={[-0.194, 0, 0]} />
                <mesh geometry={geometries.handleLip} material={materials.blue} position={[0, -0.005, 0.176]} />
                <mesh geometry={geometries.handleSlot} material={materials.innerDark} position={[0, -0.003, 0.172]} />
            </group>

            {/* Panaches de fumée au-dessus de la cheminée */}
            {puffs.map((puff, index) => (
                <sprite
                    key={index}
                    ref={(el) => {
                        puffRefs.current[index] = el;
                    }}
                    position={[CHIMNEY_X, CHIMNEY_TOP, CHIMNEY_Z]}
                >
                    <spriteMaterial map={smokeTexture} transparent depthWrite={false} opacity={0} />
                </sprite>
            ))}
        </group>
    );
}

interface FumoirCanvasProps {
    /** Progression de l'assemblage (0 → 1), mise à jour hors React. */
    progress: ProgressRef;
    /** Coupe la boucle de rendu quand la section est hors écran. */
    active: boolean;
}

/** Canvas 3D transparent : le fond crème de la page reste visible. */
export function FumoirCanvas({ progress, active }: FumoirCanvasProps) {
    return (
        <Canvas
            frameloop={active ? 'always' : 'never'}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [2.4, 1.8, 2.8], fov: 38 }}
            shadows="soft"
            onCreated={setupStudioEnvironment}
        >
            <CameraRig progress={progress} />

            <hemisphereLight args={[0xfff5e6, 0x9a8a72, 0.6]} />
            <directionalLight
                position={[4, 6, 3]}
                intensity={2.2}
                color={0xfff2e0}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-3}
                shadow-camera-right={3}
                shadow-camera-top={3}
                shadow-camera-bottom={-3}
                shadow-bias={-0.0004}
            />
            <directionalLight position={[-4, 3, -2]} intensity={0.5} color={0xdfe8ff} />

            <FumoirModel progress={progress} />

            <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[24, 24]} />
                <shadowMaterial opacity={0.16} />
            </mesh>
        </Canvas>
    );
}

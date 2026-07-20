import { Canvas, useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Réf mutable partagée entre la section scroll et la scène (0 → 1). */
export interface ProgressRef {
    current: number;
}

// ---------------------------------------------------------------------------
// Dimensions du Flame Duo (mêmes cotes que le prototype public/flame-duo-3d.html)
// ---------------------------------------------------------------------------
const BODY_W = 2.0;
const BODY_H = 0.55;
const BODY_D = 0.85;
const BODY_Y = 0.46;
const FRONT_Z = BODY_D / 2;

const BOWL_X = [-0.52, 0.52];
const BOWL_BASE_Y = BODY_Y + BODY_H - 0.01;
const BOWL_H = 0.42;
const OUT_B = 0.335;
const OUT_T = 0.56;
const IN_B = 0.285;
const IN_T = 0.505;
const RIM_Y = BOWL_BASE_Y + BOWL_H;

const LEG_POS: [number, number][] = [
    [-0.86, -0.32],
    [0.86, -0.32],
    [-0.86, 0.32],
    [0.86, 0.32],
];

/** Fenêtres de progression [début, fin] de chaque pièce pendant l'assemblage. */
const WINDOWS = {
    legs: [0.02, 0.3],
    body: [0.22, 0.5],
    bowlLeft: [0.44, 0.68],
    bowlRight: [0.52, 0.76],
    fittings: [0.72, 0.88],
    fire: [0.9, 0.985],
} as const;

// ---------------------------------------------------------------------------
// Géométries procédurales
// ---------------------------------------------------------------------------

/**
 * Tronc de pyramide rectangulaire (parois latérales uniquement).
 * `invert` oriente les normales vers l'intérieur (paroi interne des bacs).
 */
function frustumGeo(
    hbx: number,
    hbz: number,
    htx: number,
    htz: number,
    h: number,
    invert = false,
): THREE.BufferGeometry {
    const b = [
        [-hbx, -hbz],
        [hbx, -hbz],
        [hbx, hbz],
        [-hbx, hbz],
    ];
    const t = [
        [-htx, -htz],
        [htx, -htz],
        [htx, htz],
        [-htx, htz],
    ];
    const pos: number[] = [];

    for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        const p1 = [b[i][0], 0, b[i][1]];
        const p2 = [b[j][0], 0, b[j][1]];
        const p3 = [t[j][0], h, t[j][1]];
        const p4 = [t[i][0], h, t[i][1]];
        const tris = invert ? [p1, p2, p3, p1, p3, p4] : [p3, p2, p1, p4, p3, p1];

        for (const p of tris) {
            pos.push(p[0], p[1], p[2]);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geometry.computeVertexNormals();

    return geometry;
}

/** Anneau plat horizontal (rebord supérieur des bacs). */
function rimGeo(hxOut: number, hzOut: number, hxIn: number, hzIn: number): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(-hxOut, -hzOut);
    shape.lineTo(hxOut, -hzOut);
    shape.lineTo(hxOut, hzOut);
    shape.lineTo(-hxOut, hzOut);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-hxIn, -hzIn);
    hole.lineTo(hxIn, -hzIn);
    hole.lineTo(hxIn, hzIn);
    hole.lineTo(-hxIn, hzIn);
    hole.closePath();
    shape.holes.push(hole);
    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);

    return geometry;
}

function makeLogoTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f5efe4';
    ctx.save();
    ctx.translate(512, 90);
    ctx.beginPath();
    ctx.moveTo(0, -55);
    ctx.bezierCurveTo(30, -15, 34, 15, 0, 42);
    ctx.bezierCurveTo(-34, 15, -30, -15, 0, -55);
    ctx.fill();
    ctx.restore();
    ctx.font = '700 92px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if ('letterSpacing' in ctx) {
        ctx.letterSpacing = '14px';
    }

    ctx.fillText('IVOIRCUISSON', 512, 225);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;

    return texture;
}

function makeFlameTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,240,180,1)');
    gradient.addColorStop(0.25, 'rgba(255,170,60,0.9)');
    gradient.addColorStop(0.6, 'rgba(230,80,20,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

interface FlameData {
    x: number;
    z: number;
    baseY: number;
    baseScale: number;
    phase: number;
    speed: number;
}

function buildFlames(): FlameData[] {
    const flames: FlameData[] = [];

    for (const bx of BOWL_X) {
        for (let i = 0; i < 9; i++) {
            const angle = (i / 9) * Math.PI * 2;
            const radius = i === 0 ? 0 : 0.06 + Math.random() * 0.09;
            flames.push({
                x: bx + Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                baseY: BOWL_BASE_Y + 0.18,
                baseScale: 0.22 + Math.random() * 0.18,
                phase: Math.random() * Math.PI * 2,
                speed: 6 + Math.random() * 5,
            });
        }
    }

    return flames;
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
        const angle = THREE.MathUtils.lerp(-0.55, 0.45, p);
        // Recule sur les cadrages étroits (mobile portrait) pour garder le produit entier.
        const fit = THREE.MathUtils.clamp(1.3 / viewport.aspect, 1, 2);
        const radius = THREE.MathUtils.lerp(5.2, 4.1, p) * fit;
        const height = THREE.MathUtils.lerp(2.7, 1.8, p);
        camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
        camera.lookAt(0, 0.8, 0);
    });

    return null;
}

/** 1 quand la pièce n'est pas encore arrivée, 0 une fois en place. */
function remaining(p: number, [start, end]: readonly [number, number]): number {
    return 1 - THREE.MathUtils.smoothstep(p, start, end);
}

function FlameDuoModel({ progress }: { progress: ProgressRef }) {
    const rootRef = useRef<THREE.Group>(null);
    const legsRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const bowlLeftRef = useRef<THREE.Group>(null);
    const bowlRightRef = useRef<THREE.Group>(null);
    const fittingsRef = useRef<THREE.Group>(null);
    const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);
    const lightRefs = useRef<(THREE.PointLight | null)[]>([]);
    const fireAmount = useRef(0);

    const materials = useMemo(
        () => ({
            black: new THREE.MeshStandardMaterial({ color: 0x1b1b1e, roughness: 0.45, metalness: 0.55 }),
            dark: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.65, metalness: 0.4 }),
            silver: new THREE.MeshStandardMaterial({ color: 0xd8d8dc, roughness: 0.25, metalness: 1.0 }),
            red: new THREE.MeshStandardMaterial({ color: 0xc1272d, roughness: 0.4, metalness: 0.3 }),
        }),
        [],
    );

    const geometries = useMemo(
        () => ({
            body: new THREE.BoxGeometry(BODY_W, BODY_H, BODY_D),
            leg: new THREE.BoxGeometry(0.11, 0.38, 0.11),
            foot: frustumGeo(0.17, 0.17, 0.06, 0.06, 0.11),
            bowlOuter: frustumGeo(OUT_B, OUT_B * 0.94, OUT_T, OUT_T * 0.94, BOWL_H),
            bowlInner: frustumGeo(IN_B, IN_B * 0.94, IN_T, IN_T * 0.94, BOWL_H - 0.02, true),
            rim: rimGeo(OUT_T, OUT_T * 0.94, IN_T, IN_T * 0.94),
            floor: new THREE.BoxGeometry(IN_B * 2, 0.02, IN_B * 1.88),
            burner: new THREE.CylinderGeometry(0.09, 0.11, 0.05, 24),
            burnerRing: new THREE.TorusGeometry(0.09, 0.012, 10, 32).rotateX(Math.PI / 2),
            knobBase: new THREE.CylinderGeometry(0.105, 0.105, 0.035, 32).rotateX(Math.PI / 2),
            knobStem: new THREE.CylinderGeometry(0.042, 0.048, 0.075, 24).rotateX(Math.PI / 2),
            handleBar: new THREE.CylinderGeometry(0.016, 0.016, 0.24, 12).rotateZ(Math.PI / 2),
            handleTip: new THREE.SphereGeometry(0.022, 12, 8),
            handleHub: new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12).rotateZ(Math.PI / 2),
            logo: new THREE.PlaneGeometry(0.78, 0.244),
        }),
        [],
    );

    const logoTexture = useMemo(() => makeLogoTexture(), []);
    const flameTexture = useMemo(() => makeFlameTexture(), []);
    const flames = useMemo(() => buildFlames(), []);

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
            rootRef.current.rotation.y = THREE.MathUtils.lerp(-0.9, 0.3, THREE.MathUtils.smoothstep(p, 0, 1));
        }

        if (legsRef.current) {
            legsRef.current.position.y = -1.1 * remaining(p, WINDOWS.legs);
        }

        if (bodyRef.current) {
            bodyRef.current.position.y = 1.45 * remaining(p, WINDOWS.body);
        }

        if (bowlLeftRef.current) {
            const k = remaining(p, WINDOWS.bowlLeft);
            bowlLeftRef.current.position.set(BOWL_X[0] - 1.7 * k, 0.55 * k, 0);
            bowlLeftRef.current.rotation.z = -0.35 * k;
        }

        if (bowlRightRef.current) {
            const k = remaining(p, WINDOWS.bowlRight);
            bowlRightRef.current.position.set(BOWL_X[1] + 1.7 * k, 0.55 * k, 0);
            bowlRightRef.current.rotation.z = 0.35 * k;
        }

        if (fittingsRef.current) {
            fittingsRef.current.position.z = 1.4 * remaining(p, WINDOWS.fittings);
        }

        // Feu : s'allume en toute fin d'assemblage, avec un lissage temporel.
        const fireTarget = THREE.MathUtils.smoothstep(p, WINDOWS.fire[0], WINDOWS.fire[1]);
        fireAmount.current += (fireTarget - fireAmount.current) * 0.08;
        const fire = fireAmount.current;

        flames.forEach((flame, index) => {
            const sprite = spriteRefs.current[index];

            if (!sprite) {
                return;
            }

            const flicker =
                0.75 + 0.25 * Math.sin(t * flame.speed + flame.phase) * Math.sin(t * 3.7 + flame.phase * 2);
            const scale = flame.baseScale * flicker * fire;
            sprite.scale.set(scale, scale * (1.5 + 0.3 * Math.sin(t * flame.speed * 0.7 + flame.phase)), 1);
            sprite.position.y = flame.baseY + 0.05 * Math.sin(t * flame.speed * 0.5 + flame.phase) * fire;
            (sprite.material as THREE.SpriteMaterial).opacity = fire * (0.55 + 0.45 * flicker);
        });
        lightRefs.current.forEach((light, index) => {
            if (light) {
                light.intensity = fire * (2.2 + 0.9 * Math.sin(t * 11 + index * 2.1) * Math.sin(t * 5.3));
            }
        });
    });

    const bowlContent = (
        <>
            <mesh geometry={geometries.bowlOuter} material={materials.black} position={[0, BOWL_BASE_Y, 0]} />
            <mesh
                geometry={geometries.bowlInner}
                material={materials.dark}
                position={[0, BOWL_BASE_Y + 0.02, 0]}
            />
            <mesh geometry={geometries.rim} material={materials.black} position={[0, RIM_Y, 0]} />
            <mesh geometry={geometries.floor} material={materials.dark} position={[0, BOWL_BASE_Y + 0.03, 0]} />
            <mesh geometry={geometries.burner} material={materials.dark} position={[0, BOWL_BASE_Y + 0.06, 0]} />
            <mesh
                geometry={geometries.burnerRing}
                material={materials.silver}
                position={[0, BOWL_BASE_Y + 0.085, 0]}
            />
            {/* Poignée rouge posée sur le rebord */}
            <group position={[-IN_T + 0.02, RIM_Y + 0.02, -0.14]} rotation={[0, 0.35, -0.12]}>
                <mesh geometry={geometries.handleBar} material={materials.red} position={[0.12, 0, 0]} />
                <mesh geometry={geometries.handleTip} material={materials.red} position={[0.24, 0, 0]} />
                <mesh geometry={geometries.handleHub} material={materials.silver} />
            </group>
        </>
    );

    return (
        <group ref={rootRef}>
            {/* Pieds */}
            <group ref={legsRef}>
                {LEG_POS.map(([lx, lz]) => (
                    <group key={`${lx}:${lz}`} position={[lx, 0, lz]}>
                        <mesh geometry={geometries.leg} material={materials.black} position={[0, 0.29, 0]} />
                        <mesh geometry={geometries.foot} material={materials.black} />
                    </group>
                ))}
            </group>

            {/* Corps + logo */}
            <group ref={bodyRef}>
                <mesh geometry={geometries.body} material={materials.black} position={[0, BODY_Y + BODY_H / 2, 0]} />
                <mesh geometry={geometries.logo} position={[0, BODY_Y + 0.27, FRONT_Z + 0.003]}>
                    <meshBasicMaterial map={logoTexture} transparent toneMapped={false} />
                </mesh>
            </group>

            {/* Bacs */}
            <group ref={bowlLeftRef}>{bowlContent}</group>
            <group ref={bowlRightRef}>{bowlContent}</group>

            {/* Boutons de commande */}
            <group ref={fittingsRef}>
                {[-0.55, 0.55].map((kx) => (
                    <group key={kx}>
                        <mesh
                            geometry={geometries.knobBase}
                            material={materials.silver}
                            position={[kx, BODY_Y + 0.28, FRONT_Z + 0.017]}
                        />
                        <mesh
                            geometry={geometries.knobStem}
                            material={materials.silver}
                            position={[kx, BODY_Y + 0.28, FRONT_Z + 0.07]}
                        />
                    </group>
                ))}
            </group>

            {/* Flammes + lumières de feu */}
            {flames.map((flame, index) => (
                <sprite
                    key={index}
                    ref={(el) => {
                        spriteRefs.current[index] = el;
                    }}
                    position={[flame.x, flame.baseY, flame.z]}
                >
                    <spriteMaterial
                        map={flameTexture}
                        transparent
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        opacity={0}
                    />
                </sprite>
            ))}
            {BOWL_X.map((bx, index) => (
                <pointLight
                    key={bx}
                    ref={(el) => {
                        lightRefs.current[index] = el;
                    }}
                    position={[bx, RIM_Y - 0.05, 0]}
                    color={0xff7722}
                    intensity={0}
                    distance={2.6}
                    decay={2}
                />
            ))}
        </group>
    );
}

interface FlameDuoCanvasProps {
    /** Progression de l'assemblage (0 → 1), mise à jour hors React. */
    progress: ProgressRef;
    /** Coupe la boucle de rendu quand la section est hors écran. */
    active: boolean;
}

/** Canvas 3D transparent : le fond crème de la page reste visible. */
export function FlameDuoCanvas({ progress, active }: FlameDuoCanvasProps) {
    return (
        <Canvas
            frameloop={active ? 'always' : 'never'}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [3.1, 2.2, 3.6], fov: 38 }}
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

            <FlameDuoModel progress={progress} />

            <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <planeGeometry args={[24, 24]} />
                <shadowMaterial opacity={0.16} />
            </mesh>
        </Canvas>
    );
}

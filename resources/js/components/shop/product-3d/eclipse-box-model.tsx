import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LogoDecal } from './shared';

// Dimensions en mètres, d'après les proportions de la photo produit.
const BOX_W = 1.0; // largeur
const BOX_D = 0.62; // profondeur
const BOX_H = 0.5; // hauteur du caisson
const T = 0.014; // épaisseur de tôle
const BASE_Y = 0.26; // hauteur des pieds

// Positions fixes des morceaux de charbon (x, z, échelle, incandescent).
const COALS: Array<[number, number, number, boolean]> = [
    [-0.16, -0.05, 0.045, false],
    [-0.07, 0.08, 0.05, true],
    [0.02, -0.08, 0.042, false],
    [0.1, 0.04, 0.055, true],
    [0.2, -0.03, 0.04, false],
    [-0.24, 0.06, 0.038, false],
    [0.28, 0.07, 0.036, true],
    [-0.02, 0.01, 0.048, false],
    [0.18, 0.11, 0.033, false],
];

function roundedRectPath(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
): THREE.Path {
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

/** Languette de flamme ondulée (découpe laser du logo sur les flancs). */
function flamePath(
    cx: number,
    cy: number,
    h: number,
    lean: number,
): THREE.Path {
    const w = h * 0.32;
    const path = new THREE.Path();
    path.moveTo(cx, cy - h / 2);
    path.bezierCurveTo(
        cx + w * 0.6,
        cy - h * 0.15,
        cx + w * (0.35 + lean),
        cy + h * 0.2,
        cx + lean * w,
        cy + h / 2,
    );
    path.bezierCurveTo(
        cx - w * (0.35 - lean),
        cy + h * 0.1,
        cx - w * 0.55,
        cy - h * 0.2,
        cx,
        cy - h / 2,
    );

    return path;
}

function panelShape(width: number, height: number): THREE.Shape {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.closePath();

    return shape;
}

/**
 * Barbecue Eclipse Box modélisé en procédural : caisson en tôle acier
 * démontable, grille supérieure perforée, porte de foyer ouverte sur un
 * lit de braises animées, découpes flamme sur les flancs, pieds évasés.
 */
export function EclipseBoxModel() {
    const emberLight = useRef<THREE.PointLight>(null);
    const emberMat = useRef<THREE.MeshStandardMaterial>(null);

    const steel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#3a332e',
                metalness: 0.55,
                roughness: 0.45,
            }),
        [],
    );

    const innerSteel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#171310',
                metalness: 0.3,
                roughness: 0.85,
            }),
        [],
    );

    const charcoal = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#141010',
                metalness: 0.1,
                roughness: 0.95,
            }),
        [],
    );

    // Panneau avant : ouverture du foyer + rainure du tiroir à cendres.
    const frontGeo = useMemo(() => {
        const shape = panelShape(BOX_W, BOX_H);
        shape.holes.push(roundedRectPath(-0.15, -0.2, 0.3, 0.16, 0.02));

        return new THREE.ExtrudeGeometry(shape, {
            depth: T,
            bevelEnabled: false,
        });
    }, []);

    // Flancs : découpes flamme (logo) + poignée intégrée.
    const sideGeo = useMemo(() => {
        const shape = panelShape(BOX_D, BOX_H);
        shape.holes.push(flamePath(0, -0.03, 0.2, 0));
        shape.holes.push(flamePath(-0.075, -0.05, 0.13, -0.25));
        shape.holes.push(flamePath(0.075, -0.05, 0.13, 0.25));
        shape.holes.push(roundedRectPath(-0.08, 0.15, 0.16, 0.035, 0.017));

        return new THREE.ExtrudeGeometry(shape, {
            depth: T,
            bevelEnabled: false,
        });
    }, []);

    // Grille supérieure : plaque perforée via texture alpha générée.
    const grillAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';

            const slotW = 46;
            const slotH = 13;
            const gapX = 26;
            const gapY = 22;
            const margin = 70;

            for (let row = 0; ; row++) {
                const y = margin + row * (slotH + gapY);

                if (y > canvas.height - margin - slotH) {
                    break;
                }

                const offset = row % 2 === 1 ? (slotW + gapX) / 2 : 0;

                for (
                    let x = margin + offset;
                    x <= canvas.width - margin - slotW;
                    x += slotW + gapX
                ) {
                    ctx.beginPath();
                    ctx.roundRect(x, y, slotW, slotH, slotH / 2);
                    ctx.fill();
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    // Palpitation des braises : deux sinus désynchronisés pour éviter
    // tout cycle perceptible.
    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        const flicker = 1 + Math.sin(t * 7.3) * 0.18 + Math.sin(t * 13.7) * 0.1;

        if (emberLight.current) {
            emberLight.current.intensity = 1.4 * flicker;
        }

        if (emberMat.current) {
            emberMat.current.emissiveIntensity = 1.7 * flicker;
        }
    });

    return (
        <group position={[0, BASE_Y + BOX_H / 2, 0]}>
            {/* Panneau avant (foyer) et arrière */}
            <mesh
                geometry={frontGeo}
                material={steel}
                position={[0, 0, BOX_D / 2 - T]}
            />

            {/* Gravure du logo au-dessus du foyer */}
            <LogoDecal width={0.2} position={[0, 0.13, BOX_D / 2 + 0.001]} />
            <mesh material={steel} position={[0, 0, -(BOX_D / 2 - T / 2)]}>
                <boxGeometry args={[BOX_W, BOX_H, T]} />
            </mesh>

            {/* Flancs avec découpes flamme */}
            <mesh
                geometry={sideGeo}
                material={steel}
                position={[BOX_W / 2 - T, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
            />
            <mesh
                geometry={sideGeo}
                material={steel}
                position={[-(BOX_W / 2 - T), 0, 0]}
                rotation={[0, -Math.PI / 2, 0]}
            />

            {/* Rainure du tiroir à cendres sous le foyer */}
            <mesh
                material={innerSteel}
                position={[0, -0.223, BOX_D / 2 - T / 2 + 0.001]}
            >
                <boxGeometry args={[0.36, 0.006, T]} />
            </mesh>

            {/* Languettes d'assemblage dépassant des flancs (design démontable) */}
            {[-0.18, 0, 0.18].map((z) =>
                [1, -1].map((side) => (
                    <mesh
                        key={`${side}-${z}`}
                        material={steel}
                        position={[
                            side * (BOX_W / 2 - T / 2),
                            BOX_H / 2 + 0.008,
                            z,
                        ]}
                    >
                        <boxGeometry args={[T, 0.02, 0.055]} />
                    </mesh>
                )),
            )}

            {/* Grille supérieure perforée */}
            <mesh
                position={[0, BOX_H / 2 - 0.004, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[BOX_W - 0.05, BOX_D - 0.05]} />
                <meshStandardMaterial
                    color="#3a3531"
                    metalness={0.8}
                    roughness={0.3}
                    alphaMap={grillAlpha}
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Sole intérieure */}
            <mesh material={innerSteel} position={[0, -BOX_H / 2 + 0.05, 0]}>
                <boxGeometry args={[BOX_W - 2 * T, T, BOX_D - 2 * T]} />
            </mesh>

            {/* Lit de charbon : morceaux mats et morceaux incandescents */}
            {COALS.map(([x, z, scale, isEmber], index) =>
                isEmber ? (
                    <mesh
                        key={index}
                        position={[x, -BOX_H / 2 + 0.06 + scale * 0.5, z]}
                        scale={[1, 0.7, 1]}
                    >
                        <dodecahedronGeometry args={[scale, 0]} />
                        <meshStandardMaterial
                            ref={index === 3 ? emberMat : undefined}
                            color="#2a1108"
                            emissive="#ff5a1a"
                            emissiveIntensity={1.7}
                            roughness={0.9}
                        />
                    </mesh>
                ) : (
                    <mesh
                        key={index}
                        material={charcoal}
                        position={[x, -BOX_H / 2 + 0.06 + scale * 0.5, z]}
                        scale={[1, 0.7, 1]}
                        rotation={[x * 7, z * 9, 0]}
                    >
                        <dodecahedronGeometry args={[scale, 0]} />
                    </mesh>
                ),
            )}

            {/* Lueur du foyer */}
            <pointLight
                ref={emberLight}
                color="#ff7a2a"
                position={[0, -0.12, 0]}
                intensity={1.4}
                distance={1.2}
                decay={2}
            />

            {/* Pieds : plaques évasées dans le plan des flancs */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <mesh
                        key={`${sx}-${sz}`}
                        material={steel}
                        position={[
                            sx * (BOX_W / 2 - T / 2),
                            -BOX_H / 2 - BASE_Y / 2,
                            sz * (BOX_D / 2 - 0.1),
                        ]}
                        rotation={[0, 0, sx * 0.13]}
                    >
                        <boxGeometry args={[T, BASE_Y + 0.04, 0.15]} />
                    </mesh>
                )),
            )}
        </group>
    );
}

import { useMemo } from 'react';
import * as THREE from 'three';
import { LogoDecal, panelShape, roundedRectPath } from './shared';

// Dimensions en mètres, d'après la photo officielle du produit.
const W = 1.2; // largeur de la cuve
const D = 0.6; // profondeur
const BOX_H = 0.28; // hauteur de la cuve
const T = 0.014; // épaisseur de tôle
const LEG_H = 0.78; // hauteur du piètement
const LEG_R = 0.014; // rayon des tubes

/**
 * Barbecue Majestic Pro reproduit d'après sa photo officielle : table de
 * cuisson double zone (plancha noire à gauche, plaque perforée inox à
 * droite, séparateur central), rehausses-poignées découpées aux deux
 * extrémités, logo laser en façade et piètement en tubes d'acier avec
 * entretoises et diagonales.
 */
export function MajesticProModel() {
    const steel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#2b2724',
                metalness: 0.6,
                roughness: 0.45,
            }),
        [],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#17130f',
                metalness: 0.3,
                roughness: 0.85,
            }),
        [],
    );

    const griddle = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#1c1917',
                metalness: 0.7,
                roughness: 0.32,
            }),
        [],
    );

    const tube = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#211d1a',
                metalness: 0.65,
                roughness: 0.4,
            }),
        [],
    );

    // Plaque perforée inox : rangées de trous ronds en quinconce.
    const holesAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';

            const step = 56;

            for (let row = 0; ; row++) {
                const y = 52 + row * 44;

                if (y > canvas.height - 52) {
                    break;
                }

                const offset = row % 2 === 1 ? step / 2 : 0;

                for (let x = 60 + offset; x < canvas.width - 60; x += step) {
                    ctx.beginPath();
                    ctx.arc(x, y, 11, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    // Rehausse-poignée : plaque verticale avec ouverture oblongue.
    const handleGeo = useMemo(() => {
        const shape = panelShape(0.22, 0.16);
        shape.holes.push(roundedRectPath(-0.07, 0.015, 0.14, 0.035, 0.017));

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.012,
            bevelEnabled: false,
        });
    }, []);

    const legPositions: Array<[number, number]> = [
        [W / 2 - 0.08, D / 2 - 0.06],
        [W / 2 - 0.08, -(D / 2 - 0.06)],
        [-(W / 2 - 0.08), D / 2 - 0.06],
        [-(W / 2 - 0.08), -(D / 2 - 0.06)],
    ];

    return (
        <group position={[0, LEG_H + BOX_H / 2, 0]}>
            {/* Cuve */}
            <mesh material={steel} position={[0, 0, D / 2 - T / 2]}>
                <boxGeometry args={[W, BOX_H, T]} />
            </mesh>
            <mesh material={steel} position={[0, 0, -(D / 2 - T / 2)]}>
                <boxGeometry args={[W, BOX_H, T]} />
            </mesh>
            <mesh material={steel} position={[W / 2 - T / 2, 0, 0]}>
                <boxGeometry args={[T, BOX_H, D]} />
            </mesh>
            <mesh material={steel} position={[-(W / 2 - T / 2), 0, 0]}>
                <boxGeometry args={[T, BOX_H, D]} />
            </mesh>
            <mesh material={innerDark} position={[0, -BOX_H / 2 + 0.02, 0]}>
                <boxGeometry args={[W - 2 * T, T, D - 2 * T]} />
            </mesh>

            {/* Gravure du logo en façade */}
            <LogoDecal width={0.34} position={[0, -0.01, D / 2 + 0.001]} />

            {/* Cadre supérieur */}
            <mesh
                material={steel}
                position={[0, BOX_H / 2 + 0.006, D / 2 - 0.014]}
            >
                <boxGeometry args={[W + 0.02, 0.012, 0.04]} />
            </mesh>
            <mesh
                material={steel}
                position={[0, BOX_H / 2 + 0.006, -(D / 2 - 0.014)]}
            >
                <boxGeometry args={[W + 0.02, 0.012, 0.04]} />
            </mesh>
            <mesh
                material={steel}
                position={[W / 2 - 0.014, BOX_H / 2 + 0.006, 0]}
            >
                <boxGeometry args={[0.04, 0.012, D + 0.02]} />
            </mesh>
            <mesh
                material={steel}
                position={[-(W / 2 - 0.014), BOX_H / 2 + 0.006, 0]}
            >
                <boxGeometry args={[0.04, 0.012, D + 0.02]} />
            </mesh>

            {/* Plancha noire (zone gauche) */}
            <mesh
                material={griddle}
                position={[-W / 4 - 0.005, BOX_H / 2 - 0.018, 0]}
            >
                <boxGeometry args={[W / 2 - 0.05, 0.012, D - 0.06]} />
            </mesh>

            {/* Plaque perforée inox (zone droite) */}
            <mesh
                position={[W / 4 + 0.005, BOX_H / 2 - 0.014, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[W / 2 - 0.05, D - 0.06]} />
                <meshStandardMaterial
                    color="#8d857b"
                    metalness={0.8}
                    roughness={0.3}
                    alphaMap={holesAlpha}
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Séparateur central des deux zones */}
            <mesh material={steel} position={[0, BOX_H / 2 - 0.002, 0]}>
                <boxGeometry args={[0.012, 0.05, D - 0.06]} />
            </mesh>

            {/* Rehausses-poignées aux extrémités */}
            <mesh
                geometry={handleGeo}
                material={steel}
                position={[W / 2 + 0.012, BOX_H / 2 + 0.045, 0]}
                rotation={[0, -Math.PI / 2, 0]}
            />
            <mesh
                geometry={handleGeo}
                material={steel}
                position={[-(W / 2 + 0.012), BOX_H / 2 + 0.045, 0]}
                rotation={[0, Math.PI / 2, 0]}
            />

            {/* Piètement : 4 tubes */}
            {legPositions.map(([x, z]) => (
                <mesh
                    key={`${x}-${z}`}
                    material={tube}
                    position={[x, -BOX_H / 2 - LEG_H / 2, z]}
                >
                    <cylinderGeometry args={[LEG_R, LEG_R, LEG_H, 14]} />
                </mesh>
            ))}

            {/* Entretoises horizontales entre pieds (avant/arrière + côtés) */}
            {[1, -1].map((sz) => (
                <mesh
                    key={sz}
                    material={tube}
                    position={[
                        0,
                        -BOX_H / 2 - LEG_H * 0.62,
                        sz * (D / 2 - 0.06),
                    ]}
                    rotation={[0, 0, Math.PI / 2]}
                >
                    <cylinderGeometry args={[0.008, 0.008, W - 0.16, 12]} />
                </mesh>
            ))}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={tube}
                    position={[
                        sx * (W / 2 - 0.08),
                        -BOX_H / 2 - LEG_H * 0.62,
                        0,
                    ]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.008, 0.008, D - 0.12, 12]} />
                </mesh>
            ))}

            {/* Diagonales de contreventement (mécanisme pliant) */}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={tube}
                    position={[
                        sx * (W / 2 - 0.24),
                        -BOX_H / 2 - LEG_H * 0.31,
                        0,
                    ]}
                    rotation={[Math.PI / 2 - 0.95 * sx, 0, 0.35 * sx]}
                >
                    <cylinderGeometry args={[0.006, 0.006, 0.52, 10]} />
                </mesh>
            ))}
        </group>
    );
}

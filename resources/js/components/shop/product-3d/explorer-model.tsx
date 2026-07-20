import { useMemo } from 'react';
import * as THREE from 'three';
import { LogoDecal, panelShape, roundedRectPath } from './shared';

// Dimensions en mètres, d'après la photo produit (1000 × 620 × 1100 mm).
const W = 1.0; // largeur du caisson
const D = 0.62; // profondeur
const H = 0.35; // hauteur du caisson
const T = 0.013; // épaisseur de tôle
const LEG_H = 0.64; // hauteur du piètement
const LEG_TILT = 0.3; // évasement des pieds (radians)

/**
 * Barbecue Explorer Flame Portable reproduit d'après sa photo : caisson
 * noir sur pieds plats très évasés reliés par un cadre horizontal,
 * plateau inox trois zones (pleine, maille losange, barreaux), petites
 * poignées plates découpées aux extrémités et logo laser en façade.
 */
export function ExplorerModel() {
    const steel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#232120',
                metalness: 0.6,
                roughness: 0.42,
            }),
        [],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#141210',
                metalness: 0.3,
                roughness: 0.85,
            }),
        [],
    );

    const bareSteel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#a8a098',
                metalness: 0.8,
                roughness: 0.3,
            }),
        [],
    );

    // Plateau inox trois zones : gauche pleine, centre maille losange,
    // droite barreaux (fentes longues).
    const topAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';

            // Zone centrale : maille losange serrée.
            const step = 26;

            for (let row = 0; ; row++) {
                const y = 60 + row * step;

                if (y > canvas.height - 60) {
                    break;
                }

                const offset = row % 2 === 1 ? step / 2 : 0;

                for (let x = 380 + offset; x < 660; x += step) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(Math.PI / 4);
                    ctx.fillRect(-6, -6, 12, 12);
                    ctx.restore();
                }
            }

            // Zone droite : fentes longues (barreaux).
            for (let x = 710; x < 960; x += 30) {
                ctx.beginPath();
                ctx.roundRect(x, 70, 14, 500, 7);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    // Petite poignée plate horizontale avec ouverture.
    const handleGeo = useMemo(() => {
        const shape = panelShape(0.13, 0.09);
        shape.holes.push(roundedRectPath(-0.04, -0.015, 0.08, 0.03, 0.014));

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.01,
            bevelEnabled: false,
        });
    }, []);

    const legLength = LEG_H / Math.cos(LEG_TILT) + 0.05;

    return (
        <group position={[0, LEG_H + H / 2, 0]}>
            {/* Caisson */}
            <mesh material={steel} position={[0, 0, D / 2 - T / 2]}>
                <boxGeometry args={[W, H, T]} />
            </mesh>
            <mesh material={steel} position={[0, 0, -(D / 2 - T / 2)]}>
                <boxGeometry args={[W, H, T]} />
            </mesh>
            <mesh material={steel} position={[W / 2 - T / 2, 0, 0]}>
                <boxGeometry args={[T, H, D]} />
            </mesh>
            <mesh material={steel} position={[-(W / 2 - T / 2), 0, 0]}>
                <boxGeometry args={[T, H, D]} />
            </mesh>
            <mesh material={innerDark} position={[0, -H / 2 + 0.025, 0]}>
                <boxGeometry args={[W - 2 * T, T, D - 2 * T]} />
            </mesh>

            {/* Gravure du logo en façade */}
            <LogoDecal width={0.24} position={[0, -0.02, D / 2 + 0.001]} />

            {/* Plateau inox trois zones, posé sur le caisson */}
            <mesh
                position={[0, H / 2 + 0.004, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[W - 0.02, D - 0.02]} />
                <meshStandardMaterial
                    color="#a8a098"
                    metalness={0.8}
                    roughness={0.3}
                    alphaMap={topAlpha}
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Poignées plates aux extrémités du plateau */}
            <mesh
                geometry={handleGeo}
                material={bareSteel}
                position={[W / 2 + 0.055, H / 2 + 0.004, -0.12]}
                rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            />
            <mesh
                geometry={handleGeo}
                material={bareSteel}
                position={[-(W / 2 + 0.055), H / 2 + 0.004, -0.12]}
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
            />

            {/* Pieds plats très évasés */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <mesh
                        key={`${sx}-${sz}`}
                        material={steel}
                        position={[
                            sx *
                                (W / 2 -
                                    0.12 +
                                    Math.sin(LEG_TILT) * legLength * 0.5),
                            -H / 2 - LEG_H / 2,
                            sz * (D / 2 - 0.05),
                        ]}
                        rotation={[0, 0, sx * LEG_TILT]}
                    >
                        <boxGeometry args={[0.012, legLength, 0.05]} />
                    </mesh>
                )),
            )}

            {/* Semelles des pieds, tournées vers l'extérieur */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <mesh
                        key={`${sx}-${sz}`}
                        material={steel}
                        position={[
                            sx *
                                (W / 2 -
                                    0.12 +
                                    Math.sin(LEG_TILT) * legLength +
                                    0.03),
                            -H / 2 - LEG_H + 0.005,
                            sz * (D / 2 - 0.05),
                        ]}
                    >
                        <boxGeometry args={[0.08, 0.011, 0.05]} />
                    </mesh>
                )),
            )}

            {/* Cadre horizontal reliant les pieds */}
            {[1, -1].map((sz) => (
                <mesh
                    key={sz}
                    material={steel}
                    position={[0, -H / 2 - LEG_H * 0.55, sz * (D / 2 - 0.05)]}
                >
                    <boxGeometry args={[W + 0.14, 0.03, 0.012]} />
                </mesh>
            ))}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={steel}
                    position={[sx * (W / 2 + 0.06), -H / 2 - LEG_H * 0.55, 0]}
                >
                    <boxGeometry args={[0.012, 0.03, D - 0.09]} />
                </mesh>
            ))}
        </group>
    );
}

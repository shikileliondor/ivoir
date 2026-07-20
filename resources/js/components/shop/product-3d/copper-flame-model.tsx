import { useMemo } from 'react';
import * as THREE from 'three';
import { LogoDecal } from './shared';

// Dimensions en mètres, d'après la photo produit (vue plongeante).
const RIM_W = 0.62; // largeur du carré supérieur
const BASE_W = 0.32; // largeur du carré à la base de l'entonnoir
const FUNNEL_H = 0.22; // hauteur de l'entonnoir
const FUNNEL_Y = 0.44; // altitude de la base de l'entonnoir
const T = 0.012; // épaisseur de tôle

/**
 * Foyer à gaz Copper Flame reproduit d'après sa photo : entonnoir carré
 * pare-vent en acier noir, brûleur rond en fonte patinée sur sa croix de
 * support, quatre ailettes porte-marmite en moulinet, caisson intérieur
 * logoté, pieds anguleux à semelles et robinetterie laiton/cuivre.
 */
export function CopperFlameModel() {
    const black = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#211f1e',
                metalness: 0.55,
                roughness: 0.5,
                side: THREE.DoubleSide,
            }),
        [],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#151312',
                metalness: 0.3,
                roughness: 0.85,
            }),
        [],
    );

    // Fonte patinée du brûleur (gris-vert de la photo).
    const castIron = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#59594c',
                metalness: 0.45,
                roughness: 0.6,
            }),
        [],
    );

    const brass = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#9c8437',
                metalness: 0.85,
                roughness: 0.3,
            }),
        [],
    );

    const copper = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#a86a3c',
                metalness: 0.8,
                roughness: 0.35,
            }),
        [],
    );

    // Rayons centre → coin pour un cône à 4 segments (section carrée).
    const rimR = (RIM_W / 2) * Math.SQRT2;
    const baseR = (BASE_W / 2) * Math.SQRT2;

    // Ailettes porte-marmite : moulinet autour du brûleur.
    const finOffset = BASE_W / 2 - 0.02;

    return (
        <group>
            {/* Entonnoir carré (tronc de pyramide inversé, ouvert) */}
            <mesh
                material={black}
                position={[0, FUNNEL_Y + FUNNEL_H / 2, 0]}
                rotation={[0, Math.PI / 4, 0]}
            >
                <cylinderGeometry args={[rimR, baseR, FUNNEL_H, 4, 1, true]} />
            </mesh>

            {/* Bord plat du carré supérieur */}
            {[0, 1, 2, 3].map((i) => (
                <mesh
                    key={i}
                    material={black}
                    position={[
                        Math.sin((i * Math.PI) / 2) * (RIM_W / 2 + 0.02),
                        FUNNEL_Y + FUNNEL_H,
                        Math.cos((i * Math.PI) / 2) * (RIM_W / 2 + 0.02),
                    ]}
                    rotation={[0, (i * Math.PI) / 2, 0]}
                >
                    <boxGeometry args={[RIM_W + 0.1, 0.01, 0.05]} />
                </mesh>
            ))}

            {/* Caisson intérieur sous l'entonnoir */}
            {[0, 1, 2, 3].map((i) => (
                <mesh
                    key={i}
                    material={innerDark}
                    position={[
                        Math.sin((i * Math.PI) / 2) * (BASE_W / 2 - T / 2),
                        FUNNEL_Y - 0.12,
                        Math.cos((i * Math.PI) / 2) * (BASE_W / 2 - T / 2),
                    ]}
                    rotation={[0, (i * Math.PI) / 2, 0]}
                >
                    <boxGeometry args={[BASE_W, 0.24, T]} />
                </mesh>
            ))}

            {/* Logo sur la paroi intérieure arrière (visible en plongée) */}
            <LogoDecal
                width={0.16}
                position={[0, FUNNEL_Y - 0.08, -(BASE_W / 2 - T - 0.002)]}
            />

            {/* Croix de support du brûleur */}
            <mesh material={innerDark} position={[0, 0.39, 0]}>
                <boxGeometry args={[BASE_W - 0.02, 0.008, 0.05]} />
            </mesh>
            <mesh
                material={innerDark}
                position={[0, 0.39, 0]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <boxGeometry args={[BASE_W - 0.02, 0.008, 0.05]} />
            </mesh>

            {/* Brûleur en fonte : corps, collerette et cœur */}
            <mesh material={castIron} position={[0, 0.415, 0]}>
                <cylinderGeometry args={[0.07, 0.062, 0.045, 28]} />
            </mesh>
            <mesh material={castIron} position={[0, 0.44, 0]}>
                <cylinderGeometry args={[0.078, 0.078, 0.012, 28]} />
            </mesh>
            <mesh material={innerDark} position={[0, 0.447, 0]}>
                <cylinderGeometry args={[0.028, 0.028, 0.006, 20]} />
            </mesh>

            {/* Ailettes porte-marmite en moulinet */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i * Math.PI) / 2;

                return (
                    <mesh
                        key={i}
                        material={black}
                        position={[
                            Math.sin(angle) * finOffset,
                            0.475,
                            Math.cos(angle) * finOffset,
                        ]}
                        rotation={[0, angle + 0.6, 0]}
                    >
                        <boxGeometry args={[0.17, 0.035, 0.009]} />
                    </mesh>
                );
            })}

            {/* Éclairage d'appoint pour rendre le brûleur lisible en plongée */}
            <pointLight
                color="#fff2df"
                position={[0, 1.0, 0.2]}
                intensity={0.8}
                distance={2}
                decay={2}
            />

            {/* Robinetterie en façade : tube cuivre + vanne laiton à volants */}
            <mesh material={copper} position={[0, 0.21, BASE_W / 2 + 0.02]}>
                <cylinderGeometry args={[0.005, 0.005, 0.2, 10]} />
            </mesh>
            <mesh
                material={brass}
                position={[0, 0.12, BASE_W / 2 + 0.02]}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.011, 0.011, 0.07, 12]} />
            </mesh>
            {[1, -1].map((s) => (
                <mesh
                    key={s}
                    material={brass}
                    position={[s * 0.045, 0.12, BASE_W / 2 + 0.02]}
                >
                    <boxGeometry args={[0.03, 0.008, 0.022]} />
                </mesh>
            ))}
            <mesh material={brass} position={[0, 0.07, BASE_W / 2 + 0.02]}>
                <cylinderGeometry args={[0.007, 0.007, 0.06, 10]} />
            </mesh>

            {/* Pieds aux quatre coins, plaqués contre le caisson */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <group key={`${sx}-${sz}`}>
                        <mesh
                            material={black}
                            position={[sx * 0.13, 0.18, sz * 0.13]}
                        >
                            <boxGeometry args={[0.05, 0.36, 0.05]} />
                        </mesh>
                        {/* Semelle évasée vers l'extérieur, en diagonale */}
                        <mesh
                            material={black}
                            position={[sx * 0.185, 0.012, sz * 0.185]}
                            rotation={[0, -sx * sz * Math.PI * 0.25, 0]}
                        >
                            <boxGeometry args={[0.11, 0.024, 0.06]} />
                        </mesh>
                    </group>
                )),
            )}

            {/* Jupe avant logotée, dans le prolongement du caisson */}
            <mesh material={black} position={[0, 0.12, BASE_W / 2 - T / 2]}>
                <boxGeometry args={[BASE_W, 0.17, T]} />
            </mesh>
            <LogoDecal width={0.16} position={[0, 0.12, BASE_W / 2 + 0.002]} />
        </group>
    );
}

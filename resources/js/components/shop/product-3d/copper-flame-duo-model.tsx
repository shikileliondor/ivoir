import { useMemo } from 'react';
import * as THREE from 'three';
import { LogoDecal } from './shared';

// Dimensions en mètres, d'après la photo produit.
const BODY_W = 0.9; // largeur du caisson
const BODY_D = 0.42; // profondeur
const BODY_H = 0.24; // hauteur du caisson
const BODY_Y = 0.26; // altitude du bas du caisson
const RIM_W = 0.42; // largeur du carré supérieur d'un entonnoir
const BASE_W = 0.24; // largeur à la base d'un entonnoir
const FUNNEL_H = 0.16; // hauteur d'un entonnoir
const FUNNEL_X = 0.225; // écart du centre de chaque entonnoir
const T = 0.012; // épaisseur de tôle

/**
 * Foyer à gaz Copper Flame Duo reproduit d'après sa photo : deux
 * entonnoirs carrés pare-vent côte à côte sur un caisson rectangulaire,
 * logo découpé et deux boutons de réglage en façade, ailettes
 * porte-marmite à embouts rouges, pieds carrés à semelles pyramidales.
 */
export function CopperFlameDuoModel() {
    const black = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#221f1e',
                metalness: 0.55,
                roughness: 0.48,
                side: THREE.DoubleSide,
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

    const castIron = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#4f4f45',
                metalness: 0.45,
                roughness: 0.6,
            }),
        [],
    );

    const knobSteel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#b3aea6',
                metalness: 0.75,
                roughness: 0.35,
            }),
        [],
    );

    const redTip = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#c22a1e',
                metalness: 0.2,
                roughness: 0.55,
            }),
        [],
    );

    // Rayons centre → coin pour les cônes à 4 segments (section carrée).
    const rimR = (RIM_W / 2) * Math.SQRT2;
    const baseR = (BASE_W / 2) * Math.SQRT2;

    const funnelBaseY = BODY_Y + BODY_H;

    return (
        <group>
            {/* Caisson */}
            <mesh
                material={black}
                position={[0, BODY_Y + BODY_H / 2, BODY_D / 2 - T / 2]}
            >
                <boxGeometry args={[BODY_W, BODY_H, T]} />
            </mesh>
            <mesh
                material={black}
                position={[0, BODY_Y + BODY_H / 2, -(BODY_D / 2 - T / 2)]}
            >
                <boxGeometry args={[BODY_W, BODY_H, T]} />
            </mesh>
            <mesh
                material={black}
                position={[BODY_W / 2 - T / 2, BODY_Y + BODY_H / 2, 0]}
            >
                <boxGeometry args={[T, BODY_H, BODY_D]} />
            </mesh>
            <mesh
                material={black}
                position={[-(BODY_W / 2 - T / 2), BODY_Y + BODY_H / 2, 0]}
            >
                <boxGeometry args={[T, BODY_H, BODY_D]} />
            </mesh>
            {/* Dessus du caisson entre et autour des entonnoirs */}
            <mesh material={black} position={[0, funnelBaseY - 0.005, 0]}>
                <boxGeometry args={[BODY_W, 0.01, BODY_D]} />
            </mesh>

            {/* Gravure du logo en façade + pli en V sous la jonction */}
            <LogoDecal
                width={0.2}
                position={[0, BODY_Y + BODY_H / 2, BODY_D / 2 + 0.001]}
            />
            {[1, -1].map((s) => (
                <mesh
                    key={s}
                    material={black}
                    position={[
                        s * 0.045,
                        BODY_Y + BODY_H - 0.03,
                        BODY_D / 2 + 0.002,
                    ]}
                    rotation={[0, 0, s * 0.65]}
                >
                    <boxGeometry args={[0.1, 0.006, 0.004]} />
                </mesh>
            ))}

            {/* Boutons de réglage */}
            {[1, -1].map((s) => (
                <group
                    key={s}
                    position={[
                        s * 0.28,
                        BODY_Y + BODY_H / 2 - 0.02,
                        BODY_D / 2,
                    ]}
                >
                    <mesh material={knobSteel} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.036, 0.036, 0.025, 24]} />
                    </mesh>
                    <mesh
                        material={innerDark}
                        position={[0, 0, 0.014]}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <cylinderGeometry args={[0.008, 0.008, 0.006, 12]} />
                    </mesh>
                </group>
            ))}

            {/* Deux entonnoirs pare-vent */}
            {[1, -1].map((sx) => (
                <group key={sx} position={[sx * FUNNEL_X, 0, 0]}>
                    <mesh
                        material={black}
                        position={[0, funnelBaseY + FUNNEL_H / 2, 0]}
                        rotation={[0, Math.PI / 4, 0]}
                    >
                        <cylinderGeometry
                            args={[rimR, baseR, FUNNEL_H, 4, 1, true]}
                        />
                    </mesh>

                    {/* Bord plat du carré supérieur */}
                    {[0, 1, 2, 3].map((i) => (
                        <mesh
                            key={i}
                            material={black}
                            position={[
                                Math.sin((i * Math.PI) / 2) *
                                    (RIM_W / 2 + 0.012),
                                funnelBaseY + FUNNEL_H,
                                Math.cos((i * Math.PI) / 2) *
                                    (RIM_W / 2 + 0.012),
                            ]}
                            rotation={[0, (i * Math.PI) / 2, 0]}
                        >
                            <boxGeometry args={[RIM_W + 0.06, 0.008, 0.03]} />
                        </mesh>
                    ))}

                    {/* Fond et croix de support */}
                    <mesh
                        material={innerDark}
                        position={[0, funnelBaseY + 0.004, 0]}
                    >
                        <boxGeometry args={[BASE_W, 0.008, BASE_W]} />
                    </mesh>
                    <mesh
                        material={innerDark}
                        position={[0, funnelBaseY + 0.03, 0]}
                    >
                        <boxGeometry args={[BASE_W - 0.01, 0.007, 0.04]} />
                    </mesh>
                    <mesh
                        material={innerDark}
                        position={[0, funnelBaseY + 0.03, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                    >
                        <boxGeometry args={[BASE_W - 0.01, 0.007, 0.04]} />
                    </mesh>

                    {/* Brûleur en fonte */}
                    <mesh
                        material={castIron}
                        position={[0, funnelBaseY + 0.05, 0]}
                    >
                        <cylinderGeometry args={[0.05, 0.045, 0.035, 24]} />
                    </mesh>
                    <mesh
                        material={innerDark}
                        position={[0, funnelBaseY + 0.07, 0]}
                    >
                        <cylinderGeometry args={[0.02, 0.02, 0.005, 16]} />
                    </mesh>

                    {/* Ailettes porte-marmite à embouts rouges */}
                    {[0, 1, 2, 3].map((i) => {
                        const angle = (i * Math.PI) / 2 + Math.PI / 4;
                        const r = BASE_W / 2 + 0.035;

                        return (
                            <group
                                key={i}
                                position={[
                                    Math.sin(angle) * r,
                                    funnelBaseY + 0.075,
                                    Math.cos(angle) * r,
                                ]}
                                rotation={[0, angle + Math.PI / 2, -0.35]}
                            >
                                <mesh material={black}>
                                    <boxGeometry args={[0.1, 0.008, 0.014]} />
                                </mesh>
                                <mesh
                                    material={redTip}
                                    position={[0.055, 0, 0]}
                                >
                                    <boxGeometry args={[0.024, 0.011, 0.017]} />
                                </mesh>
                            </group>
                        );
                    })}
                </group>
            ))}

            {/* Éclairage d'appoint pour les cuves */}
            <pointLight
                color="#fff2df"
                position={[0, 1.0, 0.25]}
                intensity={0.7}
                distance={2}
                decay={2}
            />

            {/* Pieds carrés à semelles pyramidales */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <group
                        key={`${sx}-${sz}`}
                        position={[
                            sx * (BODY_W / 2 - 0.05),
                            0,
                            sz * (BODY_D / 2 - 0.05),
                        ]}
                    >
                        <mesh material={black} position={[0, 0.17, 0]}>
                            <boxGeometry args={[0.05, 0.26, 0.05]} />
                        </mesh>
                        <mesh
                            material={black}
                            position={[0, 0.025, 0]}
                            rotation={[0, Math.PI / 4, 0]}
                        >
                            <cylinderGeometry args={[0.038, 0.085, 0.05, 4]} />
                        </mesh>
                    </group>
                )),
            )}
        </group>
    );
}

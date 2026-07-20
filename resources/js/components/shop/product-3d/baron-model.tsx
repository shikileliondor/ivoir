import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LogoDecal, panelShape, roundedRectPath } from './shared';

// Dimensions en mètres, d'après la photo produit.
const W = 1.05; // largeur du caisson
const D = 0.55; // profondeur
const H = 0.34; // hauteur du caisson
const T = 0.014; // épaisseur de tôle
const LEG_H = 0.42; // hauteur des pieds
const TABLE_W = 0.34; // largeur des tablettes latérales

// Braises sous la grille gauche (x, z, échelle, incandescent).
const COALS: Array<[number, number, number, boolean]> = [
    [-0.42, -0.05, 0.04, false],
    [-0.33, 0.07, 0.045, true],
    [-0.25, -0.08, 0.038, false],
    [-0.16, 0.03, 0.05, true],
    [-0.08, -0.04, 0.036, false],
    [-0.37, 0.12, 0.033, false],
    [-0.2, 0.11, 0.031, true],
    [-0.12, 0.09, 0.042, false],
];

/**
 * Barbecue Baron reproduit d'après sa photo : caisson double surface
 * (grille à barreaux au-dessus du foyer, plateau grillagé fin à droite),
 * tablettes latérales, poignées découpées, logo laser en façade, pieds
 * en plaques évasées à semelles et étagère basse.
 */
export function BaronModel() {
    const emberLight = useRef<THREE.PointLight>(null);
    const emberMat = useRef<THREE.MeshStandardMaterial>(null);

    const steel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#33302c',
                metalness: 0.55,
                roughness: 0.48,
            }),
        [],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#171310',
                metalness: 0.3,
                roughness: 0.85,
            }),
        [],
    );

    const bareSteel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#9a9187',
                metalness: 0.75,
                roughness: 0.35,
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

    // Plateau grillagé fin : maillage serré en texture alpha (fils
    // opaques sur fond transparent).
    const meshAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#fff';

            for (let i = 0; i <= 512; i += 14) {
                ctx.fillRect(i - 2, 0, 4, 512);
                ctx.fillRect(0, i - 2, 512, 4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    // Poignée découpée : plaque avec ouverture oblongue.
    const handleGeo = useMemo(() => {
        const shape = panelShape(0.2, 0.15);
        shape.holes.push(roundedRectPath(-0.06, 0.01, 0.12, 0.035, 0.017));

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.012,
            bevelEnabled: false,
        });
    }, []);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        const flicker = 1 + Math.sin(t * 7.1) * 0.18 + Math.sin(t * 12.9) * 0.1;

        if (emberLight.current) {
            emberLight.current.intensity = 1.5 * flicker;
        }

        if (emberMat.current) {
            emberMat.current.emissiveIntensity = 1.7 * flicker;
        }
    });

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
            <mesh material={innerDark} position={[0, -H / 2 + 0.03, 0]}>
                <boxGeometry args={[W - 2 * T, T, D - 2 * T]} />
            </mesh>

            {/* Gravure du logo en façade */}
            <LogoDecal width={0.26} position={[0, -0.03, D / 2 + 0.001]} />

            {/* Rainure du bac à cendres */}
            <mesh
                material={innerDark}
                position={[0, -H / 2 + 0.055, D / 2 + 0.001]}
            >
                <boxGeometry args={[0.4, 0.008, 0.002]} />
            </mesh>

            {/* Grille à barreaux au-dessus du foyer (moitié gauche) */}
            {Array.from(
                { length: 13 },
                (_, i) => -W / 2 + 0.06 + i * 0.037,
            ).map((x) => (
                <mesh
                    key={x}
                    material={bareSteel}
                    position={[x, H / 2 - 0.006, 0]}
                >
                    <boxGeometry args={[0.011, 0.008, D - 0.07]} />
                </mesh>
            ))}

            {/* Plateau grillagé fin surélevé (moitié droite) avec cadre */}
            <mesh
                position={[W / 4 + 0.02, H / 2 + 0.012, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[W / 2 - 0.1, D - 0.12]} />
                <meshStandardMaterial
                    color="#a29a90"
                    metalness={0.75}
                    roughness={0.35}
                    alphaMap={meshAlpha}
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {[1, -1].map((sz) => (
                <mesh
                    key={sz}
                    material={bareSteel}
                    position={[
                        W / 4 + 0.02,
                        H / 2 + 0.012,
                        sz * ((D - 0.12) / 2),
                    ]}
                >
                    <boxGeometry args={[W / 2 - 0.1, 0.01, 0.03]} />
                </mesh>
            ))}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={bareSteel}
                    position={[
                        W / 4 + 0.02 + sx * ((W / 2 - 0.1) / 2),
                        H / 2 + 0.012,
                        0,
                    ]}
                >
                    <boxGeometry args={[0.03, 0.01, D - 0.12]} />
                </mesh>
            ))}

            {/* Braises et feu sous la grille gauche */}
            {COALS.map(([x, z, scale, isEmber], index) =>
                isEmber ? (
                    <mesh
                        key={index}
                        position={[x, -H / 2 + 0.045 + scale * 0.5, z]}
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
                        position={[x, -H / 2 + 0.045 + scale * 0.5, z]}
                        scale={[1, 0.7, 1]}
                        rotation={[x * 7, z * 9, 0]}
                    >
                        <dodecahedronGeometry args={[scale, 0]} />
                    </mesh>
                ),
            )}
            <pointLight
                ref={emberLight}
                color="#ff7a2a"
                position={[-W / 4, -0.05, 0]}
                intensity={1.5}
                distance={1}
                decay={2}
            />

            {/* Tablettes latérales */}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={bareSteel}
                    position={[
                        sx * (W / 2 + TABLE_W / 2 - 0.005),
                        H / 2 - 0.02,
                        0,
                    ]}
                >
                    <boxGeometry args={[TABLE_W, 0.012, D - 0.02]} />
                </mesh>
            ))}

            {/* Poignées découpées, vers l'arrière */}
            <mesh
                geometry={handleGeo}
                material={steel}
                position={[W / 2 - 0.05, H / 2 + 0.05, -D / 2 + 0.12]}
                rotation={[0, -Math.PI / 2, 0]}
            />
            <mesh
                geometry={handleGeo}
                material={steel}
                position={[-(W / 2 - 0.05), H / 2 + 0.05, -D / 2 + 0.12]}
                rotation={[0, Math.PI / 2, 0]}
            />

            {/* Pieds en plaques évasées + semelles */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <group key={`${sx}-${sz}`}>
                        <mesh
                            material={steel}
                            position={[
                                sx * (W / 2 - T / 2),
                                -H / 2 - LEG_H / 2,
                                sz * (D / 2 - 0.1),
                            ]}
                            rotation={[0, 0, sx * 0.1]}
                        >
                            <boxGeometry args={[T, LEG_H + 0.04, 0.16]} />
                        </mesh>
                        <mesh
                            material={steel}
                            position={[
                                sx * (W / 2 + 0.025),
                                -H / 2 - LEG_H + 0.006,
                                sz * (D / 2 - 0.1),
                            ]}
                        >
                            <boxGeometry args={[0.1, 0.012, 0.16]} />
                        </mesh>
                    </group>
                )),
            )}

            {/* Étagère basse */}
            <mesh material={steel} position={[0, -H / 2 - LEG_H * 0.62, 0]}>
                <boxGeometry args={[W - 0.16, 0.012, D - 0.14]} />
            </mesh>
        </group>
    );
}

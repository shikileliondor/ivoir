import { useMemo } from 'react';
import * as THREE from 'three';
import { LogoDecal } from './shared';

// Dimensions en mètres, relevées sur la photo produit.
const W = 0.56; // largeur du caisson
const D = 0.5; // profondeur
const H = 1.0; // hauteur du caisson
const T = 0.012; // épaisseur de tôle
const LEG = 0.34; // hauteur des pieds
const LEG_S = 0.045; // section carrée des pieds

const DOOR_W = 0.52;
const DOOR_H = 0.6;
// Ouverture de porte : x ∈ [-0.24, 0.24], y ∈ [-0.12, 0.44]
// Ouverture du foyer : x ∈ [-0.2, 0.2], y ∈ [-0.36, -0.19]

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

/**
 * Fumoir Aurora Smoker reproduit d'après sa photo : armoire verticale en
 * tôle martelée sur pieds carrés, porte battante ouverte (cadre embouti,
 * charnières, loquet), tringle de suspension et grilles perforées
 * losange, foyer à sole ajourée, tiroir à copeaux, cheminée et taquets
 * latéraux.
 */
export function AuroraSmokerModel() {
    // Peinture martelée : micro-relief généré en canvas, répété.
    const hammered = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, 256, 256);

            // Pseudo-aléatoire déterministe (LCG) : texture identique à
            // chaque rendu, et compatible avec la pureté exigée par React.
            let seed = 7;

            const rand = () => {
                seed = (seed * 16807) % 2147483647;

                return seed / 2147483647;
            };

            for (let i = 0; i < 2600; i++) {
                const value = 100 + Math.floor(rand() * 56);
                ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
                ctx.beginPath();
                ctx.arc(
                    rand() * 256,
                    rand() * 256,
                    1 + rand() * 2.2,
                    0,
                    Math.PI * 2,
                );
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);

        return texture;
    }, []);

    const bronze = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#453a2f',
                metalness: 0.5,
                roughness: 0.62,
                bumpMap: hammered,
                bumpScale: 0.15,
            }),
        [hammered],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#241e18',
                metalness: 0.3,
                roughness: 0.85,
            }),
        [],
    );

    const bareSteel = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#7d746a',
                metalness: 0.6,
                roughness: 0.4,
            }),
        [],
    );

    // Façade : deux ouvertures (porte + foyer) découpées dans la tôle.
    const frontGeo = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-W / 2, -H / 2);
        shape.lineTo(W / 2, -H / 2);
        shape.lineTo(W / 2, H / 2);
        shape.lineTo(-W / 2, H / 2);
        shape.closePath();
        shape.holes.push(roundedRectPath(-0.24, -0.12, 0.48, 0.56, 0.01));
        shape.holes.push(roundedRectPath(-0.2, -0.36, 0.4, 0.17, 0.01));

        return new THREE.ExtrudeGeometry(shape, {
            depth: T,
            bevelEnabled: false,
        });
    }, []);

    // Grilles perforées losange (comme sur la photo).
    const rackAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#000';

            const step = 30;

            for (let row = 0; row * step < 512 - 20; row++) {
                const offset = row % 2 === 1 ? step / 2 : 0;

                for (let x = 24 + offset; x < 512 - 24; x += step) {
                    const y = 24 + row * step;
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(Math.PI / 4);
                    ctx.fillRect(-6.5, -6.5, 13, 13);
                    ctx.restore();
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    // Sole du foyer : longues fentes d'aération.
    const ventAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#000';

            for (let x = 60; x < 512 - 60; x += 46) {
                ctx.beginPath();
                ctx.roundRect(x, 90, 18, 332, 9);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    const rackMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#4c4238',
                metalness: 0.6,
                roughness: 0.5,
                alphaMap: rackAlpha,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            }),
        [rackAlpha],
    );

    return (
        <group position={[0, LEG + H / 2, 0]}>
            {/* Façade percée */}
            <mesh
                geometry={frontGeo}
                material={bronze}
                position={[0, 0, D / 2 - T]}
            />

            {/* Parois arrière et latérales, fond */}
            <mesh material={bronze} position={[0, 0, -(D / 2 - T / 2)]}>
                <boxGeometry args={[W, H, T]} />
            </mesh>
            <mesh material={bronze} position={[W / 2 - T / 2, 0, 0]}>
                <boxGeometry args={[T, H, D]} />
            </mesh>
            <mesh material={bronze} position={[-(W / 2 - T / 2), 0, 0]}>
                <boxGeometry args={[T, H, D]} />
            </mesh>

            {/* Gravure du logo sur le flanc droit */}
            <LogoDecal
                width={0.26}
                position={[W / 2 + 0.001, 0.08, 0]}
                rotation={[0, Math.PI / 2, 0]}
            />
            <mesh material={innerDark} position={[0, -(H / 2 - T / 2), 0]}>
                <boxGeometry args={[W, T, D]} />
            </mesh>

            {/* Plateau supérieur débordant + cheminée */}
            <mesh material={bronze} position={[0, H / 2 + 0.01, 0]}>
                <boxGeometry args={[W + 0.04, 0.02, D + 0.04]} />
            </mesh>
            <mesh material={bronze} position={[0, H / 2 + 0.02 + 0.055, -0.1]}>
                <cylinderGeometry args={[0.05, 0.05, 0.11, 24, 1, true]} />
            </mesh>
            <mesh
                material={innerDark}
                position={[0, H / 2 + 0.02 + 0.1, -0.1]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.05, 24]} />
            </mesh>

            {/* Cloison entre chambre de fumage et foyer */}
            <mesh material={innerDark} position={[0, -0.165, 0]}>
                <boxGeometry args={[W - 2 * T, T, D - 2 * T]} />
            </mesh>

            {/* Tringle de suspension + supports */}
            <mesh
                material={bareSteel}
                position={[0, 0.4, 0.02]}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.011, 0.011, W - 0.08, 16]} />
            </mesh>

            {/* 3 grilles perforées sur rails */}
            {[0.26, 0.06, -0.1].map((y) => (
                <group key={y}>
                    <mesh
                        material={rackMaterial}
                        position={[0, y, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <planeGeometry args={[W - 0.06, D - 0.08]} />
                    </mesh>
                    <mesh
                        material={innerDark}
                        position={[W / 2 - T - 0.008, y - 0.008, 0]}
                    >
                        <boxGeometry args={[0.012, 0.012, D - 0.1]} />
                    </mesh>
                    <mesh
                        material={innerDark}
                        position={[-(W / 2 - T - 0.008), y - 0.008, 0]}
                    >
                        <boxGeometry args={[0.012, 0.012, D - 0.1]} />
                    </mesh>
                </group>
            ))}

            {/* Sole ajourée du foyer */}
            <mesh position={[0, -0.365, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[W - 0.06, D - 0.08]} />
                <meshStandardMaterial
                    color="#7d746a"
                    metalness={0.6}
                    roughness={0.35}
                    alphaMap={ventAlpha}
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh material={innerDark} position={[0, -0.39, 0]}>
                <boxGeometry args={[W - 0.05, 0.01, D - 0.07]} />
            </mesh>

            {/* Tiroir à copeaux et sa poignée pliée */}
            <mesh material={bronze} position={[0, -0.44, D / 2 + 0.008]}>
                <boxGeometry args={[0.42, 0.1, 0.015]} />
            </mesh>
            <mesh material={bronze} position={[0, -0.425, D / 2 + 0.032]}>
                <boxGeometry args={[0.14, 0.012, 0.012]} />
            </mesh>
            <mesh
                material={bronze}
                position={[-0.082, -0.437, D / 2 + 0.024]}
                rotation={[0, 0, -0.5]}
            >
                <boxGeometry args={[0.012, 0.045, 0.012]} />
            </mesh>
            <mesh
                material={bronze}
                position={[0.082, -0.437, D / 2 + 0.024]}
                rotation={[0, 0, 0.5]}
            >
                <boxGeometry args={[0.012, 0.045, 0.012]} />
            </mesh>

            {/* Taquets pliés sur les flancs */}
            {[1, -1].map((sx) =>
                [0.02, -0.24].map((y) => (
                    <group key={`${sx}-${y}`}>
                        <mesh
                            material={bronze}
                            position={[sx * (W / 2 + 0.014), y, 0.06]}
                        >
                            <boxGeometry args={[0.028, 0.055, 0.012]} />
                        </mesh>
                        <mesh
                            material={bronze}
                            position={[sx * (W / 2 + 0.034), y, 0.08]}
                        >
                            <boxGeometry args={[0.012, 0.055, 0.035]} />
                        </mesh>
                    </group>
                )),
            )}

            {/* Porte battante ouverte, charnières côté gauche */}
            <group
                position={[-W / 2, 0.16, D / 2 - 0.005]}
                rotation={[0, -Math.PI * 0.58, 0]}
            >
                <mesh material={bronze} position={[DOOR_W / 2, 0, 0]}>
                    <boxGeometry args={[DOOR_W, DOOR_H, T]} />
                </mesh>

                {/* Cadre embouti + pli diagonal, sur les deux faces */}
                {[1, -1].map((face) => (
                    <group key={face}>
                        <mesh
                            material={bronze}
                            position={[
                                DOOR_W / 2,
                                DOOR_H / 2 - 0.055,
                                face * (T / 2 + 0.003),
                            ]}
                        >
                            <boxGeometry args={[DOOR_W - 0.1, 0.016, 0.005]} />
                        </mesh>
                        <mesh
                            material={bronze}
                            position={[
                                DOOR_W / 2,
                                -(DOOR_H / 2 - 0.055),
                                face * (T / 2 + 0.003),
                            ]}
                        >
                            <boxGeometry args={[DOOR_W - 0.1, 0.016, 0.005]} />
                        </mesh>
                        <mesh
                            material={bronze}
                            position={[0.058, 0, face * (T / 2 + 0.003)]}
                        >
                            <boxGeometry
                                args={[0.016, DOOR_H - 0.094, 0.005]}
                            />
                        </mesh>
                        <mesh
                            material={bronze}
                            position={[
                                DOOR_W - 0.058,
                                0,
                                face * (T / 2 + 0.003),
                            ]}
                        >
                            <boxGeometry
                                args={[0.016, DOOR_H - 0.094, 0.005]}
                            />
                        </mesh>
                        <mesh
                            material={bronze}
                            position={[
                                DOOR_W / 2,
                                -DOOR_H / 2 + 0.15,
                                face * (T / 2 + 0.003),
                            ]}
                            rotation={[0, 0, -0.48]}
                        >
                            <boxGeometry args={[0.42, 0.014, 0.005]} />
                        </mesh>
                    </group>
                ))}

                {/* Charnières */}
                {[0.2, 0, -0.2].map((y) => (
                    <mesh
                        key={y}
                        material={bareSteel}
                        position={[0.004, y, T / 2 + 0.004]}
                    >
                        <boxGeometry args={[0.02, 0.05, 0.014]} />
                    </mesh>
                ))}

                {/* Loquet */}
                <mesh
                    material={bareSteel}
                    position={[DOOR_W - 0.05, 0, T / 2 + 0.022]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.006, 0.006, 0.045, 12]} />
                </mesh>
                <mesh
                    material={bareSteel}
                    position={[DOOR_W - 0.05, 0, T / 2 + 0.048]}
                >
                    <sphereGeometry args={[0.01, 12, 12]} />
                </mesh>
            </group>

            {/* Pieds carrés */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <mesh
                        key={`${sx}-${sz}`}
                        material={bronze}
                        position={[
                            sx * (W / 2 - LEG_S),
                            -(H / 2) - LEG / 2,
                            sz * (D / 2 - LEG_S),
                        ]}
                    >
                        <boxGeometry args={[LEG_S, LEG, LEG_S]} />
                    </mesh>
                )),
            )}
        </group>
    );
}

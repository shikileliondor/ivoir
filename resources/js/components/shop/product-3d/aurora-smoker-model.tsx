import { useMemo } from 'react';
import * as THREE from 'three';
import { roundedRectPath, useLogoTexture } from './shared';

// Dimensions en mètres, relevées sur les rendus CAO du fumoir.
const W = 0.52; // largeur du caisson
const D = 0.5; // profondeur
const H = 1.3; // hauteur du caisson
const T = 0.012; // épaisseur de tôle
const LEG = 0.32; // hauteur des pieds
const LEG_S = 0.045; // section carrée des pieds

// Ouvertures de la façade (coordonnées locales, caisson centré en y).
const MAIN = { x: 0.22, y0: -0.12, y1: 0.6 }; // chambre de fumage
const FIRE = { x: 0.2, y0: -0.46, y1: -0.2 }; // foyer
const DRAWER = { x: 0.21, y0: -0.62, y1: -0.5 }; // passage du tiroir

/**
 * Fumoir Aurora Smoker reproduit d'après ses rendus CAO : armoire
 * bordeaux sur pieds carrés, porte taupe à deux panneaux (plaque logo
 * crème, bande inox), verrous chromés, rail à crochets, deux grilles
 * maille, foyer séparé et tiroir à cendres bleu, cheminée centrée.
 */
export function AuroraSmokerModel() {
    const bordeaux = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#7c4145',
                metalness: 0.3,
                roughness: 0.55,
            }),
        [],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#2a1d1d',
                metalness: 0.25,
                roughness: 0.85,
            }),
        [],
    );

    const taupe = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#90806f',
                metalness: 0.3,
                roughness: 0.55,
            }),
        [],
    );

    const blue = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#7d99b8',
                metalness: 0.4,
                roughness: 0.45,
            }),
        [],
    );

    const cream = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#eae2cd',
                metalness: 0.1,
                roughness: 0.6,
            }),
        [],
    );

    const chrome = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#b8b3ac',
                metalness: 0.8,
                roughness: 0.3,
            }),
        [],
    );

    // Façade : trois découpes (chambre, foyer, passage du tiroir).
    const frontGeo = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-W / 2, -H / 2);
        shape.lineTo(W / 2, -H / 2);
        shape.lineTo(W / 2, H / 2);
        shape.lineTo(-W / 2, H / 2);
        shape.closePath();

        for (const o of [MAIN, FIRE, DRAWER]) {
            shape.holes.push(
                roundedRectPath(-o.x, o.y0, o.x * 2, o.y1 - o.y0, 0.01),
            );
        }

        return new THREE.ExtrudeGeometry(shape, {
            depth: T,
            bevelEnabled: false,
        });
    }, []);

    // Grilles maille fine des étagères.
    const rackAlpha = useMemo(() => {
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
    }, []);

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

    // Vrai logo du site (personnalisable dans l'admin), couleurs d'origine
    // conservées : lisible sur la plaque crème.
    const plateLogo = useLogoTexture(false);

    return (
        <group position={[0, LEG + H / 2, 0]}>
            {/* Façade percée */}
            <mesh
                geometry={frontGeo}
                material={bordeaux}
                position={[0, 0, D / 2 - T]}
            />

            {/* Parois arrière, latérales, fond et dessus */}
            <mesh material={bordeaux} position={[0, 0, -(D / 2 - T / 2)]}>
                <boxGeometry args={[W, H, T]} />
            </mesh>
            <mesh material={bordeaux} position={[W / 2 - T / 2, 0, 0]}>
                <boxGeometry args={[T, H, D]} />
            </mesh>
            <mesh material={bordeaux} position={[-(W / 2 - T / 2), 0, 0]}>
                <boxGeometry args={[T, H, D]} />
            </mesh>
            <mesh material={innerDark} position={[0, -(H / 2 - T / 2), 0]}>
                <boxGeometry args={[W, T, D]} />
            </mesh>
            <mesh material={bordeaux} position={[0, H / 2 - T / 2, 0]}>
                <boxGeometry args={[W, T, D]} />
            </mesh>

            {/* Cheminée centrée */}
            <mesh material={bordeaux} position={[0, H / 2 + 0.07, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.14, 24, 1, true]} />
            </mesh>
            <mesh
                material={innerDark}
                position={[0, H / 2 + 0.139, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.045, 24]} />
            </mesh>

            {/* Rail à crochets en haut de la chambre */}
            <mesh
                material={chrome}
                position={[0, 0.545, 0.02]}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.009, 0.009, W - 0.08, 16]} />
            </mesh>
            {[-0.12, -0.04, 0.05, 0.13].map((x) => (
                <group key={x} position={[x, 0.545, 0.02]}>
                    <mesh material={chrome} position={[0, -0.026, 0]}>
                        <cylinderGeometry args={[0.0035, 0.0035, 0.05, 8]} />
                    </mesh>
                    <mesh
                        material={chrome}
                        position={[0, -0.055, 0]}
                        rotation={[Math.PI / 2, 0, Math.PI]}
                    >
                        <torusGeometry args={[0.011, 0.003, 8, 12, Math.PI]} />
                    </mesh>
                </group>
            ))}

            {/* Deux grilles maille sur cornières */}
            {[0.3, 0.02].map((y) => (
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

            {/* Cloison chambre / foyer, puis sole du foyer */}
            <mesh material={innerDark} position={[0, -0.16, 0]}>
                <boxGeometry args={[W - 2 * T, T, D - 2 * T]} />
            </mesh>
            <mesh material={innerDark} position={[0, -0.47, 0]}>
                <boxGeometry args={[W - 2 * T, T, D - 2 * T]} />
            </mesh>

            {/* Tiroir à cendres bleu, à demi tiré */}
            <group position={[0, -0.56, 0.24]}>
                <mesh material={blue}>
                    <boxGeometry args={[0.4, 0.1, 0.34]} />
                </mesh>
                <mesh material={innerDark} position={[0, 0.012, 0]}>
                    <boxGeometry args={[0.37, 0.08, 0.31]} />
                </mesh>
                {/* Poignée en creux du bandeau avant */}
                <mesh material={blue} position={[0, -0.01, 0.174]}>
                    <boxGeometry args={[0.13, 0.032, 0.014]} />
                </mesh>
                <mesh material={innerDark} position={[0, -0.008, 0.172]}>
                    <boxGeometry args={[0.1, 0.016, 0.02]} />
                </mesh>
            </group>

            {/* Verrous chromés sur le montant droit */}
            {[0.25, -0.3].map((y) => (
                <group key={y} position={[0.245, y, D / 2 + 0.006]}>
                    <mesh material={chrome}>
                        <boxGeometry args={[0.022, 0.05, 0.012]} />
                    </mesh>
                    <mesh
                        material={chrome}
                        position={[-0.02, 0.008, 0.006]}
                        rotation={[0, 0, Math.PI / 2]}
                    >
                        <cylinderGeometry args={[0.005, 0.005, 0.05, 10]} />
                    </mesh>
                </group>
            ))}

            {/* Porte taupe à deux panneaux, charnières à gauche */}
            <group
                position={[-W / 2, 0, D / 2 - 0.005]}
                rotation={[0, -Math.PI * 0.55, 0]}
            >
                {/* Panneau haut (chambre) avec plaque logo crème */}
                <mesh material={taupe} position={[0.25, 0.24, 0]}>
                    <boxGeometry args={[0.5, 0.78, T]} />
                </mesh>
                <mesh material={cream} position={[0.25, 0.47, T / 2 + 0.004]}>
                    <boxGeometry args={[0.17, 0.115, 0.008]} />
                </mesh>
                {plateLogo && (
                    <mesh position={[0.25, 0.47, T / 2 + 0.0085]}>
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

                {/* Bande inox entre les deux panneaux */}
                <mesh material={chrome} position={[0.25, -0.165, 0]}>
                    <boxGeometry args={[0.5, 0.014, T + 0.002]} />
                </mesh>

                {/* Panneau bas (foyer) */}
                <mesh material={taupe} position={[0.25, -0.33, 0]}>
                    <boxGeometry args={[0.5, 0.3, T]} />
                </mesh>

                {/* Charnières */}
                {[0.4, 0.05, -0.35].map((y) => (
                    <mesh
                        key={y}
                        material={chrome}
                        position={[0.004, y, T / 2 + 0.004]}
                    >
                        <boxGeometry args={[0.018, 0.045, 0.012]} />
                    </mesh>
                ))}
            </group>

            {/* Pieds carrés */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <mesh
                        key={`${sx}-${sz}`}
                        material={bordeaux}
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

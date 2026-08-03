import { useMemo } from 'react';
import * as THREE from 'three';
import { panelShape, roundedRectPath, useLogoTexture } from './shared';

// Dimensions en mètres, relevées sur les rendus CAO du barbecue.
const W = 1.05; // largeur de la cuve
const D = 0.54; // profondeur
const BOX_H = 0.24; // hauteur de la cuve
const T = 0.012; // épaisseur de tôle
const LEG_H = 0.74; // hauteur du piètement
const LEG_S = 0.042; // section carrée des tubes

const SLOT_W = 0.5; // fente frontale (passage du bac charbon)
const TRAY_Y = BOX_H / 2 - 0.06; // fond du bac charbon rouge
const CROSS_Y = -BOX_H / 2 - LEG_H + 0.26; // entretoises basses

/**
 * Barbecue Majestic Pro reproduit d'après ses rendus CAO : cuve grise à
 * fente frontale, bac charbon rouge perforé coulissant à poignées plates,
 * grille inox à fines fentes sur une moitié, logo gravé en façade,
 * piètement pliant bleu acier à diagonales et double plateau noir en
 * étagère basse.
 */
export function MajesticProModel() {
    const grey = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#8f979f',
                metalness: 0.5,
                roughness: 0.42,
            }),
        [],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#242628',
                metalness: 0.25,
                roughness: 0.85,
            }),
        [],
    );

    // Même bleu acier que le tiroir du fumoir : palette CAO commune.
    const blue = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#7d99b8',
                metalness: 0.4,
                roughness: 0.45,
            }),
        [],
    );

    const red = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#a63b3e',
                metalness: 0.35,
                roughness: 0.5,
            }),
        [],
    );

    const brace = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#cfd2d4',
                metalness: 0.7,
                roughness: 0.35,
            }),
        [],
    );

    const black = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#1d1d1f',
                metalness: 0.3,
                roughness: 0.6,
            }),
        [],
    );

    // Bac charbon rouge : rangées de trous ronds en quinconce.
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

    const redPerf = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#a63b3e',
                metalness: 0.35,
                roughness: 0.5,
                alphaMap: holesAlpha,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            }),
        [holesAlpha],
    );

    // Grille inox : fines fentes parallèles.
    const grateAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#000';

            for (let y = 10; y < 512 - 8; y += 14) {
                ctx.fillRect(14, y, 512 - 28, 4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    const grate = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#c9cbc6',
                metalness: 0.8,
                roughness: 0.28,
                alphaMap: grateAlpha,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            }),
        [grateAlpha],
    );

    // Façade : fente basse pour sortir le bac charbon.
    const frontGeo = useMemo(() => {
        const shape = panelShape(W, BOX_H);
        shape.holes.push(
            roundedRectPath(-SLOT_W / 2, -BOX_H / 2 + 0.02, SLOT_W, 0.045, 0.008),
        );

        return new THREE.ExtrudeGeometry(shape, {
            depth: T,
            bevelEnabled: false,
        });
    }, []);

    // Poignée plate rouge à ouverture oblongue (bac et grille).
    const handleGeo = useMemo(() => {
        const shape = panelShape(0.2, 0.12);
        shape.holes.push(roundedRectPath(-0.06, 0.012, 0.12, 0.032, 0.016));

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.01,
            bevelEnabled: false,
        });
    }, []);

    // Poignée du bac au niveau de la fente frontale.
    const pullGeo = useMemo(() => {
        const shape = panelShape(0.16, 0.06);
        shape.holes.push(roundedRectPath(-0.05, -0.004, 0.1, 0.024, 0.012));

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.01,
            bevelEnabled: false,
        });
    }, []);

    // Vrai logo du site, couleurs d'origine : lisible sur la tôle grise.
    const logo = useLogoTexture(false);

    return (
        <group position={[0, LEG_H + BOX_H / 2, 0]}>
            {/* Cuve grise : façade percée, parois et fond */}
            <mesh
                geometry={frontGeo}
                material={grey}
                position={[0, 0, D / 2 - T]}
            />
            <mesh material={grey} position={[0, 0, -(D / 2 - T / 2)]}>
                <boxGeometry args={[W, BOX_H, T]} />
            </mesh>
            <mesh material={grey} position={[W / 2 - T / 2, 0, 0]}>
                <boxGeometry args={[T, BOX_H, D]} />
            </mesh>
            <mesh material={grey} position={[-(W / 2 - T / 2), 0, 0]}>
                <boxGeometry args={[T, BOX_H, D]} />
            </mesh>
            <mesh material={innerDark} position={[0, -BOX_H / 2 + 0.015, 0]}>
                <boxGeometry args={[W - 2 * T, T, D - 2 * T]} />
            </mesh>

            {/* Gravure du logo en façade, à droite de la fente */}
            {logo && (
                <mesh position={[0.33, 0.01, D / 2 + 0.003]}>
                    {/* Le fichier logo fait 516 × 480 px */}
                    <planeGeometry args={[0.2, 0.2 * (480 / 516)]} />
                    <meshStandardMaterial
                        map={logo}
                        transparent
                        alphaTest={0.15}
                        metalness={0.2}
                        roughness={0.6}
                        polygonOffset
                        polygonOffsetFactor={-1}
                    />
                </mesh>
            )}

            {/* Poignée rouge du bac, devant la fente */}
            <mesh
                geometry={pullGeo}
                material={red}
                position={[0, -BOX_H / 2 + 0.0425, D / 2 + 0.002]}
            />

            {/* Bac charbon rouge perforé, parois puis fond */}
            <mesh material={red} position={[0, BOX_H / 2 - 0.032, (D - 0.08) / 2 - 0.005]}>
                <boxGeometry args={[W - 0.08, 0.055, 0.01]} />
            </mesh>
            <mesh material={red} position={[0, BOX_H / 2 - 0.032, -((D - 0.08) / 2 - 0.005)]}>
                <boxGeometry args={[W - 0.08, 0.055, 0.01]} />
            </mesh>
            <mesh material={red} position={[(W - 0.08) / 2 - 0.005, BOX_H / 2 - 0.032, 0]}>
                <boxGeometry args={[0.01, 0.055, D - 0.08]} />
            </mesh>
            <mesh material={red} position={[-((W - 0.08) / 2 - 0.005), BOX_H / 2 - 0.032, 0]}>
                <boxGeometry args={[0.01, 0.055, D - 0.08]} />
            </mesh>
            <mesh
                material={redPerf}
                position={[0, TRAY_Y, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[W - 0.08, D - 0.08]} />
            </mesh>

            {/* Poignée du bac, moitié droite laissée découverte */}
            <mesh
                geometry={handleGeo}
                material={red}
                position={[W / 4 + 0.01, BOX_H / 2, -0.005]}
            />

            {/* Grille inox sur la moitié gauche, avec sa poignée */}
            <mesh
                material={grate}
                position={[-W / 4, BOX_H / 2 - 0.012, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[W / 2 - 0.07, D - 0.1]} />
            </mesh>
            <mesh
                geometry={handleGeo}
                material={red}
                position={[-W / 4, BOX_H / 2 + 0.048, -0.005]}
            />

            {/* Cadre supérieur bleu du piètement, sous la cuve */}
            <mesh material={blue} position={[0, -BOX_H / 2 - 0.02, D / 2 - 0.09]}>
                <boxGeometry args={[W - 0.14, 0.04, 0.04]} />
            </mesh>
            <mesh material={blue} position={[0, -BOX_H / 2 - 0.02, -(D / 2 - 0.09)]}>
                <boxGeometry args={[W - 0.14, 0.04, 0.04]} />
            </mesh>
            <mesh material={blue} position={[W / 2 - 0.09, -BOX_H / 2 - 0.02, 0]}>
                <boxGeometry args={[0.04, 0.04, D - 0.14]} />
            </mesh>
            <mesh material={blue} position={[-(W / 2 - 0.09), -BOX_H / 2 - 0.02, 0]}>
                <boxGeometry args={[0.04, 0.04, D - 0.14]} />
            </mesh>

            {/* Pieds en tube carré */}
            {[1, -1].map((sx) =>
                [1, -1].map((sz) => (
                    <mesh
                        key={`${sx}-${sz}`}
                        material={blue}
                        position={[
                            sx * (W / 2 - 0.09),
                            -BOX_H / 2 - LEG_H / 2,
                            sz * (D / 2 - 0.09),
                        ]}
                    >
                        <boxGeometry args={[LEG_S, LEG_H, LEG_S]} />
                    </mesh>
                )),
            )}

            {/* Entretoises basses des cadres d'extrémité */}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={blue}
                    position={[sx * (W / 2 - 0.09), CROSS_Y, 0]}
                >
                    <boxGeometry args={[0.036, 0.036, D - 0.18]} />
                </mesh>
            ))}

            {/* Diagonales fines du mécanisme pliant */}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={brace}
                    position={[sx * (W / 2 - 0.09), -BOX_H / 2 - 0.25, 0]}
                    rotation={[0.66 * sx, 0, 0]}
                >
                    <cylinderGeometry args={[0.005, 0.005, 0.58, 10]} />
                </mesh>
            ))}

            {/* Double plateau noir articulé, posé en étagère basse */}
            <group position={[0, CROSS_Y + 0.024, 0]}>
                <mesh material={black}>
                    <boxGeometry args={[W - 0.26, 0.012, D - 0.2]} />
                </mesh>
                <mesh material={black} position={[0, 0.016, (D - 0.2) / 2 - 0.005]}>
                    <boxGeometry args={[W - 0.26, 0.03, 0.01]} />
                </mesh>
                <mesh material={black} position={[0, 0.016, -((D - 0.2) / 2 - 0.005)]}>
                    <boxGeometry args={[W - 0.26, 0.03, 0.01]} />
                </mesh>
                <mesh material={black} position={[(W - 0.26) / 2 - 0.005, 0.016, 0]}>
                    <boxGeometry args={[0.01, 0.03, D - 0.22]} />
                </mesh>
                <mesh material={black} position={[-((W - 0.26) / 2 - 0.005), 0.016, 0]}>
                    <boxGeometry args={[0.01, 0.03, D - 0.22]} />
                </mesh>
                {/* Charnière centrale des deux plateaux */}
                <mesh material={black} position={[0, 0.011, 0]}>
                    <boxGeometry args={[0.012, 0.018, D - 0.2]} />
                </mesh>
            </group>
        </group>
    );
}

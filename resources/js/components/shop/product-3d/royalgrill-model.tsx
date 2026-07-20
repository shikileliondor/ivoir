import { useMemo } from 'react';
import * as THREE from 'three';
import { LogoDecal } from './shared';

// Dimensions en mètres, d'après la photo produit (brasero bas).
const PLATE_W = 0.44; // largeur d'un plateau doré
const PLATE_D = 0.56; // profondeur des plateaux
const TOP_Y = 0.3; // hauteur du plan de cuisson
const T = 0.012; // épaisseur de tôle

/**
 * Barbecue RoyalGrill reproduit d'après sa photo : brasero bas à deux
 * plateaux dorés fendus (fentes longues + losanges aux angles), flancs
 * noirs anguleux à encoche formant les pieds, et logo gravé à plat sur
 * le plateau gauche.
 */
export function RoyalGrillModel() {
    const black = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#1d1b19',
                metalness: 0.6,
                roughness: 0.42,
            }),
        [],
    );

    const gold = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#c7ac62',
                metalness: 0.7,
                roughness: 0.38,
            }),
        [],
    );

    const innerDark = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#141210',
                metalness: 0.3,
                roughness: 0.9,
            }),
        [],
    );

    // Plateau doré : fentes longues en travers + losanges aux angles.
    const plateAlpha = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';

            // Fentes horizontales.
            for (let y = 100; y <= 540; y += 34) {
                ctx.beginPath();
                ctx.roundRect(70, y, 372, 13, 6);
                ctx.fill();
            }

            // Losanges aux quatre angles.
            for (const [cx, cy] of [
                [60, 60],
                [452, 60],
                [60, 580],
                [452, 580],
            ]) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-17, -17, 34, 34);
                ctx.restore();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        return texture;
    }, []);

    const plateMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#c7ac62',
                metalness: 0.7,
                roughness: 0.38,
                alphaMap: plateAlpha,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            }),
        [plateAlpha],
    );

    // Flanc noir anguleux : trapèze avec encoche en V formant deux pieds.
    const sideGeo = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-0.3, 0.15);
        shape.lineTo(0.3, 0.15);
        shape.lineTo(0.37, -0.15);
        shape.lineTo(0.22, -0.15);
        shape.lineTo(0, 0.03);
        shape.lineTo(-0.22, -0.15);
        shape.lineTo(-0.37, -0.15);
        shape.closePath();

        return new THREE.ExtrudeGeometry(shape, {
            depth: T,
            bevelEnabled: false,
        });
    }, []);

    return (
        <group>
            {/* Plateaux dorés fendus */}
            {[1, -1].map((sx) => (
                <mesh
                    key={sx}
                    material={plateMaterial}
                    position={[sx * (PLATE_W / 2 + 0.008), TOP_Y, 0]}
                    rotation={[-Math.PI / 2, 0, sx === 1 ? 0 : Math.PI]}
                >
                    <planeGeometry args={[PLATE_W, PLATE_D]} />
                </mesh>
            ))}

            {/* Logo gravé à plat sur le plateau gauche */}
            <LogoDecal
                width={0.15}
                position={[-PLATE_W / 2, TOP_Y + 0.002, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            />

            {/* Sous-plaque sombre : les découpes laissent voir l'intérieur
                de la cuve, pas le fond de la page */}
            <mesh
                material={innerDark}
                position={[0, TOP_Y - 0.025, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[PLATE_W * 2 + 0.02, PLATE_D]} />
            </mesh>

            {/* Cadre central sous les plateaux */}
            <mesh material={black} position={[0, TOP_Y - 0.035, 0]}>
                <boxGeometry args={[0.06, 0.07, PLATE_D - 0.04]} />
            </mesh>

            {/* Cuve basse sous le plan de cuisson */}
            <mesh material={innerDark} position={[0, TOP_Y - 0.09, 0]}>
                <boxGeometry args={[PLATE_W * 2 - 0.1, 0.1, PLATE_D - 0.12]} />
            </mesh>

            {/* Flancs noirs anguleux (pieds intégrés) */}
            <mesh
                geometry={sideGeo}
                material={black}
                position={[PLATE_W + 0.02, 0.15, 0]}
                rotation={[0, -Math.PI / 2, 0]}
            />
            <mesh
                geometry={sideGeo}
                material={black}
                position={[-(PLATE_W + 0.02) + T, 0.15, 0]}
                rotation={[0, -Math.PI / 2, 0]}
            />

            {/* Traverses avant/arrière entre les flancs */}
            {[1, -1].map((sz) => (
                <mesh
                    key={sz}
                    material={black}
                    position={[0, TOP_Y - 0.05, sz * (PLATE_D / 2 - 0.05)]}
                >
                    <boxGeometry args={[PLATE_W * 2, 0.04, T]} />
                </mesh>
            ))}

            {/* Gravure du logo sur la traverse avant */}
            <LogoDecal
                width={0.09}
                position={[0, TOP_Y - 0.05, PLATE_D / 2 - 0.05 + T / 2 + 0.001]}
            />

            {/* Barre d'assise dorée entre les deux plateaux */}
            <mesh material={gold} position={[0, TOP_Y + 0.001, 0]}>
                <boxGeometry args={[0.016, 0.008, PLATE_D]} />
            </mesh>
        </group>
    );
}

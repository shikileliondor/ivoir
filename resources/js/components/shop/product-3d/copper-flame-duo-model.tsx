import { useMemo } from 'react';
import * as THREE from 'three';
import { LogoDecal } from './shared';

// Dimensions en mètres, d'après les rendus CAO du produit.
const BODY_W = 0.95; // largeur du caisson
const BODY_D = 0.45; // profondeur
const BODY_H = 0.3; // hauteur du caisson
const BODY_Y = 0.3; // altitude du bas du caisson
const RIM_W = 0.5; // largeur du carré supérieur d'une cuve
const BASE_W = 0.26; // largeur à la base d'une cuve
const FUNNEL_H = 0.28; // profondeur d'une cuve
const FUNNEL_X = 0.25; // écart du centre de chaque cuve
const T = 0.012; // épaisseur de tôle

// Trous ronds de la façade où s'insèrent les ensembles brûleurs.
const PORT_X = [-0.27, 0.2];
const PORT_R = 0.026;

/**
 * Foyer à gaz Copper Flame Duo reproduit d'après ses rendus CAO : deux
 * cuves évasées profondes qui se touchent au centre (goussets et rampe
 * percée à l'intérieur), ensembles brûleurs rouges insérés dans les trous
 * ronds de la façade, logo laser sous le pli en V, six pieds carrés à
 * semelles pyramidales.
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

    const innerWall = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#171513',
                metalness: 0.35,
                roughness: 0.75,
                side: THREE.BackSide,
            }),
        [],
    );

    const red = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#b3242a',
                metalness: 0.55,
                roughness: 0.35,
            }),
        [],
    );

    // Rayons centre → coin pour les cônes à 4 segments (section carrée).
    const rimR = (RIM_W / 2) * Math.SQRT2;
    const baseR = (BASE_W / 2) * Math.SQRT2;

    const funnelBaseY = BODY_Y + BODY_H;
    const rimY = funnelBaseY + FUNNEL_H;
    const portY = BODY_Y + BODY_H * 0.5;

    // Façade percée des deux passages de brûleur.
    const frontGeo = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-BODY_W / 2, -BODY_H / 2);
        shape.lineTo(BODY_W / 2, -BODY_H / 2);
        shape.lineTo(BODY_W / 2, BODY_H / 2);
        shape.lineTo(-BODY_W / 2, BODY_H / 2);
        shape.closePath();

        for (const px of PORT_X) {
            const hole = new THREE.Path();
            hole.absarc(px, 0, PORT_R, 0, Math.PI * 2, true);
            shape.holes.push(hole);
        }

        return new THREE.ExtrudeGeometry(shape, {
            depth: T,
            bevelEnabled: false,
        });
    }, []);

    // Ensemble brûleur : anneau rouge à plat sur son trou de façade, tube
    // courant le long de la façade vers la gauche, molette disque et
    // embout à son extrémité (comme sur les rendus).
    const burnerAssembly = (x: number) => (
        <group key={x} position={[x, portY, BODY_D / 2 + 0.032]}>
            {/* Embase traversant le trou de façade */}
            <mesh
                material={red}
                position={[0, 0, -0.018]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
            </mesh>
            <mesh material={red}>
                <torusGeometry args={[0.033, 0.012, 12, 28]} />
            </mesh>
            <mesh material={red} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.019, 0.019, 0.024, 16]} />
            </mesh>
            <mesh
                material={red}
                position={[-0.155, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.008, 0.008, 0.24, 12]} />
            </mesh>
            <mesh
                material={red}
                position={[-0.29, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.027, 0.027, 0.014, 20]} />
            </mesh>
            <mesh
                material={red}
                position={[-0.315, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.006, 0.006, 0.03, 10]} />
            </mesh>
        </group>
    );

    return (
        <group>
            {/* Caisson — façade percée, autres parois pleines */}
            <mesh
                geometry={frontGeo}
                material={black}
                position={[0, BODY_Y + BODY_H / 2, BODY_D / 2 - T]}
            />
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
            {/* Dessus du caisson entre et autour des cuves */}
            <mesh material={black} position={[0, funnelBaseY - 0.005, 0]}>
                <boxGeometry args={[BODY_W, 0.01, BODY_D]} />
            </mesh>

            {/* Pli en V sous la jonction des cuves + logo laser en façade */}
            {[1, -1].map((s) => (
                <mesh
                    key={s}
                    material={black}
                    position={[
                        s * 0.055,
                        BODY_Y + BODY_H - 0.035,
                        BODY_D / 2 + 0.002,
                    ]}
                    rotation={[0, 0, s * 0.6]}
                >
                    <boxGeometry args={[0.13, 0.007, 0.004]} />
                </mesh>
            ))}
            <LogoDecal
                width={0.24}
                position={[0, BODY_Y + BODY_H * 0.42, BODY_D / 2 + 0.001]}
            />

            {/* Ensembles brûleurs rouges */}
            {PORT_X.map((px) => burnerAssembly(px))}

            {/* Deux cuves évasées profondes */}
            {[1, -1].map((sx) => (
                <group key={sx} position={[sx * FUNNEL_X, 0, 0]}>
                    {/* Paroi externe puis paroi interne (légèrement en retrait) */}
                    <mesh
                        material={black}
                        position={[0, funnelBaseY + FUNNEL_H / 2, 0]}
                        rotation={[0, Math.PI / 4, 0]}
                    >
                        <cylinderGeometry
                            args={[rimR, baseR, FUNNEL_H, 4, 1, true]}
                        />
                    </mesh>
                    <mesh
                        material={innerWall}
                        position={[0, funnelBaseY + FUNNEL_H / 2 - 0.008, 0]}
                        rotation={[0, Math.PI / 4, 0]}
                    >
                        <cylinderGeometry
                            args={[
                                rimR - 0.012,
                                baseR - 0.012,
                                FUNNEL_H,
                                4,
                                1,
                                true,
                            ]}
                        />
                    </mesh>

                    {/* Fin liseré du bord de tôle supérieur */}
                    <mesh
                        material={black}
                        position={[0, rimY + 0.002, 0]}
                        rotation={[0, Math.PI / 4, 0]}
                    >
                        <cylinderGeometry
                            args={[rimR + 0.004, rimR + 0.004, 0.006, 4, 1, true]}
                        />
                    </mesh>

                    {/* Fond de cuve et rampe de brûleur percée */}
                    <mesh
                        material={innerDark}
                        position={[0, funnelBaseY + 0.004, 0]}
                    >
                        <boxGeometry args={[BASE_W, 0.008, BASE_W]} />
                    </mesh>
                    <mesh
                        material={innerDark}
                        position={[0, funnelBaseY + 0.035, 0]}
                    >
                        <boxGeometry args={[0.07, 0.06, BASE_W - 0.01]} />
                    </mesh>

                    {/* Goussets porte-marmite aux coins des parois internes */}
                    {[0, 1, 2, 3].map((i) => {
                        const angle = (i * Math.PI) / 2 + Math.PI / 4;
                        const r = 0.26;

                        return (
                            <mesh
                                key={i}
                                material={innerDark}
                                position={[
                                    Math.sin(angle) * r,
                                    rimY - 0.045,
                                    Math.cos(angle) * r,
                                ]}
                                rotation={[0, angle + Math.PI / 4, 0]}
                            >
                                <boxGeometry args={[0.055, 0.008, 0.055]} />
                            </mesh>
                        );
                    })}
                </group>
            ))}

            {/* Éclairage d'appoint pour les cuves */}
            <pointLight
                color="#fff2df"
                position={[0, 1.3, 0.3]}
                intensity={0.8}
                distance={2.4}
                decay={2}
            />

            {/* Six montants extérieurs, du sol à la base des cuves,
                à semelles pyramidales */}
            {[-1, 0, 1].map((sx) =>
                [1, -1].map((sz) => (
                    <group
                        key={`${sx}-${sz}`}
                        position={[
                            sx * (BODY_W / 2 - 0.02),
                            0,
                            sz * (BODY_D / 2 + 0.014),
                        ]}
                    >
                        <mesh
                            material={black}
                            position={[0, 0.064 + (funnelBaseY - 0.064) / 2, 0]}
                        >
                            <boxGeometry
                                args={[0.05, funnelBaseY - 0.064, 0.026]}
                            />
                        </mesh>
                        <mesh
                            material={black}
                            position={[0, 0.032, 0]}
                            rotation={[0, Math.PI / 4, 0]}
                        >
                            <cylinderGeometry args={[0.036, 0.095, 0.064, 4]} />
                        </mesh>
                    </group>
                )),
            )}
        </group>
    );
}

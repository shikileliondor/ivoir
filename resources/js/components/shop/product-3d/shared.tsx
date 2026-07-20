import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { getLogoSource } from './logo-source';

/** Rectangle arrondi utilisable comme trou de découpe laser. */
export function roundedRectPath(
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

/** Panneau rectangulaire centré, prêt à recevoir des trous. */
export function panelShape(width: number, height: number): THREE.Shape {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.closePath();

    return shape;
}

/** Languette de flamme ondulée (découpe laser du logo). */
export function flamePath(
    cx: number,
    cy: number,
    h: number,
    lean: number,
): THREE.Path {
    const w = h * 0.32;
    const path = new THREE.Path();
    path.moveTo(cx, cy - h / 2);
    path.bezierCurveTo(
        cx + w * 0.6,
        cy - h * 0.15,
        cx + w * (0.35 + lean),
        cy + h * 0.2,
        cx + lean * w,
        cy + h / 2,
    );
    path.bezierCurveTo(
        cx - w * (0.35 - lean),
        cy + h * 0.1,
        cx - w * 0.55,
        cy - h * 0.2,
        cx,
        cy - h / 2,
    );

    return path;
}

/**
 * Charge le logo du site (personnalisable dans l'admin) et le prépare pour
 * la gravure sur tôle : fond blanc rendu transparent, gris du texte
 * éclairci en teinte sable pour rester lisible sur l'acier sombre, flamme
 * orange conservée. Retourne null tant que l'image n'est pas prête.
 */
export function useLogoTexture(): THREE.CanvasTexture | null {
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

    useEffect(() => {
        let cancelled = false;
        const img = new Image();
        img.src = getLogoSource();

        img.onload = () => {
            if (cancelled) {
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return;
            }

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
            );
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] === 0) {
                    continue;
                }

                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Fond blanc → transparent.
                if (r > 232 && g > 232 && b > 232) {
                    data[i + 3] = 0;
                    continue;
                }

                // Texte gris (faible saturation) → sable clair.
                if (Math.max(r, g, b) - Math.min(r, g, b) < 40) {
                    data[i] = 216;
                    data[i + 1] = 208;
                    data[i + 2] = 196;
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const canvasTexture = new THREE.CanvasTexture(canvas);
            canvasTexture.anisotropy = 8;
            canvasTexture.colorSpace = THREE.SRGBColorSpace;
            setTexture(canvasTexture);
        };

        return () => {
            cancelled = true;
        };
    }, []);

    return texture;
}

interface LogoDecalProps {
    /** Largeur du logo en mètres. */
    width?: number;
    position: [number, number, number];
    rotation?: [number, number, number];
}

/**
 * Logo IvoirCuisson plaqué sur une surface du modèle (l'équivalent de la
 * gravure laser des vrais produits). À positionner à ~1 mm au-dessus de
 * la tôle pour éviter le z-fighting.
 */
export function LogoDecal({
    width = 0.24,
    position,
    rotation = [0, 0, 0],
}: LogoDecalProps) {
    const texture = useLogoTexture();

    if (!texture) {
        return null;
    }

    // Le fichier logo est légèrement plus large que haut (516 × 480).
    const height = width * (480 / 516);

    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial
                map={texture}
                transparent
                alphaTest={0.15}
                metalness={0.35}
                roughness={0.55}
                polygonOffset
                polygonOffsetFactor={-1}
            />
        </mesh>
    );
}

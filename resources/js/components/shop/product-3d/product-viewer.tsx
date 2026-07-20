import {
    ContactShadows,
    Environment,
    Lightformer,
    OrbitControls,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import type { ComponentType } from 'react';
import { AuroraSmokerModel } from './aurora-smoker-model';
import { BaronModel } from './baron-model';
import { CopperFlameDuoModel } from './copper-flame-duo-model';
import { CopperFlameModel } from './copper-flame-model';
import { EclipseBoxModel } from './eclipse-box-model';
import { ExplorerModel } from './explorer-model';
import { MajesticProModel } from './majestic-pro-model';
import { RoyalGrillModel } from './royalgrill-model';

interface ModelEntry {
    Component: ComponentType;
    /** Décalage vertical pour centrer le produit dans le cadre. */
    yOffset: number;
    camera: [number, number, number];
    minDistance: number;
    maxDistance: number;
}

const MODELS: Record<string, ModelEntry> = {
    'barbecue-majestic-pro': {
        Component: MajesticProModel,
        yOffset: -0.62,
        camera: [1.9, 0.7, 2.0],
        minDistance: 1.4,
        maxDistance: 3.6,
    },
    'barbecue-baron': {
        Component: BaronModel,
        yOffset: -0.5,
        camera: [2.0, 0.85, 2.0],
        minDistance: 1.4,
        maxDistance: 3.8,
    },
    'barbecue-eclipse-box': {
        Component: EclipseBoxModel,
        yOffset: -0.5,
        camera: [1.7, 0.75, 1.7],
        minDistance: 1.1,
        maxDistance: 3,
    },
    'barbecue-explorer-flame-portable': {
        Component: ExplorerModel,
        yOffset: -0.55,
        camera: [1.9, 0.7, 1.9],
        minDistance: 1.3,
        maxDistance: 3.6,
    },
    'barbecue-royalgrill': {
        Component: RoyalGrillModel,
        yOffset: -0.16,
        camera: [1.4, 0.75, 1.4],
        minDistance: 0.8,
        maxDistance: 2.6,
    },
    'foyer-a-gaz-copper-flame': {
        Component: CopperFlameModel,
        yOffset: -0.35,
        camera: [0.85, 1.0, 0.85],
        minDistance: 0.7,
        maxDistance: 2.4,
    },
    'foyer-a-gaz-copper-flame-duo': {
        Component: CopperFlameDuoModel,
        yOffset: -0.33,
        camera: [1.05, 0.85, 1.05],
        minDistance: 0.8,
        maxDistance: 2.6,
    },
    'fumoir-aurora-smoker': {
        Component: AuroraSmokerModel,
        yOffset: -0.76,
        camera: [1.75, 0.6, 2.3],
        minDistance: 1.5,
        maxDistance: 4,
    },
};

/**
 * Viewer 3D produit : éclairage studio procédural (aucun asset externe),
 * rotation automatique lente jusqu'à la première interaction, orbite
 * contrainte au-dessus du sol. Chargé en lazy — ne jamais importer ce
 * fichier statiquement depuis une page.
 */
export default function ProductViewer({ slug }: { slug: string }) {
    const entry = MODELS[slug];
    const [autoRotate, setAutoRotate] = useState(true);

    if (!entry) {
        return null;
    }

    const {
        Component: Model,
        yOffset,
        camera,
        minDistance,
        maxDistance,
    } = entry;

    return (
        <div className="relative size-full">
            <Canvas dpr={[1, 1.75]} camera={{ position: camera, fov: 32 }}>
                <ambientLight intensity={0.5} />
                <hemisphereLight
                    intensity={0.6}
                    color="#fff3e2"
                    groundColor="#40332a"
                />
                <spotLight
                    position={[3, 4, 2]}
                    angle={0.5}
                    penumbra={0.6}
                    intensity={90}
                    color="#fff4e4"
                />
                <directionalLight
                    position={[-3, 2, -2]}
                    intensity={1.8}
                    color="#ffd9b0"
                />
                <directionalLight
                    position={[0, 1, 4]}
                    intensity={0.9}
                    color="#fff8f0"
                />

                <group position={[0, yOffset, 0]}>
                    <Model />
                    <ContactShadows
                        position={[0, 0.001, 0]}
                        opacity={0.55}
                        scale={3}
                        blur={2.4}
                        far={1.1}
                    />
                </group>

                {/* Reflets studio sur l'acier, générés sans requête réseau */}
                <Environment resolution={256}>
                    <Lightformer
                        intensity={5}
                        position={[0, 2, 3]}
                        scale={[3, 2, 1]}
                    />
                    <Lightformer
                        intensity={3}
                        color="#ffb27d"
                        position={[-3, 1, -1]}
                        scale={[2, 2, 1]}
                    />
                    <Lightformer
                        intensity={2.5}
                        position={[3, 0.5, -2]}
                        scale={[2, 3, 1]}
                    />
                </Environment>

                <OrbitControls
                    enablePan={false}
                    enableDamping
                    minDistance={minDistance}
                    maxDistance={maxDistance}
                    maxPolarAngle={Math.PI / 2 + 0.04}
                    target={[0, 0, 0]}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1.1}
                    onStart={() => setAutoRotate(false)}
                />
            </Canvas>

            <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.25em] whitespace-nowrap text-smoke-300/60 uppercase">
                Glissez pour pivoter · Molette pour zoomer
            </p>
        </div>
    );
}

"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatedHuman,
  getEmptyHumanModelDebug,
  humanModelPath,
  type HumanModelDebug,
} from "@/components/human-animation/AnimatedHuman";

const showModelBounds = true;
const missingModelMessage =
  "Missing model: place human.glb at /public/models/human/human.glb";

type ModelStatus = "checking" | "available" | "missing" | "failed";

export function HumanAnimationScene() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>("checking");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modelDebug, setModelDebug] = useState<HumanModelDebug>(
    getEmptyHumanModelDebug(showModelBounds),
  );

  useEffect(() => {
    let isCancelled = false;

    async function checkModelFile() {
      setModelStatus("checking");
      setLoadError(null);
      setModelDebug(getEmptyHumanModelDebug(showModelBounds));

      try {
        const response = await fetch(humanModelPath, {
          cache: "no-store",
          method: "HEAD",
        });

        if (!isCancelled) {
          setModelStatus(response.ok ? "available" : "missing");
        }
      } catch {
        if (!isCancelled) setModelStatus("missing");
      }
    }

    void checkModelFile();

    return () => {
      isCancelled = true;
    };
  }, []);

  const canRenderModel = modelStatus === "available" && !loadError;

  return (
    <div className="relative h-screen min-h-[640px] w-full overflow-hidden bg-neutral-100">
      <Canvas
        className="h-screen w-full"
        camera={{
          position: [3, 2, 5],
          fov: 45,
        }}
        shadows
      >
        <CameraTarget />
        <color attach="background" args={["#f5f5f5"]} />
        <ambientLight intensity={1.1} />
        <directionalLight castShadow position={[4, 5, 4]} intensity={1.6} />
        <directionalLight position={[-3, 2.5, -3]} intensity={0.55} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#e7e7e2" roughness={0.9} />
        </mesh>

        <DebugMarker />

        {canRenderModel && (
          <ModelErrorBoundary
            key={humanModelPath}
            onError={(error) => {
              setModelStatus("failed");
              setLoadError(error.message);
              setModelDebug(getEmptyHumanModelDebug(showModelBounds));
            }}
          >
            <Suspense fallback={<ModelLoadingMarker />}>
              <AnimatedHuman
                showModelBounds={showModelBounds}
                onDebugChange={setModelDebug}
              />
            </Suspense>
          </ModelErrorBoundary>
        )}

        <OrbitControls makeDefault target={[0, 1, 0]} enablePan={false} />
      </Canvas>

      <div className="pointer-events-none absolute left-5 top-5 max-w-[440px] rounded-2xl border border-white/70 bg-white/75 px-5 py-4 text-sm text-neutral-700 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <h1 className="text-lg font-semibold text-neutral-900">
          Human Animation Lab
        </h1>
        <p className="mt-2 text-neutral-500">Canvas loaded</p>
        <p className="mt-1 text-neutral-500">modelPath {humanModelPath}</p>
        <p className="mt-1 text-neutral-500">
          modelLoaded {modelDebug.modelLoaded ? "true" : "false"}
        </p>
        <p className="mt-1 text-neutral-500">modelStatus {modelStatus}</p>
        {modelStatus === "checking" && (
          <p className="mt-3 text-neutral-500">Checking model file...</p>
        )}
        {modelStatus === "missing" && (
          <p className="mt-3 text-neutral-500">{missingModelMessage}</p>
        )}
        {loadError && (
          <p className="mt-3 text-neutral-500">
            Failed to load model: {loadError}
          </p>
        )}

        <div className="mt-4 grid gap-1 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
          <p>sceneChildrenCount {modelDebug.sceneChildrenCount}</p>
          <p>animationsCount {modelDebug.animationsCount}</p>
          <p>
            animationClipNames{" "}
            {modelDebug.animationClipNames.length > 0
              ? modelDebug.animationClipNames.join(", ")
              : "none"}
          </p>
          <p>modelOriginalHeight {modelDebug.modelOriginalHeight.toFixed(3)}</p>
          <p>modelScale {modelDebug.modelScale.toFixed(3)}</p>
          <p>finalModelHeight {modelDebug.finalModelHeight.toFixed(3)}</p>
          <p>boundsSize {formatVector(modelDebug.modelBoundsSize)}</p>
          <p>boundsCenter {formatVector(modelDebug.modelBoundsCenter)}</p>
          <p>correctionRotation {formatVector(modelDebug.correctionRotation)}</p>
          <p>showModelBounds {modelDebug.showModelBounds ? "true" : "false"}</p>
        </div>
      </div>
    </div>
  );
}

function CameraTarget() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.lookAt(0, 1, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function DebugMarker() {
  return (
    <group position={[-1.5, 0, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="red" roughness={0.45} />
      </mesh>

      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="green" roughness={0.45} />
      </mesh>

      <mesh position={[0, 0.5, -1]}>
        <cylinderGeometry args={[0.16, 0.16, 1, 32]} />
        <meshStandardMaterial color="blue" roughness={0.45} />
      </mesh>
    </group>
  );
}

function ModelLoadingMarker() {
  return (
    <mesh position={[0, 0.85, 0]}>
      <boxGeometry args={[0.18, 0.18, 0.18]} />
      <meshStandardMaterial color="#ff9f1c" roughness={0.4} />
    </mesh>
  );
}

function formatVector(vector: { x: number; y: number; z: number }) {
  return `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z.toFixed(
    2,
  )}`;
}

class ModelErrorBoundary extends Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;

    return this.props.children;
  }
}

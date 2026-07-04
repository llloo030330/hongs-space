"use client";

import { OrbitControls } from "@react-three/drei";
import {
  createRoot,
  events as fiberEvents,
  extend,
  useFrame,
  useThree,
  type RootState,
} from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import {
  CapsuleCharacter,
  type CapsuleDebugState,
} from "@/components/physics-cube/CapsuleCharacter";
import { ControlledCharacter } from "@/components/physics-cube/ControlledCharacter";
import { GlassCube } from "@/components/physics-cube/GlassCube";
import {
  KinematicCubeContainer,
  type CubePhysicsMode,
  type CubeContainerDebugState,
} from "@/components/physics-cube/KinematicCubeContainer";
import { TestBall, type BodyDebugState } from "@/components/physics-cube/TestBall";
import {
  initialCubeTilt,
  maxTiltRadians,
  useCubeTilt,
  type CubeTiltTarget,
  type CubeTilt,
} from "@/components/physics-cube/useCubeTilt";
import {
  useDragCubeController,
  type DragCubeControllerState,
} from "@/components/physics-cube/useDragCubeController";
import { softBoundaryConfig } from "@/components/physics-cube/useSoftBoundaryForce";

extend(THREE as unknown as Parameters<typeof extend>[0]);

type SceneBodyDebugState = BodyDebugState & {
  isResetting?: boolean;
  oldForceLogicDisabled?: boolean;
  isColliding?: boolean;
};

type ObjectMode = "ball" | "capsule" | "controlled-character";

type CanvasDebugState = {
  canvasCreated: boolean;
  canvasFrames: number;
  canvasWidth: number;
  canvasHeight: number;
  drawingBufferWidth: number;
  drawingBufferHeight: number;
  manualConfigureCalls: number;
  manualRenderCalls: number;
  manualRootMounted: boolean;
};

const initialBodyDebug: SceneBodyDebugState = {
  position: { x: 0, y: -1.1, z: 0 },
  humanPosition: { x: 0, y: -1.1, z: 0 },
  linvel: { x: 0, y: 0, z: 0 },
  angvel: { x: 0, y: 0, z: 0 },
  isSleeping: false,
  friction: 0.45,
  restitution: 0,
  linearDamping: 0.8,
  angularDamping: 10,
  horizontalDrag: 3,
  gravityScale: 1,
  isResetting: false,
  horizontalSpeed: 0,
  maxHorizontalSpeed: 1.5,
  angularSpeed: 0,
  maxAngularSpeed: 1.8,
  lowSpeedStopActive: false,
  wakeUpEveryFrame: false,
  debugHumanVisible: false,
  showCollider: false,
  showHuman: true,
  showSilhouetteVolumeDebug: false,
  humanYaw: 0,
  humanScale: 1,
  characterState: "idle",
  bodyLeanX: 0,
  bodyLeanZ: 0,
  controlledVelocity: { x: 0, y: 0, z: 0 },
  slopeDirectionX: 0,
  slopeDirectionZ: 0,
  slopeStrength: 0,
  balanceStress: 0,
  controlledMaxSpeed: 1.3,
  controlledDamping: 3,
  slidePower: 1.92,
  balancePower: 0.7,
  isColliding: false,
  innerLimit: 1.35,
  brakeLimit: 1.55,
  hardLimit: 1.75,
  zoneX: "inner",
  zoneZ: "inner",
  outwardVelocityX: 0,
  outwardVelocityZ: 0,
  wasVelocityAbsorbed: false,
  emergencyCorrectionActive: false,
  boundaryOverflowX: 0,
  boundaryOverflowZ: 0,
  softForce: { x: 0, y: 0, z: 0 },
  isSoftBoundaryActive: false,
};

const initialDragDebug: DragCubeControllerState = {
  ...initialCubeTilt,
  isDragging: false,
  dragDeltaX: 0,
  dragDeltaY: 0,
  dragVelocityX: 0,
  dragVelocityY: 0,
  currentOffsetX: 0,
  currentOffsetY: 0,
  disturbanceStrength: 0,
};

const ignoreDebugUpdate = () => {};

type CubePhysicsContentProps = {
  ballResetCount: number;
  capsuleResetCount: number;
  controlledResetCount: number;
  mode: CubePhysicsMode;
  objectMode: ObjectMode;
  debugHumanVisible: boolean;
  showCollider: boolean;
  showGlassCube: boolean;
  showHuman: boolean;
  showSilhouetteVolumeDebug: boolean;
  tiltTarget: CubeTiltTarget;
  physicsDebug: boolean;
  onBodyDebugChange: (debug: SceneBodyDebugState) => void;
  onCanvasDebugChange: (debug: Partial<CanvasDebugState>) => void;
  onCubeContainerDebugChange: (debug: CubeContainerDebugState) => void;
  onTiltChange: (tilt: CubeTilt) => void;
  onDragDebugChange: (debug: DragCubeControllerState) => void;
};

function CubePhysicsContent({
  ballResetCount,
  capsuleResetCount,
  controlledResetCount,
  mode,
  objectMode,
  debugHumanVisible,
  showCollider,
  showGlassCube,
  showHuman,
  showSilhouetteVolumeDebug,
  tiltTarget,
  physicsDebug,
  onBodyDebugChange,
  onCanvasDebugChange,
  onCubeContainerDebugChange,
  onTiltChange,
  onDragDebugChange,
}: CubePhysicsContentProps) {
  const manualTilt = useCubeTilt(tiltTarget);
  const dragController = useDragCubeController();
  const tilt =
    objectMode === "controlled-character" ? dragController : manualTilt;

  useEffect(() => {
    onTiltChange(tilt);
  }, [onTiltChange, tilt]);

  useEffect(() => {
    onDragDebugChange(dragController);
  }, [dragController, onDragDebugChange]);

  return (
    <>
      <CanvasProbe onDebugChange={onCanvasDebugChange} />
      <CameraLookAt />
      <color attach="background" args={["#f5f5f2"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 6, 5]} intensity={2} />
      <directionalLight position={[-4, 3, -4]} intensity={0.4} />

      <Suspense fallback={null}>
        <Physics debug={physicsDebug} gravity={[0, -9.81, 0]}>
          <KinematicCubeContainer
            mode={mode}
            tilt={tilt}
            onDebugChange={onCubeContainerDebugChange}
          />
          {objectMode === "ball" ? (
            <TestBall
              resetCount={ballResetCount}
              mode={mode}
              onDebugChange={onBodyDebugChange}
            />
          ) : objectMode === "capsule" ? (
            <CapsuleCharacter
              resetCount={capsuleResetCount}
              mode={mode}
              debugHumanVisible={debugHumanVisible}
              showCollider={showCollider}
              showHuman={showHuman}
              showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
              currentTiltX={tilt.currentTiltX}
              currentTiltZ={tilt.currentTiltZ}
              onDebugChange={(debug: CapsuleDebugState) =>
                onBodyDebugChange(debug)
              }
            />
          ) : (
            <ControlledCharacter
              resetCount={controlledResetCount}
              debugHumanVisible={debugHumanVisible}
              showCollider={showCollider}
              showHuman={showHuman}
              showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
              currentTiltX={tilt.currentTiltX}
              currentTiltZ={tilt.currentTiltZ}
              tiltVelocityX={tilt.tiltVelocityX}
              tiltVelocityZ={tilt.tiltVelocityZ}
              disturbanceStrength={dragController.disturbanceStrength}
              onDebugChange={onBodyDebugChange}
            />
          )}
        </Physics>
      </Suspense>

      {showGlassCube && !showSilhouetteVolumeDebug && <GlassCube tilt={tilt} />}
      {mode === "soft-walls" && <SoftBoundaryFrame tilt={tilt} />}
      <OrbitControls
        makeDefault
        enabled={objectMode !== "controlled-character"}
        enablePan={false}
        minDistance={4.5}
        maxDistance={8}
        target={[0, 0, 0]}
      />
    </>
  );
}

function CanvasProbe({
  onDebugChange,
}: {
  onDebugChange: (debug: Partial<CanvasDebugState>) => void;
}) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const frameCountRef = useRef(0);
  const reportTimeRef = useRef(0);

  useFrame((_, delta) => {
    frameCountRef.current += 1;
    reportTimeRef.current += delta;

    if (reportTimeRef.current > 0.25) {
      onDebugChange({
        canvasFrames: frameCountRef.current,
        canvasWidth: size.width,
        canvasHeight: size.height,
        drawingBufferWidth: gl.domElement.width,
        drawingBufferHeight: gl.domElement.height,
      });
      reportTimeRef.current = 0;
    }
  });

  return null;
}

function CameraLookAt() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function SoftBoundaryFrame({
  tilt,
}: {
  tilt: CubeTilt & { currentOffsetX?: number; currentOffsetY?: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const limit = softBoundaryConfig.hardLimit;
  const length = limit * 2;
  const thickness = 0.018;

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.quaternion.set(
      tilt.quaternion.x,
      tilt.quaternion.y,
      tilt.quaternion.z,
      tilt.quaternion.w,
    );
    groupRef.current.position.set(
      tilt.currentOffsetX ?? 0,
      -1.88 + (tilt.currentOffsetY ?? 0),
      0,
    );
  });

  return (
    <group ref={groupRef} position={[0, -1.88, 0]}>
      <mesh position={[0, 0, limit]}>
        <boxGeometry args={[length, thickness, thickness]} />
        <meshBasicMaterial color="#9c9c96" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0, -limit]}>
        <boxGeometry args={[length, thickness, thickness]} />
        <meshBasicMaterial color="#9c9c96" transparent opacity={0.2} />
      </mesh>
      <mesh position={[limit, 0, 0]}>
        <boxGeometry args={[thickness, thickness, length]} />
        <meshBasicMaterial color="#9c9c96" transparent opacity={0.2} />
      </mesh>
      <mesh position={[-limit, 0, 0]}>
        <boxGeometry args={[thickness, thickness, length]} />
        <meshBasicMaterial color="#9c9c96" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function ManualR3FCanvas({
  children,
  onCreated,
  onDebugChange,
}: {
  children: ReactNode;
  onCreated: (state: RootState) => void;
  onDebugChange: (debug: Partial<CanvasDebugState>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReturnType<typeof createRoot<HTMLCanvasElement>> | null>(
    null,
  );
  const childrenRef = useRef(children);
  const onCreatedRef = useRef(onCreated);
  const onDebugChangeRef = useRef(onDebugChange);
  const configuredRef = useRef(false);

  useEffect(() => {
    childrenRef.current = children;
  }, [children]);

  useEffect(() => {
    onCreatedRef.current = onCreated;
  }, [onCreated]);

  useEffect(() => {
    onDebugChangeRef.current = onDebugChange;
  }, [onDebugChange]);

  const configure = useCallback(async () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const root = rootRef.current;

    if (!container || !canvas || !root) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    onDebugChangeRef.current({
      canvasWidth: width,
      canvasHeight: height,
      manualConfigureCalls: 1,
    });

    await root.configure({
      camera: { position: [4, 3, 6], fov: 45 },
      dpr: [1, 1.7],
      events: fiberEvents,
      gl: { antialias: true, alpha: true },
      size: { width, height, top: rect.top, left: rect.left },
      onCreated: (state) => {
        state.events.connect?.(container);
        state.gl.setClearColor("#f5f5f2", 1);
        onCreatedRef.current(state);
      },
    });

    configuredRef.current = true;
    onDebugChangeRef.current({ manualRenderCalls: 1 });
    root.render(childrenRef.current);
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const root = createRoot(canvas);
    rootRef.current = root;
    onDebugChangeRef.current({ manualRootMounted: true });
    void configure();

    window.addEventListener("resize", configure);

    return () => {
      window.removeEventListener("resize", configure);
      root.unmount();
      rootRef.current = null;
      configuredRef.current = false;
      onDebugChangeRef.current({ manualRootMounted: false });
    };
  }, [configure]);

  useEffect(() => {
    if (configuredRef.current) {
      rootRef.current?.render(children);
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="h-[620px] w-full"
      style={{ height: 620, touchAction: "none", width: "100%" }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}

type PhysicsCubeSceneProps = {
  showLabControls?: boolean;
  showDebugPanel?: boolean;
  physicsDebug?: boolean;
};

export function PhysicsCubeScene({
  showLabControls = true,
  showDebugPanel = true,
  physicsDebug = true,
}: PhysicsCubeSceneProps = {}) {
  const [ballResetCount, setBallResetCount] = useState(0);
  const [capsuleResetCount, setCapsuleResetCount] = useState(0);
  const [controlledResetCount, setControlledResetCount] = useState(0);
  const [mode, setMode] = useState<CubePhysicsMode>("soft-walls");
  const [objectMode, setObjectMode] =
    useState<ObjectMode>("controlled-character");
  const [debugHumanVisible, setDebugHumanVisible] = useState(false);
  const [showCollider, setShowCollider] = useState(false);
  const [showGlassCube, setShowGlassCube] = useState(true);
  const [showHuman, setShowHuman] = useState(true);
  const [showSilhouetteVolumeDebug, setShowSilhouetteVolumeDebug] =
    useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [tiltTarget, setTiltTarget] = useState<CubeTiltTarget>({
    targetTiltX: 0,
    targetTiltZ: 0,
  });
  const [bodyDebug, setBodyDebug] =
    useState<SceneBodyDebugState>(initialBodyDebug);
  const [cubeContainerDebug, setCubeContainerDebug] =
    useState<CubeContainerDebugState>({
      mode: "soft-walls",
      floorFriction: 0,
      wallFriction: 0,
      isCallingSetNextKinematicRotation: false,
      activeCollidersCount: 0,
      activeColliderNames: [],
    });
  const [tiltDebug, setTiltDebug] = useState<CubeTilt>(initialCubeTilt);
  const [dragDebug, setDragDebug] =
    useState<DragCubeControllerState>(initialDragDebug);
  const [canvasDebug, setCanvasDebug] = useState<CanvasDebugState>({
    canvasCreated: false,
    canvasFrames: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    drawingBufferWidth: 0,
    drawingBufferHeight: 0,
    manualConfigureCalls: 0,
    manualRenderCalls: 0,
    manualRootMounted: false,
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setCubeContainerDebug({
      mode,
      floorFriction: 0,
      wallFriction: 0,
      isCallingSetNextKinematicRotation: false,
      activeCollidersCount: 0,
      activeColliderNames: [],
    });
  }, [mode]);

  return (
    <div className="relative h-full min-h-[620px]">
      <ManualR3FCanvas
        onDebugChange={(debug) => {
          if (!showDebugPanel) return;

          setCanvasDebug((current) => ({
            ...current,
            ...debug,
            manualConfigureCalls:
              current.manualConfigureCalls + (debug.manualConfigureCalls ?? 0),
            manualRenderCalls:
              current.manualRenderCalls + (debug.manualRenderCalls ?? 0),
          }));
        }}
        onCreated={({ gl, size }) => {
          gl.setClearColor("#f5f5f2", 1);
          if (!showDebugPanel) return;

          setCanvasDebug((debug) => ({
            ...debug,
            canvasCreated: true,
            canvasWidth: size.width,
            canvasHeight: size.height,
            drawingBufferWidth: gl.domElement.width,
            drawingBufferHeight: gl.domElement.height,
          }));
        }}
      >
        <CubePhysicsContent
          ballResetCount={ballResetCount}
          capsuleResetCount={capsuleResetCount}
          controlledResetCount={controlledResetCount}
          mode={mode}
          objectMode={objectMode}
          debugHumanVisible={debugHumanVisible}
          showCollider={showCollider}
          showGlassCube={showGlassCube}
          showHuman={showHuman}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          tiltTarget={tiltTarget}
          physicsDebug={physicsDebug}
          onBodyDebugChange={showDebugPanel ? setBodyDebug : ignoreDebugUpdate}
          onCanvasDebugChange={(debug) =>
            showDebugPanel &&
            setCanvasDebug((current) => ({ ...current, ...debug }))
          }
          onCubeContainerDebugChange={
            showDebugPanel ? setCubeContainerDebug : ignoreDebugUpdate
          }
          onTiltChange={showDebugPanel ? setTiltDebug : ignoreDebugUpdate}
          onDragDebugChange={showDebugPanel ? setDragDebug : ignoreDebugUpdate}
        />
      </ManualR3FCanvas>

      {showLabControls && (
      <div className="mt-4 flex w-full flex-col gap-2 sm:absolute sm:right-4 sm:top-4 sm:mt-0 sm:w-[190px]">
        <div className="grid grid-cols-1 rounded-[18px] border border-black/10 bg-white/38 p-1 shadow-[0_14px_50px_rgba(0,0,0,0.07)] backdrop-blur-xl">
          {(["floor-only", "soft-walls", "box"] as CubePhysicsMode[]).map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              onClick={() => {
                setMode(nextMode);
                setTiltTarget({ targetTiltX: 0, targetTiltZ: 0 });
                if (objectMode === "ball") {
                  setBallResetCount((count) => count + 1);
                } else if (objectMode === "capsule") {
                  setCapsuleResetCount((count) => count + 1);
                } else {
                  setControlledResetCount((count) => count + 1);
                }
              }}
              className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition duration-300 ${
                mode === nextMode
                  ? "bg-white/75 text-black/72"
                  : "text-black/42 hover:text-black/68"
              }`}
            >
              {nextMode}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 rounded-[18px] border border-black/10 bg-white/38 p-1 shadow-[0_14px_50px_rgba(0,0,0,0.07)] backdrop-blur-xl">
          {(["ball", "capsule", "controlled-character"] as ObjectMode[]).map((nextObjectMode) => (
            <button
              key={nextObjectMode}
              type="button"
              onClick={() => {
                setObjectMode(nextObjectMode);
                if (nextObjectMode === "ball") {
                  setBallResetCount((count) => count + 1);
                } else if (nextObjectMode === "capsule") {
                  setCapsuleResetCount((count) => count + 1);
                } else {
                  setControlledResetCount((count) => count + 1);
                }
              }}
              className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition duration-300 ${
                objectMode === nextObjectMode
                  ? "bg-white/75 text-black/72"
                  : "text-black/42 hover:text-black/68"
              }`}
            >
              {nextObjectMode}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 rounded-[18px] border border-black/10 bg-white/38 p-1 shadow-[0_14px_50px_rgba(0,0,0,0.07)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setShowCollider((value) => !value)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition duration-300 ${
              showCollider
                ? "bg-white/75 text-black/72"
                : "text-black/42 hover:text-black/68"
            }`}
          >
            Collider
          </button>
          <button
            type="button"
            onClick={() => setShowHuman((value) => !value)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition duration-300 ${
              showHuman
                ? "bg-white/75 text-black/72"
                : "text-black/42 hover:text-black/68"
            }`}
          >
            Human
          </button>
          <button
            type="button"
            onClick={() => setDebugHumanVisible((value) => !value)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition duration-300 ${
              debugHumanVisible
                ? "bg-white/75 text-black/72"
                : "text-black/42 hover:text-black/68"
            }`}
          >
            Debug
          </button>
          <button
            type="button"
            onClick={() => setShowGlassCube((value) => !value)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition duration-300 ${
              showGlassCube && !showSilhouetteVolumeDebug
                ? "bg-white/75 text-black/72"
                : "text-black/42 hover:text-black/68"
            }`}
          >
            Glass
          </button>
          <button
            type="button"
            onClick={() => setShowSilhouetteVolumeDebug((value) => !value)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition duration-300 ${
              showSilhouetteVolumeDebug
                ? "bg-white/75 text-black/72"
                : "text-black/42 hover:text-black/68"
            }`}
          >
            Volume
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 rounded-[18px] border border-black/10 bg-white/38 p-2 shadow-[0_14px_50px_rgba(0,0,0,0.07)] backdrop-blur-xl">
          {[
            ["Tilt +X", "x+"],
            ["Tilt -X", "x-"],
            ["Tilt +Z", "z+"],
            ["Tilt -Z", "z-"],
          ].map(([label, action]) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                setTiltTarget((target) => ({
                  targetTiltX:
                    action === "x+"
                      ? maxTiltRadians
                      : action === "x-"
                        ? -maxTiltRadians
                        : target.targetTiltX,
                  targetTiltZ:
                    action === "z+"
                      ? maxTiltRadians
                      : action === "z-"
                        ? -maxTiltRadians
                        : target.targetTiltZ,
                }));
              }}
              className="rounded-full px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-black/42 transition duration-300 hover:bg-white/55 hover:text-black/68"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setTiltTarget({ targetTiltX: 0, targetTiltZ: 0 });
            }}
            className="col-span-2 rounded-full px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-black/42 transition duration-300 hover:bg-white/55 hover:text-black/68"
          >
            Level
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (objectMode === "ball") {
              setBallResetCount((count) => count + 1);
            } else if (objectMode === "capsule") {
              setCapsuleResetCount((count) => count + 1);
            } else {
              setControlledResetCount((count) => count + 1);
            }
          }}
          className="rounded-full border border-black/10 bg-white/38 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-black/55 shadow-[0_14px_50px_rgba(0,0,0,0.07)] backdrop-blur-xl transition duration-300 hover:border-black/18 hover:bg-white/65 hover:text-black/75 focus:outline-none focus:ring-2 focus:ring-black/15"
        >
          Reset{" "}
          {objectMode === "ball"
            ? "Ball"
            : objectMode === "capsule"
              ? "Capsule"
              : "Controlled"}
        </button>
      </div>
      )}

      {showDebugPanel && (
      <div className="mt-4 max-h-[220px] overflow-auto rounded-[22px] border border-white/60 bg-white/42 px-5 py-4 text-[11px] uppercase tracking-[0.16em] text-black/45 shadow-[0_18px_60px_rgba(0,0,0,0.07)] backdrop-blur-xl sm:absolute sm:bottom-5 sm:left-5 sm:mt-0 sm:w-[300px]">
        <p>objectMode {objectMode}</p>
        <p>mode {mode}</p>
        <p>currentPage /lab/cube-physics</p>
        <p>hydrated {hydrated ? "yes" : "no"}</p>
        <p>canvasCreated {canvasDebug.canvasCreated ? "yes" : "no"}</p>
        <p>canvasFrames {canvasDebug.canvasFrames}</p>
        <p>manualRootMounted {canvasDebug.manualRootMounted ? "yes" : "no"}</p>
        <p>manualConfigureCalls {canvasDebug.manualConfigureCalls}</p>
        <p>manualRenderCalls {canvasDebug.manualRenderCalls}</p>
        <p>
          canvasSize {canvasDebug.canvasWidth.toFixed(0)}x
          {canvasDebug.canvasHeight.toFixed(0)}
        </p>
        <p>
          drawingBuffer {canvasDebug.drawingBufferWidth}x
          {canvasDebug.drawingBufferHeight}
        </p>
        <p>showCollider {showCollider ? "yes" : "no"}</p>
        <p>showHuman {showHuman ? "yes" : "no"}</p>
        <p>debugHumanVisible {debugHumanVisible ? "yes" : "no"}</p>
        <p>
          showSilhouetteVolumeDebug{" "}
          {showSilhouetteVolumeDebug ? "yes" : "no"}
        </p>
        <p>showGlassCube {showGlassCube && !showSilhouetteVolumeDebug ? "yes" : "no"}</p>
        <p>debugMarkerMounted no</p>
        <p>rootHumanMounted no</p>
        <p>humanMounted {objectMode !== "ball" && showHuman ? "yes" : "no"}</p>
        <p>capsuleMounted {objectMode === "capsule" ? "yes" : "no"}</p>
        <p>
          controlledMounted{" "}
          {objectMode === "controlled-character" ? "yes" : "no"}
        </p>
        <p>physics gravity 0, -9.81, 0</p>
        <p>physics debug enabled {physicsDebug ? "yes" : "no"}</p>
        <p>oldForceLogicDisabled {bodyDebug.oldForceLogicDisabled === false ? "no" : "yes"}</p>
        <p>cube currentTiltX {tiltDebug.currentTiltX.toFixed(3)}</p>
        <p>cube currentTiltZ {tiltDebug.currentTiltZ.toFixed(3)}</p>
        <p>cube targetTiltX {tiltDebug.targetTiltX.toFixed(3)}</p>
        <p>cube targetTiltZ {tiltDebug.targetTiltZ.toFixed(3)}</p>
        <p>isDragging {dragDebug.isDragging ? "yes" : "no"}</p>
        <p>
          dragDelta {dragDebug.dragDeltaX.toFixed(0)},{" "}
          {dragDebug.dragDeltaY.toFixed(0)}
        </p>
        <p>
          dragVelocity {dragDebug.dragVelocityX.toFixed(0)},{" "}
          {dragDebug.dragVelocityY.toFixed(0)}
        </p>
        <p>
          cubeOffset {dragDebug.currentOffsetX.toFixed(3)},{" "}
          {dragDebug.currentOffsetY.toFixed(3)}
        </p>
        <p>
          tiltVelocity {tiltDebug.tiltVelocityX.toFixed(3)},{" "}
          {tiltDebug.tiltVelocityZ.toFixed(3)}
        </p>
        <p>
          disturbanceStrength {dragDebug.disturbanceStrength.toFixed(2)}
        </p>
        <p>maxTilt {((maxTiltRadians * 180) / Math.PI).toFixed(1)}deg</p>
        <p>
          isCallingSetNextKinematicRotation{" "}
          {cubeContainerDebug.isCallingSetNextKinematicRotation ? "yes" : "no"}
        </p>
        <p>
          quaternion {tiltDebug.quaternion.x.toFixed(3)},{" "}
          {tiltDebug.quaternion.y.toFixed(3)},{" "}
          {tiltDebug.quaternion.z.toFixed(3)},{" "}
          {tiltDebug.quaternion.w.toFixed(3)}
        </p>
        <p>activeCollidersCount {cubeContainerDebug.activeCollidersCount}</p>
        <p>activeColliderNames {cubeContainerDebug.activeColliderNames.join(", ")}</p>
        <p>innerLimit {bodyDebug.innerLimit.toFixed(2)}</p>
        <p>brakeLimit {bodyDebug.brakeLimit.toFixed(2)}</p>
        <p>hardLimit {bodyDebug.hardLimit.toFixed(2)}</p>
        <p>
          zones {bodyDebug.zoneX} / {bodyDebug.zoneZ}
        </p>
        <p>
          outwardVelocity {bodyDebug.outwardVelocityX.toFixed(2)},{" "}
          {bodyDebug.outwardVelocityZ.toFixed(2)}
        </p>
        <p>
          wasVelocityAbsorbed {bodyDebug.wasVelocityAbsorbed ? "yes" : "no"}
        </p>
        <p>
          emergencyCorrectionActive{" "}
          {bodyDebug.emergencyCorrectionActive ? "yes" : "no"}
        </p>
        <p>
          boundaryOverflow {bodyDebug.boundaryOverflowX.toFixed(2)},{" "}
          {bodyDebug.boundaryOverflowZ.toFixed(2)}
        </p>
        <p>softBoundaryActive {bodyDebug.isSoftBoundaryActive ? "yes" : "no"}</p>
        <p>
          softForce {bodyDebug.softForce.x.toFixed(2)},{" "}
          {bodyDebug.softForce.z.toFixed(2)}
        </p>
        <p>floorFriction {cubeContainerDebug.floorFriction.toFixed(2)}</p>
        <p>wallFriction {cubeContainerDebug.wallFriction.toFixed(2)}</p>
        <p>
          {objectMode} position {bodyDebug.position.x.toFixed(2)},{" "}
          {bodyDebug.position.y.toFixed(2)}, {bodyDebug.position.z.toFixed(2)}
        </p>
        <p>
          human position {bodyDebug.humanPosition.x.toFixed(2)},{" "}
          {bodyDebug.humanPosition.y.toFixed(2)},{" "}
          {bodyDebug.humanPosition.z.toFixed(2)}
        </p>
        <p>human scale {bodyDebug.humanScale.toFixed(2)}</p>
        <p>
          {objectMode} linvel {bodyDebug.linvel.x.toFixed(2)},{" "}
          {bodyDebug.linvel.y.toFixed(2)}, {bodyDebug.linvel.z.toFixed(2)}
        </p>
        <p>horizontalSpeed {bodyDebug.horizontalSpeed.toFixed(2)}</p>
        <p>maxHorizontalSpeed {bodyDebug.maxHorizontalSpeed.toFixed(2)}</p>
        <p>
          controlled velocity {bodyDebug.controlledVelocity.x.toFixed(2)},{" "}
          {bodyDebug.controlledVelocity.z.toFixed(2)}
        </p>
        <p>
          slopeDirection {bodyDebug.slopeDirectionX.toFixed(2)},{" "}
          {bodyDebug.slopeDirectionZ.toFixed(2)}
        </p>
        <p>slopeStrength {bodyDebug.slopeStrength.toFixed(2)}</p>
        <p>balanceStress {bodyDebug.balanceStress.toFixed(2)}</p>
        <p>controlledMaxSpeed {bodyDebug.controlledMaxSpeed.toFixed(2)}</p>
        <p>controlledDamping {bodyDebug.controlledDamping.toFixed(2)}</p>
        <p>slidePower {bodyDebug.slidePower.toFixed(2)}</p>
        <p>balancePower {bodyDebug.balancePower.toFixed(2)}</p>
        <p>lowSpeedStopActive {bodyDebug.lowSpeedStopActive ? "yes" : "no"}</p>
        <p>characterState {bodyDebug.characterState}</p>
        <p>bodyLeanX {bodyDebug.bodyLeanX.toFixed(3)}</p>
        <p>bodyLeanZ {bodyDebug.bodyLeanZ.toFixed(3)}</p>
        <p>humanYaw {bodyDebug.humanYaw.toFixed(2)}</p>
        <p>
          {objectMode} angvel {bodyDebug.angvel.x.toFixed(2)},{" "}
          {bodyDebug.angvel.y.toFixed(2)}, {bodyDebug.angvel.z.toFixed(2)}
        </p>
        <p>angularSpeed {bodyDebug.angularSpeed.toFixed(2)}</p>
        <p>
          maxAngularSpeed{" "}
          {Number.isFinite(bodyDebug.maxAngularSpeed)
            ? bodyDebug.maxAngularSpeed.toFixed(2)
            : "none"}
        </p>
        <p>isSleeping {bodyDebug.isSleeping ? "yes" : "no"}</p>
        <p>friction {bodyDebug.friction.toFixed(2)}</p>
        <p>restitution {bodyDebug.restitution.toFixed(2)}</p>
        <p>linearDamping {bodyDebug.linearDamping.toFixed(2)}</p>
        <p>angularDamping {bodyDebug.angularDamping.toFixed(2)}</p>
        <p>horizontalDrag {bodyDebug.horizontalDrag.toFixed(2)}</p>
        <p>gravityScale {bodyDebug.gravityScale.toFixed(2)}</p>
        <p>wakeUpEveryFrame {bodyDebug.wakeUpEveryFrame ? "yes" : "no"}</p>
        <p>isResetting {bodyDebug.isResetting ? "yes" : "no"}</p>
        <p>collision {bodyDebug.isColliding ? "yes" : "no"}</p>
      </div>
      )}
    </div>
  );
}

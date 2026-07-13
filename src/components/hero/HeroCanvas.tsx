"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import {
  Component,
  Suspense,
  useRef,
  type ErrorInfo,
  type MutableRefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";
import GlassCube from "./GlassCube";
import HeroBall, { type HeroBallDebugState } from "./HeroBall";
import {
  BALL_RADIUS,
  CUBE_SIZE,
  FLOOR_Y,
} from "./heroGeometry";
import {
  SHOW_DEBUG,
} from "./heroTuning";
import {
  useHeroInteraction,
  type HeroInteractionRef,
} from "./useHeroInteraction";

const defaultHeroBallDebugState: HeroBallDebugState = {
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  linvelX: 0,
  linvelY: 0,
  linvelZ: 0,
  angvelX: 0,
  angvelY: 0,
  angvelZ: 0,
  speed: 0,
  maxSpeed: 2.65,
  resetCount: 0,
};

function fmt(value: unknown, digits = 3) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : Number(0).toFixed(digits);
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        className="h-full w-full"
        style={{ height: "100%", width: "100%", touchAction: "pan-y" }}
        camera={{ position: [0, 0.15, 6.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false,
          powerPreference: "high-performance",
        }}
        shadows
      >
        <color attach="background" args={["#f4f4f0"]} />
        <fog attach="fog" args={["#f4f4f0", 7.2, 13]} />
        <ambientLight intensity={0.96} />
        <directionalLight position={[4, 5, 5]} intensity={1.62} color="#ffffff" />
        <directionalLight position={[-4, 2.4, -3]} intensity={0.42} color="#f3f3ee" />
        <directionalLight position={[0, 3, -5]} intensity={0.2} color="#f8f8f2" />
        <pointLight position={[-3.5, 2.5, 4]} intensity={0.34} color="#deded8" />
        <HeroCanvasBoundary>
          <HeroWorld />
        </HeroCanvasBoundary>
      </Canvas>
    </div>
  );
}

class HeroCanvasBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error("Hero 3D scene failed.", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <SafeHeroFallback />;
    }

    return this.props.children;
  }
}

function HeroWorld() {
  const { interactionRef } = useHeroInteraction();
  const debugStateRef = useRef<HeroBallDebugState>({
    ...defaultHeroBallDebugState,
  });

  return (
    <>
      <ResponsiveCameraFraming />
      <Suspense fallback={<SafeHeroFallback />}>
        <Physics gravity={[0, -9.81, 0]} timeStep="vary">
          <KinematicCubeBody interactionRef={interactionRef}>
            <GlassCube />
            <InteriorShadowReceiver />
            {SHOW_DEBUG && <FloorDebugPlane />}
          </KinematicCubeBody>
          <HeroBall
            onDebugUpdate={(state) => {
              debugStateRef.current = state;
            }}
          />
        </Physics>
      </Suspense>
      {SHOW_DEBUG && (
        <CoordinateDebugPanel
          interactionRef={interactionRef}
          debugStateRef={debugStateRef}
        />
      )}
    </>
  );
}

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function isFiniteQuaternion(quaternion: THREE.Quaternion) {
  return (
    Number.isFinite(quaternion.x) &&
    Number.isFinite(quaternion.y) &&
    Number.isFinite(quaternion.z) &&
    Number.isFinite(quaternion.w)
  );
}

function SafeHeroFallback() {
  return (
    <group>
      <GlassCube />
      <InteriorShadowReceiver />
      <mesh position={[0, -0.96, 0]} castShadow>
        <sphereGeometry args={[BALL_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.58}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
}

function KinematicCubeBody({
  interactionRef,
  children,
}: {
  interactionRef: HeroInteractionRef;
  children: ReactNode;
}) {
  const cubeBodyRef = useRef<RapierRigidBody>(null);
  const quaternionRef = useRef(new THREE.Quaternion());
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, "XYZ"));
  const hasWarnedInvalidTransformRef = useRef(false);
  const half = CUBE_SIZE / 2;
  const wallThickness = 0.06;

  useFrame((_, delta) => {
    const body = cubeBodyRef.current;

    if (!body) {
      return;
    }

    const interaction = interactionRef.current;
    const maxTiltX = THREE.MathUtils.degToRad(8);
    const maxTiltZ = THREE.MathUtils.degToRad(5);
    const tiltX = THREE.MathUtils.clamp(
      finite(interaction.currentTiltX),
      -maxTiltX,
      maxTiltX,
    );
    const tiltZ = THREE.MathUtils.clamp(
      finite(interaction.currentTiltZ),
      -maxTiltZ,
      maxTiltZ,
    );
    const translation = body.translation();

    eulerRef.current.set(tiltX, 0, tiltZ);
    quaternionRef.current.setFromEuler(eulerRef.current);
    quaternionRef.current.normalize();

    if (!isFiniteQuaternion(quaternionRef.current)) {
      quaternionRef.current.identity();
    }

    if (
      !Number.isFinite(translation.x) ||
      !Number.isFinite(translation.y) ||
      !Number.isFinite(translation.z) ||
      Math.abs(translation.x) > 10 ||
      Math.abs(translation.y) > 10 ||
      Math.abs(translation.z) > 10
    ) {
      body.setTranslation({ x: 0, y: 0, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);

      if (!hasWarnedInvalidTransformRef.current) {
        console.warn("Hero cube transform reset because it became invalid.");
        hasWarnedInvalidTransformRef.current = true;
      }

      return;
    }

    body.setNextKinematicRotation({
      x: quaternionRef.current.x,
      y: quaternionRef.current.y,
      z: quaternionRef.current.z,
      w: quaternionRef.current.w,
    });
    body.setNextKinematicTranslation({ x: 0, y: 0, z: 0 });
  });

  return (
    <RigidBody
      ref={cubeBodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[0, 0, 0]}
    >
      <CuboidCollider
        args={[half, wallThickness, half]}
        position={[0, -half - wallThickness, 0]}
        friction={0.86}
        restitution={0.04}
      />
      <CuboidCollider
        args={[half, wallThickness, half]}
        position={[0, half + wallThickness, 0]}
        friction={0.72}
        restitution={0.02}
      />
      <CuboidCollider
        args={[wallThickness, half, half]}
        position={[-half - wallThickness, 0, 0]}
        friction={0.72}
        restitution={0.04}
      />
      <CuboidCollider
        args={[wallThickness, half, half]}
        position={[half + wallThickness, 0, 0]}
        friction={0.72}
        restitution={0.04}
      />
      <CuboidCollider
        args={[half, half, wallThickness]}
        position={[0, 0, half + wallThickness]}
        friction={0.72}
        restitution={0.04}
      />
      <CuboidCollider
        args={[half, half, wallThickness]}
        position={[0, 0, -half - wallThickness]}
        friction={0.72}
        restitution={0.04}
      />
      {children}
    </RigidBody>
  );
}

function ResponsiveCameraFraming() {
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const frameDelta = Math.min(delta, 1 / 30);
    const viewportWidth = finite(size.width, 1024);
    const isMobile = viewportWidth < 768;
    const isShortLandscape = isMobile && viewportWidth > finite(size.height, 800);
    const targetX = isMobile ? (isShortLandscape ? 0.7 : 1.05) : 0;
    const targetY = isMobile ? (isShortLandscape ? 0.3 : 0.42) : 0.15;
    const targetZ = isMobile ? (isShortLandscape ? 8.6 : 10.2) : 6.2;
    const targetFov = isMobile ? 37 : 38;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 5.5, frameDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 5.5, frameDelta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 5.5, frameDelta);
    camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 5.5, frameDelta);

    if (isMobile) {
      camera.lookAt(0, 0, 0);
    } else {
      camera.rotation.set(0, 0, 0);
    }

    camera.updateProjectionMatrix();
  });

  return null;
}

function InteriorShadowReceiver() {
  return (
    <mesh position={[0, FLOOR_Y + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[CUBE_SIZE * 0.7, CUBE_SIZE * 0.7]} />
      <shadowMaterial transparent opacity={0.09} depthWrite={false} />
    </mesh>
  );
}

function CoordinateDebugPanel({
  interactionRef,
  debugStateRef,
}: {
  interactionRef: HeroInteractionRef;
  debugStateRef: MutableRefObject<HeroBallDebugState>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!panelRef.current) {
      return;
    }

    const debugState = {
      ...defaultHeroBallDebugState,
      ...debugStateRef.current,
    };
    const interaction = interactionRef.current;
    panelRef.current.innerText = [
      `tiltX ${fmt(interaction.currentTiltX)}`,
      `tiltZ ${fmt(interaction.currentTiltZ)}`,
      `pos ${fmt(debugState.positionX)}, ${fmt(debugState.positionY)}, ${fmt(debugState.positionZ)}`,
      `linvel ${fmt(debugState.linvelX)}, ${fmt(debugState.linvelY)}, ${fmt(debugState.linvelZ)}`,
      `angvel ${fmt(debugState.angvelX)}, ${fmt(debugState.angvelY)}, ${fmt(debugState.angvelZ)}`,
      `speed ${fmt(debugState.speed)} / ${fmt(debugState.maxSpeed)}`,
      `reset ${debugState.resetCount}`,
      `floor ${fmt(FLOOR_Y)}`,
      `radius ${fmt(BALL_RADIUS)}`,
      "rapier dynamic ball",
      "kinematic cube colliders 6",
    ].join("\n");
  });

  return (
    <Html fullscreen style={{ pointerEvents: "none" }}>
      <div
        ref={panelRef}
        className="absolute left-4 top-20 rounded-2xl border border-white/70 bg-white/60 p-3 text-[10px] uppercase tracking-[0.14em] text-neutral-500 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      />
    </Html>
  );
}

function FloorDebugPlane() {
  return (
    <mesh position={[0, FLOOR_Y + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[CUBE_SIZE, CUBE_SIZE]} />
      <meshBasicMaterial
        color="#ff0000"
        transparent
        opacity={0.18}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

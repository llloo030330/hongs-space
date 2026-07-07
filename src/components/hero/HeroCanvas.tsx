"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import GlassCube from "./GlassCube";
import HeroBall, { type HeroBallDebugState } from "./HeroBall";
import {
  BALL_CENTER_Y,
  BALL_LIMIT,
  CUBE_SIZE,
  FLOOR_Y,
} from "./heroGeometry";
import {
  CENTER_BIAS,
  MAX_BALL_SPEED,
  SHOW_DEBUG,
} from "./heroTuning";
import {
  useHeroInteraction,
  type HeroInteractionControls,
  type HeroInteractionRef,
} from "./useHeroInteraction";

const defaultHeroBallDebugState: HeroBallDebugState = {
  accelerationX: 0,
  accelerationZ: 0,
  velocityX: 0,
  velocityZ: 0,
  ballLocalX: 0,
  ballLocalZ: 0,
  limitX: BALL_LIMIT,
  limitZ: BALL_LIMIT,
  tiltMagnitude: 0,
  tiltBoost: 1,
  speed: 0,
  maxSpeed: MAX_BALL_SPEED,
  centerBias: CENTER_BIAS,
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
        style={{ height: "100%", width: "100%" }}
        camera={{ position: [0, 0.15, 6.2], fov: 38 }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={["#f4f4f0"]} />
        <fog attach="fog" args={["#f4f4f0", 7.2, 13]} />
        <ambientLight intensity={1.12} />
        <directionalLight position={[4, 5, 5]} intensity={1.85} color="#ffffff" />
        <directionalLight position={[-4, 2.4, -3]} intensity={0.28} color="#f2f2ec" />
        <pointLight position={[-3.5, 2.5, 4]} intensity={0.52} color="#d8d8d2" />
        <HeroWorld />
      </Canvas>
    </div>
  );
}

function HeroWorld() {
  const interactionControls = useHeroInteraction();
  const { interactionRef } = interactionControls;
  const debugStateRef = useRef<HeroBallDebugState>({
    ...defaultHeroBallDebugState,
  });

  return (
    <>
      <CubeWorldGroup interactionRef={interactionRef}>
        <GlassCube />
        <HeroBall
          interactionRef={interactionRef}
          onDebugUpdate={(state) => {
            debugStateRef.current = state;
          }}
        />
        {SHOW_DEBUG && <FloorDebugPlane />}
      </CubeWorldGroup>
      {SHOW_DEBUG && (
        <CoordinateDebugPanel
          interactionRef={interactionRef}
          debugStateRef={debugStateRef}
        />
      )}
      <MobileMotionControl controls={interactionControls} />
    </>
  );
}

function CubeWorldGroup({
  interactionRef,
  children,
}: {
  interactionRef: HeroInteractionRef;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const interaction = interactionRef.current;
    const frameDelta = Math.min(delta, 1 / 30);
    const targetScale = getResponsiveCubeScale(size.width, size.height, camera);

    group.scale.setScalar(
      THREE.MathUtils.damp(group.scale.x, targetScale, 7.5, frameDelta),
    );
    group.position.x = THREE.MathUtils.damp(
      group.position.x,
      interaction.currentOffsetX * 0.2,
      8,
      frameDelta,
    );
    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      interaction.currentOffsetY * 0.12,
      8,
      frameDelta,
    );
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      interaction.currentTiltX,
      9,
      frameDelta,
    );
    group.rotation.z = THREE.MathUtils.damp(
      group.rotation.z,
      interaction.currentTiltZ,
      9,
      frameDelta,
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

function getResponsiveCubeScale(
  width: number,
  height: number,
  camera: THREE.Camera,
) {
  if (width >= 640 || height <= 0 || !(camera instanceof THREE.PerspectiveCamera)) {
    return 1;
  }

  const aspect = width / height;
  const distance = Math.abs(camera.position.z);
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const visibleWidth = 2 * Math.tan(verticalFov / 2) * distance * aspect;
  const targetViewportWidth = 0.74;

  return THREE.MathUtils.clamp(
    (visibleWidth * targetViewportWidth) / CUBE_SIZE,
    0.56,
    1,
  );
}

function MobileMotionControl({
  controls,
}: {
  controls: HeroInteractionControls;
}) {
  if (!controls.isMobileInput) {
    return null;
  }

  const canRequestMotion = controls.motionStatus === "idle";
  const statusText =
    controls.motionStatus === "enabled"
      ? "Motion enabled. Tilt your phone to move the ball."
      : controls.motionStatus === "denied"
        ? "Motion access denied. Gentle drift remains on."
        : controls.motionStatus === "unsupported"
          ? "Tilt control is not available on this device."
          : 'Tap "Use Tilt" to enable motion control.';

  return (
    <Html fullscreen style={{ pointerEvents: "none" }}>
      <div className="absolute inset-x-0 bottom-[5.8rem] z-20 flex justify-center px-6 sm:hidden">
        <div className="pointer-events-auto flex max-w-[15rem] flex-col items-center gap-2 text-center">
          {canRequestMotion && (
            <button
              type="button"
              aria-label="Enable phone tilt control for the hero ball"
              onClick={controls.requestMotionPermission}
              className="rounded-full border border-black/[0.08] bg-white/[0.32] px-4 py-2 text-[9px] font-medium uppercase tracking-[0.22em] text-black/50 shadow-[0_10px_30px_rgba(60,60,55,0.045)] backdrop-blur-2xl transition-[transform,border-color,background-color,color] duration-500 ease-out hover:-translate-y-px hover:border-black/14 hover:bg-white/44 hover:text-black/68 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-black/18 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f3ef]"
            >
              Use Tilt
            </button>
          )}
          <p className="text-[8.5px] font-medium uppercase leading-relaxed tracking-[0.18em] text-black/30">
            {statusText}
          </p>
        </div>
      </div>
    </Html>
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
      `accel ${fmt(debugState.accelerationX)}, ${fmt(debugState.accelerationZ)}`,
      `vel ${fmt(debugState.velocityX)}, ${fmt(debugState.velocityZ)}`,
      `speed ${fmt(debugState.speed)} / ${fmt(debugState.maxSpeed)}`,
      `tiltMag ${fmt(debugState.tiltMagnitude)}`,
      `tiltBoost ${fmt(debugState.tiltBoost)}`,
      `ball ${fmt(debugState.ballLocalX)}, ${fmt(debugState.ballLocalZ)}`,
      `y ${fmt(BALL_CENTER_Y)}`,
      `floor ${fmt(FLOOR_Y)}`,
      `limit ${fmt(debugState.limitX)}, ${fmt(debugState.limitZ)}`,
      `centerBias ${fmt(debugState.centerBias)}`,
      "shadow radial-texture",
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

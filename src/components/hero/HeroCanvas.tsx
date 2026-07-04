"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
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
  const interactionRef = useHeroInteraction();
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

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const interaction = interactionRef.current;
    const frameDelta = Math.min(delta, 1 / 30);
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

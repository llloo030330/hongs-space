"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BALL_CENTER_Y, BALL_LIMIT, BALL_RADIUS, FLOOR_Y } from "./heroGeometry";
import {
  BOUNDARY_BOUNCE,
  CENTER_BIAS,
  DRAG_FORCE,
  MAX_BALL_SPEED,
  MAX_TILT_MAGNITUDE,
  OFFSET_FORCE,
  ROLLING_DAMPING,
  SHADOW_OPACITY,
  SHADOW_SIZE,
  TILT_BOOST_POWER,
  TILT_FORCE,
} from "./heroTuning";
import type { HeroInteractionRef } from "./useHeroInteraction";

export type HeroBallDebugState = {
  accelerationX: number;
  accelerationZ: number;
  velocityX: number;
  velocityZ: number;
  ballLocalX: number;
  ballLocalZ: number;
  limitX: number;
  limitZ: number;
  tiltMagnitude: number;
  tiltBoost: number;
  speed: number;
  maxSpeed: number;
  centerBias: number;
};

type HeroBallProps = {
  interactionRef: HeroInteractionRef;
  onDebugUpdate?: (state: HeroBallDebugState) => void;
};

const limitX = BALL_LIMIT;
const limitZ = BALL_LIMIT;

function createSoftShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Texture();
  }

  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 128);
  gradient.addColorStop(0, "rgba(0,0,0,0.18)");
  gradient.addColorStop(0.35, "rgba(0,0,0,0.09)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

function finiteValue(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function clamp(value: number, min: number, max: number) {
  return THREE.MathUtils.clamp(finiteValue(value), min, max);
}

export default function HeroBall({
  interactionRef,
  onDebugUpdate,
}: HeroBallProps) {
  const ballGroupRef = useRef<THREE.Group>(null);
  const ballVisualRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Group>(null);
  const softShadowTexture = useMemo(() => createSoftShadowTexture(), []);
  const positionRef = useRef(new THREE.Vector3(0, BALL_CENTER_Y, 0));
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastPositionRef = useRef(new THREE.Vector3(0, BALL_CENTER_Y, 0));

  useFrame((state, delta) => {
    if (!ballGroupRef.current || !ballVisualRef.current) return;

    const dt = Math.min(delta, 0.033);
    const t = state.clock.getElapsedTime();
    const interaction = interactionRef.current;
    const tiltMagnitude = Math.min(
      Math.sqrt(
        finiteValue(interaction.currentTiltX) *
          finiteValue(interaction.currentTiltX) +
          finiteValue(interaction.currentTiltZ) *
            finiteValue(interaction.currentTiltZ),
      ),
      MAX_TILT_MAGNITUDE,
    );
    const tiltBoost = 1 + tiltMagnitude * TILT_BOOST_POWER;
    const tiltDirectionX = -Math.sin(finiteValue(interaction.currentTiltZ));
    const tiltDirectionZ = Math.sin(finiteValue(interaction.currentTiltX));
    const accelerationX =
      tiltDirectionX * TILT_FORCE * tiltBoost -
      finiteValue(interaction.dragVelocityX) * DRAG_FORCE -
      finiteValue(interaction.currentOffsetX) * OFFSET_FORCE -
      positionRef.current.x * CENTER_BIAS;
    const accelerationZ =
      tiltDirectionZ * TILT_FORCE * tiltBoost +
      finiteValue(interaction.dragVelocityY) * DRAG_FORCE +
      finiteValue(interaction.currentOffsetY) * OFFSET_FORCE -
      positionRef.current.z * CENTER_BIAS;

    velocityRef.current.x += accelerationX * dt;
    velocityRef.current.z += accelerationZ * dt;
    velocityRef.current.x *= Math.pow(ROLLING_DAMPING, dt * 60);
    velocityRef.current.z *= Math.pow(ROLLING_DAMPING, dt * 60);

    const horizontalSpeed = Math.hypot(
      velocityRef.current.x,
      velocityRef.current.z,
    );

    if (horizontalSpeed > MAX_BALL_SPEED) {
      const scale = MAX_BALL_SPEED / horizontalSpeed;
      velocityRef.current.x *= scale;
      velocityRef.current.z *= scale;
    }

    positionRef.current.x += velocityRef.current.x * dt;
    positionRef.current.z += velocityRef.current.z * dt;
    positionRef.current.y = BALL_CENTER_Y;

    if (!Number.isFinite(positionRef.current.x)) {
      positionRef.current.x = 0;
      velocityRef.current.x = 0;
    }

    if (!Number.isFinite(positionRef.current.z)) {
      positionRef.current.z = 0;
      velocityRef.current.z = 0;
    }

    if (positionRef.current.x > limitX) {
      positionRef.current.x = limitX;
      velocityRef.current.x *= BOUNDARY_BOUNCE;
    } else if (positionRef.current.x < -limitX) {
      positionRef.current.x = -limitX;
      velocityRef.current.x *= BOUNDARY_BOUNCE;
    }

    if (positionRef.current.z > limitZ) {
      positionRef.current.z = limitZ;
      velocityRef.current.z *= BOUNDARY_BOUNCE;
    } else if (positionRef.current.z < -limitZ) {
      positionRef.current.z = -limitZ;
      velocityRef.current.z *= BOUNDARY_BOUNCE;
    }

    const deltaX = positionRef.current.x - lastPositionRef.current.x;
    const deltaZ = positionRef.current.z - lastPositionRef.current.z;

    ballGroupRef.current.position.copy(positionRef.current);
    ballVisualRef.current.rotation.z -= deltaX / BALL_RADIUS;
    ballVisualRef.current.rotation.x += deltaZ / BALL_RADIUS;

    const breathe = 1 + Math.sin(t * 1.4) * 0.006;
    const activeScale =
      1 + clamp(interaction.disturbanceStrength, 0, 1) * 0.012;
    const s = Math.min(breathe * activeScale, 1.018);
    ballVisualRef.current.scale.set(s, s, s);
    lastPositionRef.current.copy(positionRef.current);

    if (shadowRef.current) {
      shadowRef.current.position.set(
        positionRef.current.x,
        FLOOR_Y + 0.004,
        positionRef.current.z,
      );
    }

    onDebugUpdate?.({
      accelerationX,
      accelerationZ,
      velocityX: velocityRef.current.x,
      velocityZ: velocityRef.current.z,
      ballLocalX: positionRef.current.x,
      ballLocalZ: positionRef.current.z,
      limitX,
      limitZ,
      tiltMagnitude,
      tiltBoost,
      speed: Math.hypot(velocityRef.current.x, velocityRef.current.z),
      maxSpeed: MAX_BALL_SPEED,
      centerBias: CENTER_BIAS,
    });
  });

  return (
    <>
      <group ref={ballGroupRef} position={[0, BALL_CENTER_Y, 0]}>
        <group ref={ballVisualRef}>
          <mesh renderOrder={2}>
            <sphereGeometry args={[BALL_RADIUS, 96, 96]} />
            <meshPhysicalMaterial
              color="#101010"
              roughness={0.66}
              metalness={0}
              clearcoat={0.14}
              clearcoatRoughness={0.62}
              transparent={false}
              opacity={1}
              depthWrite
              depthTest
              emissive="#030303"
              emissiveIntensity={0.018}
            />
          </mesh>
        </group>
      </group>

      <group
        ref={shadowRef}
        position={[0, FLOOR_Y + 0.004, 0]}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={0}>
          <planeGeometry args={[SHADOW_SIZE, SHADOW_SIZE]} />
          <meshBasicMaterial
            map={softShadowTexture}
            transparent
            opacity={SHADOW_OPACITY}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}

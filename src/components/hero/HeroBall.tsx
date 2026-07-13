"use client";

import { BallCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BALL_CENTER_Y, BALL_LIMIT, BALL_RADIUS } from "./heroGeometry";

export type HeroBallDebugState = {
  positionX: number;
  positionY: number;
  positionZ: number;
  linvelX: number;
  linvelY: number;
  linvelZ: number;
  angvelX: number;
  angvelY: number;
  angvelZ: number;
  speed: number;
  maxSpeed: number;
  resetCount: number;
};

type HeroBallProps = {
  onDebugUpdate?: (state: HeroBallDebugState) => void;
};

const initialPosition = { x: 0, y: BALL_CENTER_Y + 0.012, z: 0 };
const maxLinearSpeed = 2.65;
const hardResetLimit = BALL_LIMIT + BALL_RADIUS + 0.58;
const maxFallDistance = 4.5;

function isFiniteVector(vector: { x: number; y: number; z: number }) {
  return (
    Number.isFinite(vector.x) &&
    Number.isFinite(vector.y) &&
    Number.isFinite(vector.z)
  );
}

function resetBall(body: RapierRigidBody) {
  body.setTranslation(initialPosition, true);
  body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  body.wakeUp();
}

export default function HeroBall({ onDebugUpdate }: HeroBallProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const resetCountRef = useRef(0);
  const reportTimeRef = useRef(0);

  useEffect(() => {
    const body = bodyRef.current;

    if (body) {
      resetBall(body);
    }
  }, []);

  useFrame((_, delta) => {
    const body = bodyRef.current;

    if (!body) return;

    const translation = body.translation();
    const linvel = body.linvel();
    const angvel = body.angvel();
    const speed = Math.hypot(linvel.x, linvel.y, linvel.z);
    const isInvalid =
      !isFiniteVector(translation) ||
      !isFiniteVector(linvel) ||
      !isFiniteVector(angvel) ||
      Math.abs(translation.x) > hardResetLimit ||
      Math.abs(translation.z) > hardResetLimit ||
      Math.abs(translation.y) > maxFallDistance;

    if (isInvalid) {
      resetCountRef.current += 1;
      resetBall(body);
      return;
    }

    if (speed > maxLinearSpeed) {
      const scale = maxLinearSpeed / speed;
      body.setLinvel(
        {
          x: linvel.x * scale,
          y: linvel.y * scale,
          z: linvel.z * scale,
        },
        true,
      );
    }

    body.wakeUp();
    reportTimeRef.current += Math.min(delta, 1 / 30);

    if (reportTimeRef.current >= 0.12) {
      onDebugUpdate?.({
        positionX: translation.x,
        positionY: translation.y,
        positionZ: translation.z,
        linvelX: linvel.x,
        linvelY: linvel.y,
        linvelZ: linvel.z,
        angvelX: angvel.x,
        angvelY: angvel.y,
        angvelZ: angvel.z,
        speed,
        maxSpeed: maxLinearSpeed,
        resetCount: resetCountRef.current,
      });
      reportTimeRef.current = 0;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      position={[initialPosition.x, initialPosition.y, initialPosition.z]}
      ccd
      canSleep={false}
      mass={0.48}
      friction={0.78}
      restitution={0.055}
      linearDamping={0.18}
      angularDamping={0.24}
      gravityScale={1}
    >
      <BallCollider
        args={[BALL_RADIUS]}
        friction={0.82}
        restitution={0.055}
      />
      <mesh castShadow renderOrder={2}>
        <sphereGeometry args={[BALL_RADIUS, 96, 96]} />
        <meshPhysicalMaterial
          color="#111111"
          roughness={0.58}
          metalness={0.02}
          clearcoat={0.12}
          clearcoatRoughness={0.58}
          transparent={false}
          opacity={1}
          depthWrite
          depthTest
          emissive="#020202"
          emissiveIntensity={0.012}
        />
      </mesh>
    </RigidBody>
  );
}

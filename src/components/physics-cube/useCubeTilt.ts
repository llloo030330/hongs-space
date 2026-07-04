"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const maxTiltRadians = (4.5 * Math.PI) / 180;
const tiltDamping = 2.2;
const settleEpsilon = 0.0001;
const minFrameDelta = 1 / 120;

export type CubeTilt = {
  normalizedX: number;
  normalizedY: number;
  currentTiltX: number;
  currentTiltZ: number;
  targetTiltX: number;
  targetTiltZ: number;
  tiltVelocityX: number;
  tiltVelocityZ: number;
  tiltStrength: number;
  quaternion: { x: number; y: number; z: number; w: number };
};

export type CubeTiltTarget = {
  targetTiltX: number;
  targetTiltZ: number;
};

export const initialCubeTilt: CubeTilt = {
  normalizedX: 0,
  normalizedY: 0,
  currentTiltX: 0,
  currentTiltZ: 0,
  targetTiltX: 0,
  targetTiltZ: 0,
  tiltVelocityX: 0,
  tiltVelocityZ: 0,
  tiltStrength: 0,
  quaternion: { x: 0, y: 0, z: 0, w: 1 },
};

export function useCubeTilt(targetOverride?: CubeTiltTarget): CubeTilt {
  const pointerRef = useRef({ normalizedX: 0, normalizedY: 0 });
  const currentTiltRef = useRef(initialCubeTilt);
  const [tilt, setTilt] = useState<CubeTilt>(initialCubeTilt);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = {
        normalizedX: clampSigned((event.clientX / window.innerWidth - 0.5) * 2),
        normalizedY: clampSigned((event.clientY / window.innerHeight - 0.5) * 2),
      };
    };

    const resetPointer = () => {
      pointerRef.current = { normalizedX: 0, normalizedY: 0 };
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, []);

  useFrame((_, delta) => {
    const previous = currentTiltRef.current;
    const pointer = pointerRef.current;
    const frameDelta = Math.max(delta, minFrameDelta);
    const targetTiltX =
      targetOverride?.targetTiltX ?? pointer.normalizedY * maxTiltRadians;
    const targetTiltZ =
      targetOverride?.targetTiltZ ?? pointer.normalizedX * maxTiltRadians;
    const nextTiltX = settle(
      dampSigned(previous.currentTiltX, targetTiltX, tiltDamping, frameDelta),
    );
    const nextTiltZ = settle(
      dampSigned(previous.currentTiltZ, targetTiltZ, tiltDamping, frameDelta),
    );
    const tiltVelocityX = settle(
      (nextTiltX - previous.currentTiltX) / frameDelta,
    );
    const tiltVelocityZ = settle(
      (nextTiltZ - previous.currentTiltZ) / frameDelta,
    );
    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(nextTiltX, 0, nextTiltZ, "XYZ"),
    );
    const nextTilt: CubeTilt = {
      normalizedX: clampSigned(targetTiltZ / maxTiltRadians),
      normalizedY: clampSigned(targetTiltX / maxTiltRadians),
      currentTiltX: nextTiltX,
      currentTiltZ: nextTiltZ,
      targetTiltX,
      targetTiltZ,
      tiltVelocityX,
      tiltVelocityZ,
      tiltStrength: Math.min(1, Math.hypot(nextTiltX, nextTiltZ) / maxTiltRadians),
      quaternion: {
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w,
      },
    };

    currentTiltRef.current = nextTilt;
    setTilt(nextTilt);
  });

  return tilt;
}

function clampSigned(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function dampSigned(current: number, target: number, damping: number, delta: number) {
  const factor = 1 - Math.exp(-damping * delta);

  return current + (target - current) * factor;
}

function settle(value: number) {
  if (value > -settleEpsilon && value < settleEpsilon) {
    return 0;
  }

  return value;
}

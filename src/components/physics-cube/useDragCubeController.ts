"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { CubeTilt } from "@/components/physics-cube/useCubeTilt";

const maxOffsetX = 0.35;
const maxOffsetY = 0.22;
const maxTilt = THREE.MathUtils.degToRad(6);
const dragSensitivity = 0.003;
const returnSpeed = 4;
const tiltSmoothness = 8;

export type DragCubeControllerState = CubeTilt & {
  isDragging: boolean;
  dragDeltaX: number;
  dragDeltaY: number;
  dragVelocityX: number;
  dragVelocityY: number;
  currentOffsetX: number;
  currentOffsetY: number;
  disturbanceStrength: number;
};

const initialState: DragCubeControllerState = {
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
  isDragging: false,
  dragDeltaX: 0,
  dragDeltaY: 0,
  dragVelocityX: 0,
  dragVelocityY: 0,
  currentOffsetX: 0,
  currentOffsetY: 0,
  disturbanceStrength: 0,
};

type DragRefs = {
  pointerId: number | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  targetTiltX: number;
  targetTiltZ: number;
  currentOffsetX: number;
  currentOffsetY: number;
  currentTiltX: number;
  currentTiltZ: number;
  previousTiltX: number;
  previousTiltZ: number;
  isDragging: boolean;
  hasFinePointer: boolean;
};

export function useDragCubeController(): DragCubeControllerState {
  const [state, setState] = useState<DragCubeControllerState>(initialState);
  const refs = useRef<DragRefs>({
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    targetOffsetX: 0,
    targetOffsetY: 0,
    targetTiltX: 0,
    targetTiltZ: 0,
    currentOffsetX: 0,
    currentOffsetY: 0,
    currentTiltX: 0,
    currentTiltZ: 0,
    previousTiltX: 0,
    previousTiltZ: 0,
    isDragging: false,
    hasFinePointer: true,
  });

  useEffect(() => {
    refs.current.hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || shouldIgnorePointerTarget(event.target)) return;

      preventDefault(event);
      refs.current.pointerId = event.pointerId;
      refs.current.startX = event.clientX;
      refs.current.startY = event.clientY;
      refs.current.lastX = event.clientX;
      refs.current.lastY = event.clientY;
      refs.current.lastTime = performance.now();
      refs.current.deltaX = 0;
      refs.current.deltaY = 0;
      refs.current.velocityX = 0;
      refs.current.velocityY = 0;
      refs.current.isDragging = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!refs.current.isDragging || refs.current.pointerId !== event.pointerId) {
        return;
      }

      preventDefault(event);
      const now = performance.now();
      const deltaSeconds = Math.max(0.001, (now - refs.current.lastTime) / 1000);
      const moveX = event.clientX - refs.current.lastX;
      const moveY = event.clientY - refs.current.lastY;
      const dragDeltaX = event.clientX - refs.current.startX;
      const dragDeltaY = event.clientY - refs.current.startY;
      const targetOffsetX = clamp(
        dragDeltaX * dragSensitivity,
        -maxOffsetX,
        maxOffsetX,
      );
      const targetOffsetY = clamp(
        -dragDeltaY * dragSensitivity,
        -maxOffsetY,
        maxOffsetY,
      );

      refs.current.lastX = event.clientX;
      refs.current.lastY = event.clientY;
      refs.current.lastTime = now;
      refs.current.deltaX = dragDeltaX;
      refs.current.deltaY = dragDeltaY;
      refs.current.velocityX = moveX / deltaSeconds;
      refs.current.velocityY = moveY / deltaSeconds;
      refs.current.targetOffsetX = targetOffsetX;
      refs.current.targetOffsetY = targetOffsetY;
      refs.current.targetTiltZ = (targetOffsetX / maxOffsetX) * maxTilt;
      refs.current.targetTiltX = (-targetOffsetY / maxOffsetY) * maxTilt;
    };

    const stopDragging = (event: PointerEvent) => {
      if (refs.current.pointerId !== event.pointerId) return;

      refs.current.pointerId = null;
      refs.current.isDragging = false;
      refs.current.deltaX = 0;
      refs.current.deltaY = 0;
      refs.current.velocityX = 0;
      refs.current.velocityY = 0;
      refs.current.targetOffsetX = 0;
      refs.current.targetOffsetY = 0;
      refs.current.targetTiltX = 0;
      refs.current.targetTiltZ = 0;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const frameDelta = Math.min(delta, 1 / 30);
    const target = getTargetValues(refs.current, clock.elapsedTime);
    const offsetFactor = 1 - Math.exp(-returnSpeed * frameDelta);
    const tiltFactor = 1 - Math.exp(-tiltSmoothness * frameDelta);

    refs.current.currentOffsetX = THREE.MathUtils.lerp(
      refs.current.currentOffsetX,
      target.offsetX,
      offsetFactor,
    );
    refs.current.currentOffsetY = THREE.MathUtils.lerp(
      refs.current.currentOffsetY,
      target.offsetY,
      offsetFactor,
    );
    refs.current.currentTiltX = THREE.MathUtils.lerp(
      refs.current.currentTiltX,
      target.tiltX,
      tiltFactor,
    );
    refs.current.currentTiltZ = THREE.MathUtils.lerp(
      refs.current.currentTiltZ,
      target.tiltZ,
      tiltFactor,
    );

    const tiltVelocityX =
      (refs.current.currentTiltX - refs.current.previousTiltX) / frameDelta;
    const tiltVelocityZ =
      (refs.current.currentTiltZ - refs.current.previousTiltZ) / frameDelta;
    refs.current.previousTiltX = refs.current.currentTiltX;
    refs.current.previousTiltZ = refs.current.currentTiltZ;

    const tiltStrength = Math.min(
      1,
      Math.hypot(refs.current.currentTiltX, refs.current.currentTiltZ) /
        maxTilt,
    );
    const dragVelocityStrength = Math.min(
      1,
      Math.hypot(refs.current.velocityX, refs.current.velocityY) / 1200,
    );
    const tiltVelocityStrength = Math.min(
      1,
      Math.hypot(tiltVelocityX, tiltVelocityZ) / 1.6,
    );
    const disturbanceStrength = Math.min(
      1,
      dragVelocityStrength * 0.45 +
        tiltStrength * 0.35 +
        tiltVelocityStrength * 0.35,
    );
    const euler = new THREE.Euler(
      refs.current.currentTiltX,
      0,
      refs.current.currentTiltZ,
      "XYZ",
    );
    const quaternion = new THREE.Quaternion().setFromEuler(euler);

    setState({
      normalizedX: refs.current.currentTiltZ / maxTilt,
      normalizedY: refs.current.currentTiltX / maxTilt,
      currentTiltX: refs.current.currentTiltX,
      currentTiltZ: refs.current.currentTiltZ,
      targetTiltX: target.tiltX,
      targetTiltZ: target.tiltZ,
      tiltVelocityX,
      tiltVelocityZ,
      tiltStrength,
      quaternion: {
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w,
      },
      isDragging: refs.current.isDragging,
      dragDeltaX: refs.current.deltaX,
      dragDeltaY: refs.current.deltaY,
      dragVelocityX: refs.current.velocityX,
      dragVelocityY: refs.current.velocityY,
      currentOffsetX: refs.current.currentOffsetX,
      currentOffsetY: refs.current.currentOffsetY,
      disturbanceStrength,
    });
  });

  return state;
}

function getTargetValues(refs: DragRefs, elapsedTime: number) {
  if (refs.isDragging || refs.hasFinePointer) {
    return {
      offsetX: refs.targetOffsetX,
      offsetY: refs.targetOffsetY,
      tiltX: refs.targetTiltX,
      tiltZ: refs.targetTiltZ,
    };
  }

  return {
    offsetX: 0,
    offsetY: 0,
    tiltX: Math.sin(elapsedTime * 0.42) * maxTilt * 0.12,
    tiltZ: Math.cos(elapsedTime * 0.36) * maxTilt * 0.1,
  };
}

function shouldIgnorePointerTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return true;

  return Boolean(target.closest("button")) || !target.closest("canvas");
}

function preventDefault(event: PointerEvent) {
  if (event.cancelable) {
    event.preventDefault();
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

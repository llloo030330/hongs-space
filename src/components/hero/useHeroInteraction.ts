"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import {
  DRAG_TILT_STRENGTH,
  HOVER_TILT_STRENGTH,
  MAX_DRAG_TILT,
  MAX_HOVER_TILT,
  MOBILE_AUTO_TILT_STRENGTH,
} from "./heroTuning";

export type HeroInteractionState = {
  currentOffsetX: number;
  currentOffsetY: number;
  currentTiltX: number;
  currentTiltZ: number;
  tiltVelocityX: number;
  tiltVelocityZ: number;
  dragVelocityX: number;
  dragVelocityY: number;
  disturbanceStrength: number;
  isDragging: boolean;
};

export type HeroInteractionRef = MutableRefObject<HeroInteractionState>;

type PointerState = {
  isFinePointer: boolean;
  isDragging: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastMoveTime: number;
  targetOffsetX: number;
  targetOffsetY: number;
  targetTiltX: number;
  targetTiltZ: number;
  dragVelocityX: number;
  dragVelocityY: number;
};

const initialInteractionState: HeroInteractionState = {
  currentOffsetX: 0,
  currentOffsetY: 0,
  currentTiltX: 0,
  currentTiltZ: 0,
  tiltVelocityX: 0,
  tiltVelocityZ: 0,
  dragVelocityX: 0,
  dragVelocityY: 0,
  disturbanceStrength: 0,
  isDragging: false,
};

const maxOffsetX = 0.35;
const maxOffsetY = 0.22;
const dragSensitivity = 0.003;

export function useHeroInteraction() {
  const { gl } = useThree();
  const liveStateRef = useRef<HeroInteractionState>(initialInteractionState);
  const pointerRef = useRef<PointerState>({
    isFinePointer: true,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastMoveTime: 0,
    targetOffsetX: 0,
    targetOffsetY: 0,
    targetTiltX: 0,
    targetTiltZ: 0,
    dragVelocityX: 0,
    dragVelocityY: 0,
  });

  useEffect(() => {
    const element = gl.domElement;
    const pointer = pointerRef.current;

    pointer.isFinePointer = window.matchMedia("(pointer: fine)").matches;

    const handlePointerDown = (event: PointerEvent) => {
      if (!pointer.isFinePointer) {
        return;
      }

      event.preventDefault();
      pointer.isDragging = true;
      pointer.startX = event.clientX;
      pointer.startY = event.clientY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lastMoveTime = performance.now();
      element.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointer.isFinePointer) {
        return;
      }

      const deltaX = event.clientX - pointer.lastX;
      const deltaY = event.clientY - pointer.lastY;
      const rect = element.getBoundingClientRect();
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      pointer.dragVelocityX = THREE.MathUtils.clamp(deltaX, -90, 90);
      pointer.dragVelocityY = THREE.MathUtils.clamp(deltaY, -90, 90);
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lastMoveTime = performance.now();

      if (pointer.isDragging) {
        const dragX = event.clientX - pointer.startX;
        const dragY = event.clientY - pointer.startY;

        pointer.targetOffsetX = THREE.MathUtils.clamp(
          dragX * dragSensitivity,
          -maxOffsetX,
          maxOffsetX,
        );
        pointer.targetOffsetY = THREE.MathUtils.clamp(
          -dragY * dragSensitivity,
          -maxOffsetY,
          maxOffsetY,
        );
        pointer.targetTiltX = THREE.MathUtils.clamp(
          pointer.targetOffsetY * DRAG_TILT_STRENGTH,
          -MAX_DRAG_TILT,
          MAX_DRAG_TILT,
        );
        pointer.targetTiltZ = THREE.MathUtils.clamp(
          -pointer.targetOffsetX * DRAG_TILT_STRENGTH,
          -MAX_DRAG_TILT,
          MAX_DRAG_TILT,
        );
      } else {
        pointer.targetOffsetX = normalizedX * maxOffsetX * 0.32;
        pointer.targetOffsetY = normalizedY * maxOffsetY * 0.28;
        pointer.targetTiltX = THREE.MathUtils.clamp(
          normalizedY * HOVER_TILT_STRENGTH,
          -MAX_HOVER_TILT,
          MAX_HOVER_TILT,
        );
        pointer.targetTiltZ = THREE.MathUtils.clamp(
          -normalizedX * HOVER_TILT_STRENGTH,
          -MAX_HOVER_TILT,
          MAX_HOVER_TILT,
        );
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      pointer.isDragging = false;
      pointer.targetOffsetX = 0;
      pointer.targetOffsetY = 0;
      pointer.targetTiltX = 0;
      pointer.targetTiltZ = 0;
      pointer.dragVelocityX = 0;
      pointer.dragVelocityY = 0;
      element.releasePointerCapture?.(event.pointerId);
    };

    element.addEventListener("pointerdown", handlePointerDown, { passive: false });
    element.addEventListener("pointermove", handlePointerMove, { passive: false });
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handlePointerUp);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [gl]);

  useFrame(({ clock }, delta) => {
    const pointer = pointerRef.current;
    const previous = liveStateRef.current;
    const frameDelta = Math.min(delta, 1 / 30);

    if (!pointer.isFinePointer) {
      pointer.targetOffsetX = Math.sin(clock.elapsedTime * 0.45) * 0.05;
      pointer.targetOffsetY = Math.cos(clock.elapsedTime * 0.38) * 0.03;
      pointer.targetTiltX =
        Math.cos(clock.elapsedTime * 0.38) * MOBILE_AUTO_TILT_STRENGTH;
      pointer.targetTiltZ =
        -Math.sin(clock.elapsedTime * 0.45) * MOBILE_AUTO_TILT_STRENGTH;
      pointer.dragVelocityX = 0;
      pointer.dragVelocityY = 0;
    } else if (!pointer.isDragging && performance.now() - pointer.lastMoveTime > 900) {
      pointer.targetOffsetX = THREE.MathUtils.damp(
        pointer.targetOffsetX,
        0,
        3.2,
        frameDelta,
      );
      pointer.targetOffsetY = THREE.MathUtils.damp(
        pointer.targetOffsetY,
        0,
        3.2,
        frameDelta,
      );
      pointer.targetTiltX = THREE.MathUtils.damp(
        pointer.targetTiltX,
        0,
        3.2,
        frameDelta,
      );
      pointer.targetTiltZ = THREE.MathUtils.damp(
        pointer.targetTiltZ,
        0,
        3.2,
        frameDelta,
      );
      pointer.dragVelocityX = THREE.MathUtils.damp(
        pointer.dragVelocityX,
        0,
        8.5,
        frameDelta,
      );
      pointer.dragVelocityY = THREE.MathUtils.damp(
        pointer.dragVelocityY,
        0,
        8.5,
        frameDelta,
      );
    }

    if (pointer.isFinePointer) {
      pointer.dragVelocityX = THREE.MathUtils.damp(
        pointer.dragVelocityX,
        0,
        pointer.isDragging ? 6.5 : 8.5,
        frameDelta,
      );
      pointer.dragVelocityY = THREE.MathUtils.damp(
        pointer.dragVelocityY,
        0,
        pointer.isDragging ? 6.5 : 8.5,
        frameDelta,
      );
    }

    const currentOffsetX = THREE.MathUtils.damp(
      previous.currentOffsetX,
      pointer.targetOffsetX,
      7.2,
      frameDelta,
    );
    const currentOffsetY = THREE.MathUtils.damp(
      previous.currentOffsetY,
      pointer.targetOffsetY,
      7.2,
      frameDelta,
    );
    const currentTiltX = THREE.MathUtils.damp(
      previous.currentTiltX,
      pointer.targetTiltX,
      6.8,
      frameDelta,
    );
    const currentTiltZ = THREE.MathUtils.damp(
      previous.currentTiltZ,
      pointer.targetTiltZ,
      6.8,
      frameDelta,
    );
    const tiltVelocityX = (currentTiltX - previous.currentTiltX) / frameDelta;
    const tiltVelocityZ = (currentTiltZ - previous.currentTiltZ) / frameDelta;
    const movementStrength = Math.hypot(currentOffsetX, currentOffsetY) / maxOffsetX;
    const dragStrength = Math.hypot(pointer.dragVelocityX, pointer.dragVelocityY) / 90;
    const tiltStrength = Math.hypot(currentTiltX, currentTiltZ) / MAX_HOVER_TILT;
    const disturbanceTarget = THREE.MathUtils.clamp(
      movementStrength * 0.45 + dragStrength * 0.35 + tiltStrength * 0.2,
      0,
      1,
    );

    const nextState: HeroInteractionState = {
      currentOffsetX,
      currentOffsetY,
      currentTiltX,
      currentTiltZ,
      tiltVelocityX,
      tiltVelocityZ,
      dragVelocityX: pointer.dragVelocityX,
      dragVelocityY: pointer.dragVelocityY,
      disturbanceStrength: THREE.MathUtils.damp(
        previous.disturbanceStrength,
        disturbanceTarget,
        pointer.isDragging ? 8 : 3.5,
        frameDelta,
      ),
      isDragging: pointer.isDragging,
    };

    liveStateRef.current = nextState;
  });

  return liveStateRef;
}

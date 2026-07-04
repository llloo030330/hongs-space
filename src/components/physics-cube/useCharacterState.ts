import { useCallback, useRef } from "react";

export type CharacterState =
  | "idle"
  | "balancing"
  | "moving"
  | "hitBoundary"
  | "staggering"
  | "recovering";

export type CharacterMotionInput = {
  horizontalSpeed: number;
  linvelX: number;
  linvelZ: number;
  currentTiltX: number;
  currentTiltZ: number;
  softBoundaryActive: boolean;
  softForceX: number;
  softForceZ: number;
  balanceStress: number;
  boundaryZoneX: "inner" | "brake" | "hard";
  boundaryZoneZ: "inner" | "brake" | "hard";
};

export type CharacterPoseDebug = {
  bodyLeanX: number;
  bodyLeanZ: number;
};

export const initialCharacterMotion: CharacterMotionInput = {
  horizontalSpeed: 0,
  linvelX: 0,
  linvelZ: 0,
  currentTiltX: 0,
  currentTiltZ: 0,
  softBoundaryActive: false,
  softForceX: 0,
  softForceZ: 0,
  balanceStress: 0,
  boundaryZoneX: "inner",
  boundaryZoneZ: "inner",
};

export const initialCharacterPoseDebug: CharacterPoseDebug = {
  bodyLeanX: 0,
  bodyLeanZ: 0,
};

const idleSpeedThreshold = 0.15;
const movingSpeedThreshold = 0.35;
const idleTiltThreshold = 0.018;
const balancingTiltThreshold = 0.028;
const hitForceThreshold = 4;
const hitHoldMs = 300;

export function useCharacterState() {
  const characterStateRef = useRef<CharacterState>("idle");
  const hitBoundaryUntilRef = useRef(0);

  const updateCharacterState = useCallback((input: CharacterMotionInput) => {
    const now = Date.now();
    const tiltAmount = Math.hypot(input.currentTiltX, input.currentTiltZ);
    const softForceAmount = Math.hypot(input.softForceX, input.softForceZ);

    if (input.balanceStress > 0.78) {
      characterStateRef.current = "staggering";
      return characterStateRef.current;
    }

    if (input.softBoundaryActive || softForceAmount > hitForceThreshold) {
      hitBoundaryUntilRef.current = now + hitHoldMs;
    }

    if (now < hitBoundaryUntilRef.current) {
      characterStateRef.current = "recovering";
      return characterStateRef.current;
    }

    if (input.balanceStress > 0.34) {
      characterStateRef.current = "balancing";
      return characterStateRef.current;
    }

    if (input.horizontalSpeed >= movingSpeedThreshold) {
      characterStateRef.current = "moving";
      return characterStateRef.current;
    }

    if (
      input.horizontalSpeed < idleSpeedThreshold &&
      tiltAmount < idleTiltThreshold &&
      !input.softBoundaryActive
    ) {
      characterStateRef.current = "idle";
      return characterStateRef.current;
    }

    if (tiltAmount > balancingTiltThreshold) {
      characterStateRef.current = "balancing";
      return characterStateRef.current;
    }

    characterStateRef.current =
      input.horizontalSpeed > idleSpeedThreshold ? "moving" : "balancing";
    return characterStateRef.current;
  }, []);

  return { characterStateRef, updateCharacterState };
}

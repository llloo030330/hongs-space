import { useBeforePhysicsStep, type RapierRigidBody } from "@react-three/rapier";
import { useRef, type RefObject } from "react";
import type { CubePhysicsMode } from "@/components/physics-cube/KinematicCubeContainer";

export const softBoundaryConfig = {
  innerLimit: 1.35,
  brakeLimit: 1.55,
  hardLimit: 1.75,
  innerAbsorption: 0.9,
  brakeAbsorption: 0.65,
  hardCorrectionLerp: 0.15,
};

export type BoundaryZone = "inner" | "brake" | "hard";

export type SoftBoundaryDebugState = {
  innerLimit: number;
  brakeLimit: number;
  hardLimit: number;
  zoneX: BoundaryZone;
  zoneZ: BoundaryZone;
  outwardVelocityX: number;
  outwardVelocityZ: number;
  wasVelocityAbsorbed: boolean;
  emergencyCorrectionActive: boolean;
  boundaryOverflowX: number;
  boundaryOverflowZ: number;
  softForce: { x: number; y: number; z: number };
  isSoftBoundaryActive: boolean;
};

type UseSoftBoundaryForceOptions = {
  disabledRef?: RefObject<boolean>;
  mode: CubePhysicsMode;
};

const inactiveSoftBoundaryDebug: SoftBoundaryDebugState = {
  innerLimit: softBoundaryConfig.innerLimit,
  brakeLimit: softBoundaryConfig.brakeLimit,
  hardLimit: softBoundaryConfig.hardLimit,
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

export function useSoftBoundaryForce(
  bodyRef: RefObject<RapierRigidBody | null>,
  { disabledRef, mode }: UseSoftBoundaryForceOptions,
) {
  const debugRef = useRef<SoftBoundaryDebugState>(inactiveSoftBoundaryDebug);

  useBeforePhysicsStep(() => {
    const body = bodyRef.current;
    if (!body || mode !== "soft-walls" || disabledRef?.current) {
      debugRef.current = inactiveSoftBoundaryDebug;
      return;
    }

    const position = body.translation();
    const velocity = body.linvel();
    const boundaryX = getBoundaryAxis(position.x, velocity.x);
    const boundaryZ = getBoundaryAxis(position.z, velocity.z);
    const wasVelocityAbsorbed =
      boundaryX.wasVelocityAbsorbed || boundaryZ.wasVelocityAbsorbed;
    const emergencyCorrectionActive =
      boundaryX.emergencyCorrectionActive ||
      boundaryZ.emergencyCorrectionActive;

    if (wasVelocityAbsorbed) {
      body.setLinvel(
        {
          x: boundaryX.nextVelocity,
          y: velocity.y,
          z: boundaryZ.nextVelocity,
        },
        false,
      );
    }

    if (emergencyCorrectionActive) {
      body.setTranslation(
        {
          x: boundaryX.correctedPosition,
          y: position.y,
          z: boundaryZ.correctedPosition,
        },
        false,
      );
    }

    debugRef.current = {
      innerLimit: softBoundaryConfig.innerLimit,
      brakeLimit: softBoundaryConfig.brakeLimit,
      hardLimit: softBoundaryConfig.hardLimit,
      zoneX: boundaryX.zone,
      zoneZ: boundaryZ.zone,
      outwardVelocityX: boundaryX.outwardVelocity,
      outwardVelocityZ: boundaryZ.outwardVelocity,
      wasVelocityAbsorbed,
      emergencyCorrectionActive,
      boundaryOverflowX: boundaryX.overflow,
      boundaryOverflowZ: boundaryZ.overflow,
      softForce: { x: 0, y: 0, z: 0 },
      isSoftBoundaryActive:
        boundaryX.zone !== "inner" || boundaryZ.zone !== "inner",
    };
  });

  return debugRef;
}

function getBoundaryAxis(position: number, velocity: number) {
  const absPosition = Math.abs(position);
  const side = position >= 0 ? 1 : -1;
  const outwardVelocity = velocity * side;
  const zone = getZone(absPosition);
  let nextVelocity = velocity;
  let wasVelocityAbsorbed = false;
  let correctedPosition = position;
  let emergencyCorrectionActive = false;

  if (absPosition > softBoundaryConfig.innerLimit && outwardVelocity > 0) {
    const absorption =
      absPosition > softBoundaryConfig.brakeLimit
        ? softBoundaryConfig.brakeAbsorption
        : softBoundaryConfig.innerAbsorption;

    nextVelocity = velocity * absorption;
    wasVelocityAbsorbed = true;
  }

  if (absPosition > softBoundaryConfig.hardLimit) {
    correctedPosition = lerp(
      position,
      side * softBoundaryConfig.hardLimit,
      softBoundaryConfig.hardCorrectionLerp,
    );
    emergencyCorrectionActive = true;
  }

  return {
    zone,
    outwardVelocity,
    nextVelocity,
    wasVelocityAbsorbed,
    correctedPosition,
    emergencyCorrectionActive,
    overflow: Math.max(0, absPosition - softBoundaryConfig.brakeLimit),
  };
}

function getZone(absPosition: number): BoundaryZone {
  if (absPosition > softBoundaryConfig.hardLimit) return "hard";
  if (absPosition > softBoundaryConfig.innerLimit) return "brake";
  return "inner";
}

function lerp(from: number, to: number, alpha: number) {
  return from + (to - from) * alpha;
}

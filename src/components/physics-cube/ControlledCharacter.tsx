import { useFrame } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import {
  HumanSilhouette,
  humanSilhouetteOffset,
  humanSilhouetteScale,
} from "@/components/physics-cube/HumanSilhouette";
import type { BodyDebugState } from "@/components/physics-cube/TestBall";
import {
  initialCharacterMotion,
  initialCharacterPoseDebug,
  type CharacterMotionInput,
  type CharacterState,
} from "@/components/physics-cube/useCharacterState";
import { maxTiltRadians } from "@/components/physics-cube/useCubeTilt";

const initialPosition = { x: 0, y: -1.1, z: 0 };
const slidePower = 1.92;
const balancePower = 0.7;
const damping = 3;
const maxSpeed = 1.3;
const maxAcceleration = 3;
const innerLimit = 1.35;
const brakeLimit = 1.55;
const hardLimit = 1.75;
const innerAbsorption = 0.82;
const brakeAbsorption = 0.5;
const minFrameDelta = 1 / 90;
const maxFrameDelta = 1 / 30;

type BoundaryZone = "inner" | "brake" | "hard";

type ControlledCharacterProps = {
  resetCount: number;
  debugHumanVisible: boolean;
  showCollider: boolean;
  showHuman: boolean;
  showSilhouetteVolumeDebug: boolean;
  currentTiltX: number;
  currentTiltZ: number;
  tiltVelocityX: number;
  tiltVelocityZ: number;
  disturbanceStrength: number;
  onDebugChange: (debug: BodyDebugState) => void;
};

export function ControlledCharacter({
  resetCount,
  debugHumanVisible,
  showCollider,
  showHuman,
  showSilhouetteVolumeDebug,
  currentTiltX,
  currentTiltZ,
  tiltVelocityX,
  tiltVelocityZ,
  disturbanceStrength,
  onDebugChange,
}: ControlledCharacterProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const positionRef = useRef(initialPosition);
  const velocityRef = useRef({ x: 0, y: 0, z: 0 });
  const currentYawRef = useRef(0);
  const humanYawRef = useRef(0);
  const targetYawRef = useRef(0);
  const characterStateRef = useRef<CharacterState>("idle");
  const characterMotionRef = useRef<CharacterMotionInput>(
    initialCharacterMotion,
  );
  const characterPoseDebugRef = useRef(initialCharacterPoseDebug);
  const reportTimeRef = useRef(0);

  useEffect(() => {
    positionRef.current = initialPosition;
    velocityRef.current = { x: 0, y: 0, z: 0 };
    currentYawRef.current = 0;
    humanYawRef.current = 0;
    targetYawRef.current = 0;
    characterStateRef.current = "idle";
    characterMotionRef.current = initialCharacterMotion;
    characterPoseDebugRef.current = initialCharacterPoseDebug;
    bodyRef.current?.setTranslation(initialPosition, true);
  }, [resetCount]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const frameDelta = Math.min(Math.max(delta, minFrameDelta), maxFrameDelta);
    const position = { ...positionRef.current };
    const velocity = { ...velocityRef.current };
    const slope = getSlope(currentTiltX, currentTiltZ);
    const tiltVelocityStress = Math.min(
      1,
      Math.hypot(tiltVelocityX, tiltVelocityZ) / 1.05,
    );
    const speed = Math.hypot(velocity.x, velocity.z);
    const boundaryBefore = getBoundaryState(position, velocity);
    const boundaryStress =
      boundaryBefore.zoneX === "hard" || boundaryBefore.zoneZ === "hard"
        ? 1
        : boundaryBefore.zoneX === "brake" || boundaryBefore.zoneZ === "brake"
          ? 0.45
          : 0;
    const balanceStress = Math.min(
      1,
      slope.strength * 0.55 +
        tiltVelocityStress * 0.35 +
        disturbanceStrength * 0.22 +
        (speed / maxSpeed) * 0.18 +
        boundaryStress * 0.3,
    );
    const balanceResponse = 0.45 + balanceStress * 0.25;
    const slideAccel = {
      x: slope.x * slope.strength * slidePower,
      z: slope.z * slope.strength * slidePower,
    };
    const balanceAccel = {
      x: -slope.x * slope.strength * balancePower * balanceResponse,
      z: -slope.z * slope.strength * balancePower * balanceResponse,
    };
    const dampingAccel = {
      x: -velocity.x * damping,
      z: -velocity.z * damping,
    };
    const acceleration = clampVector(
      {
        x: slideAccel.x + balanceAccel.x + dampingAccel.x,
        z: slideAccel.z + balanceAccel.z + dampingAccel.z,
      },
      maxAcceleration,
    );

    velocity.x += acceleration.x * frameDelta;
    velocity.z += acceleration.z * frameDelta;

    const nextSpeed = Math.hypot(velocity.x, velocity.z);
    if (nextSpeed > maxSpeed) {
      const scale = maxSpeed / nextSpeed;
      velocity.x *= scale;
      velocity.z *= scale;
    }

    if (slope.strength < 0.02 && nextSpeed < 0.025) {
      velocity.x = 0;
      velocity.z = 0;
    }

    position.x += velocity.x * frameDelta;
    position.z += velocity.z * frameDelta;

    const boundary = applyBoundary(position, velocity);
    positionRef.current = {
      x: boundary.position.x,
      y: initialPosition.y,
      z: boundary.position.z,
    };
    velocityRef.current = { x: boundary.velocity.x, y: 0, z: boundary.velocity.z };

    const horizontalSpeed = Math.hypot(
      velocityRef.current.x,
      velocityRef.current.z,
    );
    if (horizontalSpeed > 0.05) {
      targetYawRef.current = Math.atan2(
        velocityRef.current.x,
        velocityRef.current.z,
      );
      currentYawRef.current = dampAngle(
        currentYawRef.current,
        targetYawRef.current,
        5,
        frameDelta,
      );
    }

    characterStateRef.current = getBalanceState(
      balanceStress,
      boundary.wasVelocityAbsorbed,
      boundary.emergencyCorrectionActive,
      horizontalSpeed,
    );
    characterMotionRef.current = {
      horizontalSpeed,
      linvelX: velocityRef.current.x,
      linvelZ: velocityRef.current.z,
      currentTiltX,
      currentTiltZ,
      softBoundaryActive: boundary.zoneX !== "inner" || boundary.zoneZ !== "inner",
      softForceX: 0,
      softForceZ: 0,
      balanceStress,
      boundaryZoneX: boundary.zoneX,
      boundaryZoneZ: boundary.zoneZ,
    };

    body?.setNextKinematicTranslation(positionRef.current);
    reportTimeRef.current += frameDelta;

    if (reportTimeRef.current > 0.12) {
      onDebugChange({
        position: positionRef.current,
        humanPosition: getHumanPosition(positionRef.current),
        linvel: velocityRef.current,
        angvel: { x: 0, y: 0, z: 0 },
        isSleeping: horizontalSpeed < 0.01 && slope.strength < 0.02,
        friction: 0,
        restitution: 0,
        linearDamping: 0,
        angularDamping: 0,
        horizontalDrag: damping,
        gravityScale: 0,
        isResetting: false,
        horizontalSpeed,
        maxHorizontalSpeed: maxSpeed,
        angularSpeed: 0,
        maxAngularSpeed: 0,
        lowSpeedStopActive: slope.strength < 0.02 && horizontalSpeed === 0,
        wakeUpEveryFrame: false,
        debugHumanVisible,
        showCollider,
        showHuman,
        showSilhouetteVolumeDebug,
        humanYaw: humanYawRef.current,
        humanScale: humanSilhouetteScale,
        characterState: characterStateRef.current,
        bodyLeanX: characterPoseDebugRef.current.bodyLeanX,
        bodyLeanZ: characterPoseDebugRef.current.bodyLeanZ,
        controlledVelocity: velocityRef.current,
        slopeDirectionX: slope.x,
        slopeDirectionZ: slope.z,
        slopeStrength: slope.strength,
        balanceStress,
        controlledMaxSpeed: maxSpeed,
        controlledDamping: damping,
        slidePower,
        balancePower,
        innerLimit,
        brakeLimit,
        hardLimit,
        zoneX: boundary.zoneX,
        zoneZ: boundary.zoneZ,
        outwardVelocityX: boundary.outwardVelocityX,
        outwardVelocityZ: boundary.outwardVelocityZ,
        wasVelocityAbsorbed: boundary.wasVelocityAbsorbed,
        emergencyCorrectionActive: boundary.emergencyCorrectionActive,
        boundaryOverflowX: boundary.overflowX,
        boundaryOverflowZ: boundary.overflowZ,
        softForce: { x: 0, y: 0, z: 0 },
        isSoftBoundaryActive:
          boundary.zoneX !== "inner" || boundary.zoneZ !== "inner",
      });
      reportTimeRef.current = 0;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[initialPosition.x, initialPosition.y, initialPosition.z]}
    >
      {showCollider && (
        <mesh castShadow>
          <capsuleGeometry args={[0.25, 1, 18, 36]} />
          <meshPhysicalMaterial
            color="#f6f6f2"
            transparent
            opacity={0.24}
            roughness={0.32}
            metalness={0}
            transmission={0.14}
            thickness={0.28}
          />
        </mesh>
      )}
      <HumanSilhouette
        debugVisible={debugHumanVisible}
        showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
        controlledYawRef={currentYawRef}
        characterStateRef={characterStateRef}
        motionRef={characterMotionRef}
        poseDebugRef={characterPoseDebugRef}
        yawRef={humanYawRef}
        visible={showHuman}
      />
    </RigidBody>
  );
}

function getSlope(currentTiltX: number, currentTiltZ: number) {
  const rawX = Math.sin(currentTiltZ);
  const rawZ = -Math.sin(currentTiltX);
  const length = Math.hypot(rawX, rawZ);
  const maxSlope = Math.sin(maxTiltRadians);
  const strength = Math.min(1, length / Math.max(0.0001, maxSlope));

  if (length < 0.0001) {
    return { x: 0, z: 0, strength: 0 };
  }

  return {
    x: rawX / length,
    z: rawZ / length,
    strength,
  };
}

function applyBoundary(
  position: { x: number; z: number },
  velocity: { x: number; z: number },
) {
  const x = applyBoundaryAxis(position.x, velocity.x);
  const z = applyBoundaryAxis(position.z, velocity.z);

  return {
    position: { x: x.position, z: z.position },
    velocity: { x: x.velocity, z: z.velocity },
    zoneX: x.zone,
    zoneZ: z.zone,
    outwardVelocityX: x.outwardVelocity,
    outwardVelocityZ: z.outwardVelocity,
    wasVelocityAbsorbed: x.wasVelocityAbsorbed || z.wasVelocityAbsorbed,
    emergencyCorrectionActive:
      x.emergencyCorrectionActive || z.emergencyCorrectionActive,
    overflowX: x.overflow,
    overflowZ: z.overflow,
  };
}

function getBoundaryState(
  position: { x: number; z: number },
  velocity: { x: number; z: number },
) {
  const x = applyBoundaryAxis(position.x, velocity.x, true);
  const z = applyBoundaryAxis(position.z, velocity.z, true);

  return { zoneX: x.zone, zoneZ: z.zone };
}

function applyBoundaryAxis(
  position: number,
  velocity: number,
  readOnly = false,
) {
  const absPosition = Math.abs(position);
  const side = position >= 0 ? 1 : -1;
  const outwardVelocity = velocity * side;
  const zone = getBoundaryZone(absPosition);
  let nextVelocity = velocity;
  let nextPosition = position;
  let wasVelocityAbsorbed = false;
  let emergencyCorrectionActive = false;

  if (!readOnly && absPosition > innerLimit && outwardVelocity > 0) {
    nextVelocity *= absPosition > brakeLimit ? brakeAbsorption : innerAbsorption;
    wasVelocityAbsorbed = true;
  }

  if (!readOnly && absPosition > hardLimit) {
    nextPosition = side * hardLimit;
    nextVelocity = side > 0 ? Math.min(nextVelocity, 0) : Math.max(nextVelocity, 0);
    emergencyCorrectionActive = true;
  }

  return {
    position: nextPosition,
    velocity: nextVelocity,
    zone,
    outwardVelocity,
    wasVelocityAbsorbed,
    emergencyCorrectionActive,
    overflow: Math.max(0, absPosition - brakeLimit),
  };
}

function getBoundaryZone(absPosition: number): BoundaryZone {
  if (absPosition > hardLimit) return "hard";
  if (absPosition > innerLimit) return "brake";
  return "inner";
}

function getBalanceState(
  balanceStress: number,
  wasVelocityAbsorbed: boolean,
  emergencyCorrectionActive: boolean,
  horizontalSpeed: number,
): CharacterState {
  if (emergencyCorrectionActive || wasVelocityAbsorbed) return "recovering";
  if (balanceStress > 0.72) return "staggering";
  if (balanceStress > 0.2) return "balancing";
  return horizontalSpeed > 0.08 ? "balancing" : "idle";
}

function clampVector(vector: { x: number; z: number }, maxLength: number) {
  const length = Math.hypot(vector.x, vector.z);

  if (length <= maxLength || length < 0.0001) {
    return vector;
  }

  const scale = maxLength / length;

  return {
    x: vector.x * scale,
    z: vector.z * scale,
  };
}

function dampAngle(current: number, target: number, damping: number, delta: number) {
  const difference = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current),
  );
  const factor = 1 - Math.exp(-damping * delta);

  return current + difference * factor;
}

function getHumanPosition(position: { x: number; y: number; z: number }) {
  return {
    x: position.x + humanSilhouetteOffset.x,
    y: position.y + humanSilhouetteOffset.y,
    z: position.z + humanSilhouetteOffset.z,
  };
}

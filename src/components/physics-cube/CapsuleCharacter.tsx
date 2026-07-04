import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  useBeforePhysicsStep,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import {
  HumanSilhouette,
  humanSilhouetteOffset,
  humanSilhouetteScale,
} from "@/components/physics-cube/HumanSilhouette";
import type { CubePhysicsMode } from "@/components/physics-cube/KinematicCubeContainer";
import type { BodyDebugState } from "@/components/physics-cube/TestBall";
import {
  softBoundaryConfig,
  useSoftBoundaryForce,
} from "@/components/physics-cube/useSoftBoundaryForce";
import {
  initialCharacterMotion,
  initialCharacterPoseDebug,
  useCharacterState,
  type CharacterMotionInput,
} from "@/components/physics-cube/useCharacterState";

const initialPosition = { x: 0, y: -1.1, z: 0 };
const capsuleRadius = 0.25;
const capsuleHalfHeight = 0.5;
const capsuleVisualLength = capsuleHalfHeight * 2;
const capsuleMass = 2.2;
const capsuleFriction = 0.45;
const capsuleLinearDamping = 0.8;
const capsuleAngularDamping = 10;
const capsuleRestitution = 0;
const tiltSlideGravity = 13;
const horizontalDrag = 3;
const maxHorizontalSpeed = 1.5;
const maxAngularSpeed = 1.8;
const stopTiltThreshold = 0.02;
const stopSpeedThreshold = 0.05;
const stopAngularSpeedThreshold = 0.2;
const forceEpsilon = 0.0001;
const resetProtectionMs = 200;

export type CapsuleDebugState = BodyDebugState & {
  isColliding: boolean;
};

type CapsuleCharacterProps = {
  mode: CubePhysicsMode;
  resetCount: number;
  debugHumanVisible: boolean;
  showCollider: boolean;
  showHuman: boolean;
  showSilhouetteVolumeDebug: boolean;
  currentTiltX: number;
  currentTiltZ: number;
  onDebugChange: (debug: CapsuleDebugState) => void;
};

export function CapsuleCharacter({
  mode,
  resetCount,
  debugHumanVisible,
  showCollider,
  showHuman,
  showSilhouetteVolumeDebug,
  currentTiltX,
  currentTiltZ,
  onDebugChange,
}: CapsuleCharacterProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const humanYawRef = useRef(0);
  const characterMotionRef = useRef<CharacterMotionInput>(
    initialCharacterMotion,
  );
  const characterPoseDebugRef = useRef(initialCharacterPoseDebug);
  const tiltRef = useRef({ currentTiltX: 0, currentTiltZ: 0 });
  const reportTimeRef = useRef(0);
  const isResettingRef = useRef(false);
  const isCollidingRef = useRef(false);
  const lowSpeedStopActiveRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { characterStateRef, updateCharacterState } = useCharacterState();
  const softBoundaryDebugRef = useSoftBoundaryForce(bodyRef, {
    disabledRef: isResettingRef,
    mode,
  });
  tiltRef.current = { currentTiltX, currentTiltZ };

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    isResettingRef.current = true;
    isCollidingRef.current = false;
    lowSpeedStopActiveRef.current = false;
    body.setTranslation(initialPosition, true);
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    body.resetForces(true);
    body.resetTorques(true);
    body.wakeUp();
    characterMotionRef.current = initialCharacterMotion;
    characterPoseDebugRef.current = initialCharacterPoseDebug;
    characterStateRef.current = "idle";
    onDebugChange({
      position: initialPosition,
      humanPosition: getHumanPosition(initialPosition),
      linvel: { x: 0, y: 0, z: 0 },
      angvel: { x: 0, y: 0, z: 0 },
      isSleeping: false,
      friction: capsuleFriction,
      linearDamping: capsuleLinearDamping,
      angularDamping: capsuleAngularDamping,
      restitution: capsuleRestitution,
      horizontalDrag,
      gravityScale: 1,
      isResetting: true,
      horizontalSpeed: 0,
      maxHorizontalSpeed,
      angularSpeed: 0,
      maxAngularSpeed,
      lowSpeedStopActive: false,
      wakeUpEveryFrame: false,
      debugHumanVisible,
      showCollider,
      showHuman,
      showSilhouetteVolumeDebug,
      humanYaw: humanYawRef.current,
      humanScale: humanSilhouetteScale,
      characterState: "idle",
      bodyLeanX: 0,
      bodyLeanZ: 0,
      controlledVelocity: { x: 0, y: 0, z: 0 },
      slopeDirectionX: 0,
      slopeDirectionZ: 0,
      slopeStrength: 0,
      balanceStress: 0,
      controlledMaxSpeed: 0,
      controlledDamping: 0,
      slidePower: 0,
      balancePower: 0,
      isColliding: false,
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
    });

    resetTimerRef.current = setTimeout(() => {
      isResettingRef.current = false;
      resetTimerRef.current = null;
    }, resetProtectionMs);

    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, [resetCount]);

  useBeforePhysicsStep(() => {
    const body = bodyRef.current;
    if (!body) return;

    lowSpeedStopActiveRef.current = false;
    const position = body.translation();
    const linvel = body.linvel();
    const angvel = body.angvel();
    const horizontalSpeed = Math.hypot(linvel.x, linvel.z);
    const angularSpeed = Math.hypot(angvel.x, angvel.y, angvel.z);
    const nextVelocity = { x: linvel.x, y: linvel.y, z: linvel.z };
    let shouldUpdateVelocity = false;
    const slopeForce = limitOutwardSlopeForce(position, {
      x:
        Math.sin(tiltRef.current.currentTiltZ) *
        capsuleMass *
        tiltSlideGravity,
      y: 0,
      z:
        -Math.sin(tiltRef.current.currentTiltX) *
        capsuleMass *
        tiltSlideGravity,
    });

    if (
      !isResettingRef.current &&
      Math.hypot(slopeForce.x, slopeForce.z) > forceEpsilon
    ) {
      body.addForce(slopeForce, true);
    }

    if (horizontalSpeed > stopSpeedThreshold) {
      body.addForce(
        {
          x: -linvel.x * horizontalDrag,
          y: 0,
          z: -linvel.z * horizontalDrag,
        },
        false,
      );
    }

    if (horizontalSpeed > maxHorizontalSpeed) {
      const scale = maxHorizontalSpeed / horizontalSpeed;

      nextVelocity.x *= scale;
      nextVelocity.z *= scale;
      shouldUpdateVelocity = true;
    }

    if (
      Math.abs(tiltRef.current.currentTiltX) < stopTiltThreshold &&
      Math.abs(tiltRef.current.currentTiltZ) < stopTiltThreshold &&
      horizontalSpeed < stopSpeedThreshold &&
      angularSpeed < stopAngularSpeedThreshold &&
      Math.abs(position.x) < softBoundaryConfig.innerLimit &&
      Math.abs(position.z) < softBoundaryConfig.innerLimit &&
      horizontalSpeed > 0
    ) {
      nextVelocity.x = 0;
      nextVelocity.z = 0;
      shouldUpdateVelocity = true;
      lowSpeedStopActiveRef.current = true;
    }

    if (shouldUpdateVelocity) {
      body.setLinvel(nextVelocity, false);
    }

    if (angularSpeed > maxAngularSpeed) {
      const scale = maxAngularSpeed / angularSpeed;

      body.setAngvel(
        {
          x: angvel.x * scale,
          y: angvel.y * scale,
          z: angvel.z * scale,
        },
        false,
      );
    }
  });

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const linvel = body.linvel();
    const horizontalSpeed = Math.hypot(linvel.x, linvel.z);
    const softBoundaryDebug = softBoundaryDebugRef.current;
    const characterMotion: CharacterMotionInput = {
      horizontalSpeed,
      linvelX: linvel.x,
      linvelZ: linvel.z,
      currentTiltX,
      currentTiltZ,
      softBoundaryActive: softBoundaryDebug.isSoftBoundaryActive,
      softForceX: softBoundaryDebug.softForce.x,
      softForceZ: softBoundaryDebug.softForce.z,
      balanceStress: 0,
      boundaryZoneX: softBoundaryDebug.zoneX,
      boundaryZoneZ: softBoundaryDebug.zoneZ,
    };

    characterMotionRef.current = characterMotion;
    updateCharacterState(characterMotion);
    reportTimeRef.current += delta;
    if (reportTimeRef.current > 0.12) {
      const angvel = body.angvel();
      const position = body.translation();

      onDebugChange({
        position,
        humanPosition: getHumanPosition(position),
        linvel,
        angvel,
        isSleeping: body.isSleeping(),
        friction: capsuleFriction,
        linearDamping: capsuleLinearDamping,
        angularDamping: capsuleAngularDamping,
        restitution: capsuleRestitution,
        horizontalDrag,
        gravityScale: 1,
        isResetting: isResettingRef.current,
        horizontalSpeed: Math.hypot(linvel.x, linvel.z),
        maxHorizontalSpeed,
        angularSpeed: Math.hypot(angvel.x, angvel.y, angvel.z),
        maxAngularSpeed,
        lowSpeedStopActive: lowSpeedStopActiveRef.current,
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
        controlledVelocity: { x: 0, y: 0, z: 0 },
        slopeDirectionX: 0,
        slopeDirectionZ: 0,
        slopeStrength: 0,
        balanceStress: 0,
        controlledMaxSpeed: 0,
        controlledDamping: 0,
        slidePower: 0,
        balancePower: 0,
        isColliding: isCollidingRef.current,
        ...softBoundaryDebug,
      });
      reportTimeRef.current = 0;
    }
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        type="dynamic"
        colliders={false}
        position={[initialPosition.x, initialPosition.y, initialPosition.z]}
        mass={capsuleMass}
        friction={capsuleFriction}
        restitution={capsuleRestitution}
        linearDamping={capsuleLinearDamping}
        angularDamping={capsuleAngularDamping}
        gravityScale={1}
        canSleep
        enabledRotations={[false, true, false]}
        onCollisionEnter={() => {
          isCollidingRef.current = true;
        }}
        onCollisionExit={() => {
          isCollidingRef.current = false;
        }}
      >
        <CapsuleCollider
          args={[capsuleHalfHeight, capsuleRadius]}
          friction={capsuleFriction}
          restitution={capsuleRestitution}
        />
        {showCollider && (
          <mesh castShadow>
            <capsuleGeometry args={[capsuleRadius, capsuleVisualLength, 18, 36]} />
            <meshPhysicalMaterial
              color="#f6f6f2"
              transparent
              opacity={0.32}
              roughness={0.28}
              metalness={0}
              transmission={0.18}
              thickness={0.32}
            />
          </mesh>
        )}
        <HumanSilhouette
          bodyRef={bodyRef}
          debugVisible={debugHumanVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          characterStateRef={characterStateRef}
          motionRef={characterMotionRef}
          poseDebugRef={characterPoseDebugRef}
          yawRef={humanYawRef}
          visible={showHuman}
        />
      </RigidBody>
    </>
  );
}

function getHumanPosition(position: { x: number; y: number; z: number }) {
  return {
    x: position.x + humanSilhouetteOffset.x,
    y: position.y + humanSilhouetteOffset.y,
    z: position.z + humanSilhouetteOffset.z,
  };
}

function limitOutwardSlopeForce(
  position: { x: number; z: number },
  force: { x: number; y: number; z: number },
) {
  return {
    x: limitAxisOutwardForce(position.x, force.x),
    y: force.y,
    z: limitAxisOutwardForce(position.z, force.z),
  };
}

function limitAxisOutwardForce(position: number, force: number) {
  const absPosition = Math.abs(position);
  const side = position >= 0 ? 1 : -1;
  const isOutwardForce = force * side > 0;

  if (!isOutwardForce || absPosition <= softBoundaryConfig.innerLimit) {
    return force;
  }

  if (absPosition >= softBoundaryConfig.brakeLimit) {
    return 0;
  }

  const brakeProgress =
    (absPosition - softBoundaryConfig.innerLimit) /
    (softBoundaryConfig.brakeLimit - softBoundaryConfig.innerLimit);

  return force * (1 - brakeProgress);
}

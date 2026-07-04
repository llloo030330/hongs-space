import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useRef, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import {
  initialCharacterMotion,
  type CharacterMotionInput,
  type CharacterPoseDebug,
  type CharacterState,
} from "@/components/physics-cube/useCharacterState";

type HumanSilhouetteProps = {
  bodyRef?: RefObject<RapierRigidBody | null>;
  characterStateRef?: MutableRefObject<CharacterState>;
  debugVisible: boolean;
  motionRef?: MutableRefObject<CharacterMotionInput>;
  poseDebugRef?: MutableRefObject<CharacterPoseDebug>;
  controlledYawRef?: MutableRefObject<number>;
  showSilhouetteVolumeDebug?: boolean;
  yawRef?: MutableRefObject<number>;
  visible?: boolean;
};

export const humanSilhouetteScale = 1;
export const humanSilhouetteOffset = { x: 0, y: 0.08, z: 0 };
export const humanSilhouetteHeight = 1.62;
export const humanSilhouetteShoulderWidth = 0.64;
export const humanSilhouetteLimbRadii = {
  upperArm: 0.065,
  forearm: 0.055,
  thigh: 0.085,
  calf: 0.068,
};

export function HumanSilhouette({
  bodyRef,
  characterStateRef,
  debugVisible,
  motionRef,
  poseDebugRef,
  controlledYawRef,
  showSilhouetteVolumeDebug = false,
  yawRef,
  visible = true,
}: HumanSilhouetteProps) {
  const groupRef = useRef<THREE.Group>(null);
  const poseRootRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const yaw = useRef(0);

  useFrame((state, delta) => {
    const body = bodyRef?.current;
    const group = groupRef.current;
    const poseRoot = poseRootRef.current;
    const torso = torsoRef.current;
    const head = headRef.current;
    const leftArm = leftArmRef.current;
    const rightArm = rightArmRef.current;
    const leftLeg = leftLegRef.current;
    const rightLeg = rightLegRef.current;
    const motion = motionRef?.current ?? getBodyMotion(body);
    const characterState = characterStateRef?.current ?? "idle";

    if (!group) return;

    if (controlledYawRef) {
      yaw.current = dampAngle(yaw.current, controlledYawRef.current, 5, delta);
      if (yawRef) {
        yawRef.current = yaw.current;
      }
    } else if (motion.horizontalSpeed > 0.1) {
      const targetYaw = Math.atan2(motion.linvelX, motion.linvelZ);

      yaw.current = dampAngle(yaw.current, targetYaw, 4, delta);
      if (yawRef) {
        yawRef.current = yaw.current;
      }
    }

    group.visible = visible;
    group.rotation.set(0, yaw.current, 0);

    const pose = getPoseTargets(characterState, motion, state.clock.elapsedTime);

    if (poseRoot) {
      poseRoot.rotation.x = dampValue(
        poseRoot.rotation.x,
        pose.bodyLeanX,
        5,
        delta,
      );
      poseRoot.rotation.z = dampValue(
        poseRoot.rotation.z,
        pose.bodyLeanZ,
        5,
        delta,
      );

      if (poseDebugRef) {
        poseDebugRef.current = {
          bodyLeanX: poseRoot.rotation.x,
          bodyLeanZ: poseRoot.rotation.z,
        };
      }
    }

    if (torso) {
      torso.position.y = dampValue(torso.position.y, pose.breathOffset, 6, delta);
    }

    if (head) {
      head.rotation.x = dampValue(head.rotation.x, pose.bodyLeanX * 0.18, 6, delta);
      head.rotation.z = dampValue(head.rotation.z, pose.bodyLeanZ * 0.18, 6, delta);
    }

    if (leftArm) {
      leftArm.rotation.x = dampValue(leftArm.rotation.x, pose.armSwing, 6, delta);
      leftArm.rotation.z = dampValue(
        leftArm.rotation.z,
        0.12 + pose.armSpread,
        6,
        delta,
      );
    }

    if (rightArm) {
      rightArm.rotation.x = dampValue(rightArm.rotation.x, -pose.armSwing, 6, delta);
      rightArm.rotation.z = dampValue(
        rightArm.rotation.z,
        -0.12 - pose.armSpread,
        6,
        delta,
      );
    }

    if (leftLeg) {
      leftLeg.rotation.x = dampValue(leftLeg.rotation.x, -pose.legSwing, 6, delta);
      leftLeg.rotation.z = dampValue(leftLeg.rotation.z, -0.025, 6, delta);
    }

    if (rightLeg) {
      rightLeg.rotation.x = dampValue(rightLeg.rotation.x, pose.legSwing, 6, delta);
      rightLeg.rotation.z = dampValue(rightLeg.rotation.z, 0.025, 6, delta);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        humanSilhouetteOffset.x,
        humanSilhouetteOffset.y,
        humanSilhouetteOffset.z,
      ]}
      scale={humanSilhouetteScale}
      visible={visible}
    >
      <group ref={poseRootRef}>
        <group ref={torsoRef}>
          <mesh position={[0, 0.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.06, 0.52, 10, 24]} />
            <SilhouetteMaterial
              debugVisible={debugVisible}
              showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
              opacity={0.68}
            />
          </mesh>

          <mesh position={[0, 0.04, 0]} scale={[0.32, 0.42, 0.18]} castShadow>
            <sphereGeometry args={[1, 32, 24]} />
            <SilhouetteMaterial
              debugVisible={debugVisible}
              showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
              opacity={0.68}
            />
          </mesh>

          <mesh position={[0, -0.31, 0]} scale={[0.27, 0.18, 0.16]} castShadow>
            <sphereGeometry args={[1, 28, 20]} />
            <SilhouetteMaterial
              debugVisible={debugVisible}
              showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
              opacity={0.66}
            />
          </mesh>

          <mesh position={[0, 0.33, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.078, 0.12, 18]} />
            <SilhouetteMaterial
              debugVisible={debugVisible}
              showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
              opacity={0.66}
            />
          </mesh>

          <mesh
            ref={headRef}
            position={[0, 0.56, 0]}
            scale={[0.2, 0.25, 0.2]}
            castShadow
          >
            <sphereGeometry args={[1, 32, 24]} />
            <SilhouetteMaterial
              debugVisible={debugVisible}
              showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
              opacity={0.7}
            />
          </mesh>
        </group>

        <Arm
          refGroup={leftArmRef}
          side="left"
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
        />
        <Arm
          refGroup={rightArmRef}
          side="right"
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
        />
        <Leg
          refGroup={leftLegRef}
          side="left"
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
        />
        <Leg
          refGroup={rightLegRef}
          side="right"
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
        />
      </group>
    </group>
  );
}

function Arm({
  refGroup,
  side,
  debugVisible,
  showSilhouetteVolumeDebug,
}: {
  refGroup: MutableRefObject<THREE.Group | null>;
  side: "left" | "right";
  debugVisible: boolean;
  showSilhouetteVolumeDebug: boolean;
}) {
  const sign = side === "left" ? -1 : 1;

  return (
    <group ref={refGroup} position={[sign * 0.32, 0.22, 0]} rotation={[0, 0, sign * -0.12]}>
      <mesh position={[0, -0.18, 0]} castShadow>
        <capsuleGeometry args={[humanSilhouetteLimbRadii.upperArm, 0.28, 10, 20]} />
        <SilhouetteMaterial
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          opacity={0.64}
        />
      </mesh>
      <mesh position={[0, -0.48, 0]} castShadow>
        <capsuleGeometry args={[humanSilhouetteLimbRadii.forearm, 0.24, 10, 20]} />
        <SilhouetteMaterial
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          opacity={0.62}
        />
      </mesh>
      <mesh position={[0, -0.68, 0.01]} scale={[0.058, 0.07, 0.048]} castShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <SilhouetteMaterial
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

function Leg({
  refGroup,
  side,
  debugVisible,
  showSilhouetteVolumeDebug,
}: {
  refGroup: MutableRefObject<THREE.Group | null>;
  side: "left" | "right";
  debugVisible: boolean;
  showSilhouetteVolumeDebug: boolean;
}) {
  const sign = side === "left" ? -1 : 1;

  return (
    <group ref={refGroup} position={[sign * 0.12, -0.38, 0]} rotation={[0, 0, sign * 0.025]}>
      <mesh position={[0, -0.15, 0]} castShadow>
        <capsuleGeometry args={[humanSilhouetteLimbRadii.thigh, 0.24, 10, 22]} />
        <SilhouetteMaterial
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          opacity={0.68}
        />
      </mesh>
      <mesh position={[0, -0.44, 0]} castShadow>
        <capsuleGeometry args={[humanSilhouetteLimbRadii.calf, 0.2, 10, 22]} />
        <SilhouetteMaterial
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          opacity={0.66}
        />
      </mesh>
      <mesh position={[0, -0.62, 0.055]} scale={[0.085, 0.035, 0.15]} castShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <SilhouetteMaterial
          debugVisible={debugVisible}
          showSilhouetteVolumeDebug={showSilhouetteVolumeDebug}
          opacity={0.62}
        />
      </mesh>
    </group>
  );
}

function SilhouetteMaterial({
  debugVisible,
  showSilhouetteVolumeDebug,
  opacity,
}: {
  debugVisible: boolean;
  showSilhouetteVolumeDebug: boolean;
  opacity: number;
}) {
  if (debugVisible || showSilhouetteVolumeDebug) {
    return <meshStandardMaterial color="#111111" roughness={0.85} metalness={0} />;
  }

  return (
    <meshStandardMaterial
      color="#171717"
      transparent
      opacity={opacity}
      roughness={0.85}
      metalness={0}
    />
  );
}

function dampAngle(current: number, target: number, damping: number, delta: number) {
  const difference = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current),
  );
  const factor = 1 - Math.exp(-damping * delta);

  return current + difference * factor;
}

function getBodyMotion(body?: RapierRigidBody | null): CharacterMotionInput {
  if (!body) return initialCharacterMotion;

  const velocity = body.linvel();

  return {
    ...initialCharacterMotion,
    horizontalSpeed: Math.hypot(velocity.x, velocity.z),
    linvelX: velocity.x,
    linvelZ: velocity.z,
  };
}

function getPoseTargets(
  characterState: CharacterState,
  motion: CharacterMotionInput,
  elapsedTime: number,
) {
  const speedAmount = THREE.MathUtils.clamp(motion.horizontalSpeed / 1.8, 0, 1);
  const stress = THREE.MathUtils.clamp(motion.balanceStress, 0, 1);
  const walkPhase = Math.sin(elapsedTime * (2.1 + speedAmount * 1.6));
  const breathOffset = Math.sin(elapsedTime * 1.15) * 0.0035;

  if (characterState === "staggering") {
    return {
      bodyLeanX: THREE.MathUtils.clamp(
        -motion.currentTiltX * 0.7 + motion.linvelZ * 0.025,
        -0.14,
        0.14,
      ),
      bodyLeanZ: THREE.MathUtils.clamp(
        -motion.currentTiltZ * 0.7 - motion.linvelX * 0.025,
        -0.14,
        0.14,
      ),
      armSpread: 0.18 + stress * 0.18,
      armSwing: walkPhase * 0.018 * speedAmount,
      legSwing: walkPhase * 0.012 * speedAmount,
      breathOffset,
    };
  }

  if (characterState === "recovering" || characterState === "hitBoundary") {
    return {
      bodyLeanX: THREE.MathUtils.clamp(motion.linvelZ * 0.035, -0.09, 0.09),
      bodyLeanZ: THREE.MathUtils.clamp(-motion.linvelX * 0.035, -0.09, 0.09),
      armSpread: 0.12 + stress * 0.12,
      armSwing: 0,
      legSwing: 0,
      breathOffset: breathOffset * 0.5,
    };
  }

  if (characterState === "balancing") {
    return {
      bodyLeanX: THREE.MathUtils.clamp(
        -motion.currentTiltX * (0.42 + stress * 0.24),
        -0.1,
        0.1,
      ),
      bodyLeanZ: THREE.MathUtils.clamp(
        -motion.currentTiltZ * (0.42 + stress * 0.24),
        -0.1,
        0.1,
      ),
      armSpread: 0.045 + stress * 0.18,
      armSwing: 0,
      legSwing: 0,
      breathOffset,
    };
  }

  if (characterState === "moving") {
    return {
      bodyLeanX: -0.045 * speedAmount,
      bodyLeanZ: 0,
      armSpread: 0.012,
      armSwing: walkPhase * 0.024 * speedAmount,
      legSwing: walkPhase * 0.015 * speedAmount,
      breathOffset,
    };
  }

  return {
    bodyLeanX: 0,
    bodyLeanZ: 0,
    armSpread: 0,
    armSwing: 0,
    legSwing: 0,
    breathOffset,
  };
}

function dampValue(current: number, target: number, damping: number, delta: number) {
  return THREE.MathUtils.damp(current, target, damping, delta);
}

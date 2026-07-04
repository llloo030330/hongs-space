import { useFrame } from "@react-three/fiber";
import {
  BallCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import type { CubePhysicsMode } from "@/components/physics-cube/KinematicCubeContainer";
import {
  softBoundaryConfig,
  useSoftBoundaryForce,
  type SoftBoundaryDebugState,
} from "@/components/physics-cube/useSoftBoundaryForce";
import type { CharacterState } from "@/components/physics-cube/useCharacterState";

const initialPosition = { x: 0, y: -1.6, z: 0 };
const ballRadius = 0.25;
const ballMass = 0.45;
const ballFriction = 0.05;
const ballLinearDamping = 0.1;
const ballAngularDamping = 0.1;
const ballMaxHorizontalSpeed = Number.POSITIVE_INFINITY;

export type BodyDebugState = {
  position: { x: number; y: number; z: number };
  humanPosition: { x: number; y: number; z: number };
  linvel: { x: number; y: number; z: number };
  angvel: { x: number; y: number; z: number };
  isSleeping: boolean;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  horizontalDrag: number;
  gravityScale: number;
  isResetting: boolean;
  horizontalSpeed: number;
  maxHorizontalSpeed: number;
  angularSpeed: number;
  maxAngularSpeed: number;
  lowSpeedStopActive: boolean;
  wakeUpEveryFrame: boolean;
  debugHumanVisible: boolean;
  showCollider: boolean;
  showHuman: boolean;
  showSilhouetteVolumeDebug: boolean;
  humanYaw: number;
  humanScale: number;
  characterState: CharacterState;
  bodyLeanX: number;
  bodyLeanZ: number;
  controlledVelocity: { x: number; y: number; z: number };
  slopeDirectionX: number;
  slopeDirectionZ: number;
  slopeStrength: number;
  balanceStress: number;
  controlledMaxSpeed: number;
  controlledDamping: number;
  slidePower: number;
  balancePower: number;
} & SoftBoundaryDebugState;

type TestBallProps = {
  resetCount: number;
  mode?: CubePhysicsMode;
  onDebugChange?: (debug: BodyDebugState) => void;
};

export function TestBall({
  resetCount,
  mode = "floor-only",
  onDebugChange,
}: TestBallProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const reportTimeRef = useRef(0);
  const softBoundaryDebugRef = useSoftBoundaryForce(bodyRef, {
    mode,
  });

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    body.setTranslation(initialPosition, true);
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    body.wakeUp();
  }, [resetCount]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    reportTimeRef.current += delta;
    if (reportTimeRef.current > 0.12) {
      if (!onDebugChange) {
        reportTimeRef.current = 0;
        return;
      }

      const linvel = body.linvel();
      const angvel = body.angvel();

      onDebugChange({
        position: body.translation(),
        humanPosition: { x: 0, y: 0, z: 0 },
        linvel,
        angvel,
        isSleeping: body.isSleeping(),
        friction: ballFriction,
        restitution: 0,
        linearDamping: ballLinearDamping,
        angularDamping: ballAngularDamping,
        horizontalDrag: 0,
        gravityScale: 1,
        isResetting: false,
        horizontalSpeed: Math.hypot(linvel.x, linvel.z),
        maxHorizontalSpeed: ballMaxHorizontalSpeed,
        angularSpeed: Math.hypot(angvel.x, angvel.y, angvel.z),
        maxAngularSpeed: Number.POSITIVE_INFINITY,
        lowSpeedStopActive: false,
        wakeUpEveryFrame: false,
        debugHumanVisible: false,
        showCollider: true,
        showHuman: false,
        showSilhouetteVolumeDebug: false,
        humanYaw: 0,
        humanScale: 0,
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
        ...softBoundaryDebugRef.current,
      });
      reportTimeRef.current = 0;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      colliders={false}
      position={[initialPosition.x, initialPosition.y, initialPosition.z]}
      mass={ballMass}
      friction={ballFriction}
      restitution={0}
      linearDamping={ballLinearDamping}
      angularDamping={ballAngularDamping}
      gravityScale={1}
      canSleep={false}
    >
      <BallCollider args={[ballRadius]} friction={ballFriction} restitution={0} />
      <mesh castShadow>
        <sphereGeometry args={[ballRadius, 40, 40]} />
        <meshPhysicalMaterial
          color="#f7f7f4"
          roughness={0.18}
          metalness={0}
          transmission={0.24}
          thickness={0.35}
          transparent
          opacity={0.88}
        />
      </mesh>
    </RigidBody>
  );
}

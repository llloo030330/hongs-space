import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useRef } from "react";
import type { CubeTilt } from "@/components/physics-cube/useCubeTilt";

const innerHalfSize = 2;
const softWallsFloorHalfSize = 3;
const floorHalfThickness = 0.1;
const wallHalfThickness = 0.1;
const floorFriction = 0.05;
const wallFriction = 0.05;
const colliderNames = {
  "floor-only": ["floor"],
  "soft-walls": ["floor"],
  box: ["floor", "ceiling", "left", "right", "front", "back"],
} satisfies Record<CubePhysicsMode, string[]>;

type KinematicCubeContainerProps = {
  tilt: CubeTilt;
  mode: CubePhysicsMode;
  onDebugChange?: (debug: CubeContainerDebugState) => void;
};

export type CubePhysicsMode = "floor-only" | "soft-walls" | "box";

export type CubeContainerDebugState = {
  mode: CubePhysicsMode;
  floorFriction: number;
  wallFriction: number;
  isCallingSetNextKinematicRotation: boolean;
  activeCollidersCount: number;
  activeColliderNames: string[];
};

export function KinematicCubeContainer({
  tilt,
  mode,
  onDebugChange,
}: KinematicCubeContainerProps) {
  const cubeBodyRef = useRef<RapierRigidBody>(null);
  const floorY = -innerHalfSize;
  const isFloorOnlyBody = mode === "floor-only" || mode === "soft-walls";
  const floorHalfSize =
    mode === "soft-walls" ? softWallsFloorHalfSize : innerHalfSize;
  const bodyPosition: [number, number, number] =
    isFloorOnlyBody ? [0, floorY, 0] : [0, 0, 0];
  const floorColliderPosition: [number, number, number] =
    isFloorOnlyBody ? [0, 0, 0] : [0, floorY, 0];

  useFrame(() => {
    const body = cubeBodyRef.current;
    if (!body) return;

    body.setNextKinematicTranslation({
      x: bodyPosition[0],
      y: bodyPosition[1],
      z: bodyPosition[2],
    });
    body.setNextKinematicRotation(tilt.quaternion);
    onDebugChange?.({
      mode,
      floorFriction,
      wallFriction: mode === "box" ? wallFriction : 0,
      isCallingSetNextKinematicRotation: true,
      activeCollidersCount: colliderNames[mode].length,
      activeColliderNames: colliderNames[mode],
    });
  });

  return (
    <RigidBody
      ref={cubeBodyRef}
      type="kinematicPosition"
      colliders={false}
      position={bodyPosition}
    >
      <CuboidCollider
        args={[floorHalfSize, floorHalfThickness, floorHalfSize]}
        position={floorColliderPosition}
        friction={floorFriction}
        restitution={0}
      />

      {mode === "box" && (
        <>
          <CuboidCollider
            args={[innerHalfSize, floorHalfThickness, innerHalfSize]}
            position={[0, innerHalfSize, 0]}
            friction={wallFriction}
            restitution={0}
          />
          <CuboidCollider
            args={[wallHalfThickness, innerHalfSize, innerHalfSize]}
            position={[-innerHalfSize, 0, 0]}
            friction={wallFriction}
            restitution={0}
          />
          <CuboidCollider
            args={[wallHalfThickness, innerHalfSize, innerHalfSize]}
            position={[innerHalfSize, 0, 0]}
            friction={wallFriction}
            restitution={0}
          />
          <CuboidCollider
            args={[innerHalfSize, innerHalfSize, wallHalfThickness]}
            position={[0, 0, -innerHalfSize]}
            friction={wallFriction}
            restitution={0}
          />
          <CuboidCollider
            args={[innerHalfSize, innerHalfSize, wallHalfThickness]}
            position={[0, 0, innerHalfSize]}
            friction={wallFriction}
            restitution={0}
          />
        </>
      )}
    </RigidBody>
  );
}

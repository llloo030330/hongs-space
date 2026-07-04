import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { TestBall, type BodyDebugState } from "@/components/physics-cube/TestBall";

const rampAngle = -(15 * Math.PI) / 180;

type RampTestProps = {
  resetCount: number;
  onDebugChange: (debug: BodyDebugState) => void;
};

export function RampTest({ resetCount, onDebugChange }: RampTestProps) {
  return (
    <>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, -0.25, 0]}
        rotation={[0, 0, rampAngle]}
      >
        <CuboidCollider args={[3, 0.1, 2]} friction={0.05} restitution={0} />
        <mesh receiveShadow>
          <boxGeometry args={[6, 0.2, 4]} />
          <meshBasicMaterial color="#d8d8d2" transparent opacity={0.18} />
        </mesh>
      </RigidBody>
      <TestBall resetCount={resetCount} onDebugChange={onDebugChange} />
    </>
  );
}

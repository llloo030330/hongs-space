import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { CubeTilt } from "@/components/physics-cube/useCubeTilt";

const cubeSize = 4;
const halfSize = cubeSize / 2;
const panelThickness = 0.035;

type GlassPanel = {
  args: [number, number, number];
  position: [number, number, number];
};

const panels: GlassPanel[] = [
  { args: [cubeSize, panelThickness, cubeSize], position: [0, -halfSize, 0] },
  { args: [cubeSize, panelThickness, cubeSize], position: [0, halfSize, 0] },
  { args: [panelThickness, cubeSize, cubeSize], position: [-halfSize, 0, 0] },
  { args: [panelThickness, cubeSize, cubeSize], position: [halfSize, 0, 0] },
  { args: [cubeSize, cubeSize, panelThickness], position: [0, 0, -halfSize] },
  { args: [cubeSize, cubeSize, panelThickness], position: [0, 0, halfSize] },
];

type GlassCubeProps = {
  tilt: CubeTilt & {
    currentOffsetX?: number;
    currentOffsetY?: number;
  };
};

export function GlassCube({ tilt }: GlassCubeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.quaternion.set(
      tilt.quaternion.x,
      tilt.quaternion.y,
      tilt.quaternion.z,
      tilt.quaternion.w,
    );
    groupRef.current.position.set(
      tilt.currentOffsetX ?? 0,
      tilt.currentOffsetY ?? 0,
      0,
    );
  });

  return (
    <group ref={groupRef}>
      {panels.map((panel, index) => (
        <mesh key={index} position={panel.position}>
          <boxGeometry args={panel.args} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.22}
            roughness={0.06}
            metalness={0}
            transmission={0.68}
            thickness={0.28}
            ior={1.18}
            envMapIntensity={0.55}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      <lineSegments scale={1.003}>
        <edgesGeometry args={[new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)]} />
        <lineBasicMaterial color="#9c9c96" transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}

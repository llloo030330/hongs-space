"use client";

import { MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { CUBE_SIZE } from "./heroGeometry";
import {
  GLASS_EDGE_OPACITY,
} from "./heroTuning";

function createLineGeometry(segments: number[][]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(segments.flat(), 3),
  );
  return geometry;
}

export default function GlassCube() {
  const { frontEdges, backEdges, depthEdges } = useMemo(() => {
    const h = CUBE_SIZE / 2;

    return {
      frontEdges: createLineGeometry([
        [-h, -h, h], [h, -h, h],
        [h, -h, h], [h, h, h],
        [h, h, h], [-h, h, h],
        [-h, h, h], [-h, -h, h],
      ]),
      backEdges: createLineGeometry([
        [-h, -h, -h], [h, -h, -h],
        [h, -h, -h], [h, h, -h],
        [h, h, -h], [-h, h, -h],
        [-h, h, -h], [-h, -h, -h],
      ]),
      depthEdges: createLineGeometry([
        [-h, -h, h], [-h, -h, -h],
        [h, -h, h], [h, -h, -h],
        [h, h, h], [h, h, -h],
        [-h, h, h], [-h, h, -h],
      ]),
    };
  }, []);

  return (
    <group>
      <RoundedBox
        args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
        radius={0.08}
        smoothness={8}
        renderOrder={0}
      >
        <MeshTransmissionMaterial
          backside
          samples={10}
          thickness={0.68}
          chromaticAberration={0.003}
          anisotropy={0.08}
          distortion={0.018}
          distortionScale={0.05}
          temporalDistortion={0.006}
          transmission={0.92}
          roughness={0.22}
          ior={1.18}
          color="#ffffff"
          transparent
          depthWrite={false}
          depthTest
        />
      </RoundedBox>

      <mesh
        position={[0, 0, -CUBE_SIZE / 2 + 0.008]}
        renderOrder={0}
      >
        <planeGeometry args={[CUBE_SIZE * 0.94, CUBE_SIZE * 0.94]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.032}
          depthWrite={false}
          depthTest
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={frontEdges} renderOrder={1}>
        <lineBasicMaterial
          color="#94948e"
          transparent
          opacity={GLASS_EDGE_OPACITY}
          depthWrite={false}
          depthTest
        />
      </lineSegments>

      <lineSegments geometry={depthEdges} renderOrder={1}>
        <lineBasicMaterial
          color="#aaa9a2"
          transparent
          opacity={0.085}
          depthWrite={false}
          depthTest
        />
      </lineSegments>

      <lineSegments geometry={backEdges} renderOrder={1}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.045}
          depthWrite={false}
          depthTest
        />
      </lineSegments>
    </group>
  );
}

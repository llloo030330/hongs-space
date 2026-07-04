"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function GlassStructure() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera, pointer }) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.16, 0.035);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.22, 0.035);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.55, 0.025);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.35, 0.025);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.15} rotationIntensity={0.16} floatIntensity={0.28}>
        <RoundedBox args={[2.25, 2.25, 2.25]} radius={0.08} smoothness={8}>
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.55}
            chromaticAberration={0.015}
            anisotropy={0.18}
            distortion={0.08}
            distortionScale={0.12}
            temporalDistortion={0.05}
            transmission={0.88}
            roughness={0.14}
            ior={1.18}
            color="#ffffff"
          />
        </RoundedBox>

        <lineSegments scale={1.03}>
          <edgesGeometry args={[new THREE.BoxGeometry(2.25, 2.25, 2.25)]} />
          <lineBasicMaterial color="#9c9c96" transparent opacity={0.22} />
        </lineSegments>
      </Float>
    </group>
  );
}

export function SpaceScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.7]}
        camera={{ position: [0, 0.15, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f5f5f2"]} />
        <fog attach="fog" args={["#f5f5f2", 7, 13]} />

        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 5, 5]} intensity={1.7} color="#ffffff" />
        <pointLight position={[-3.5, 2.5, 4]} intensity={0.8} color="#d8d8d2" />

        <GlassStructure />

        <ContactShadows
          position={[0, -1.75, 0]}
          opacity={0.2}
          scale={7}
          blur={2.6}
          far={4}
          resolution={512}
          color="#8d8d88"
        />
      </Canvas>
    </div>
  );
}

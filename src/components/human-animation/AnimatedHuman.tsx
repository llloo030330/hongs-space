"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const humanModelPath = "/models/human/human.glb";

const targetHeight = 1.7;

export type HumanModelDebug = {
  modelLoaded: boolean;
  sceneChildrenCount: number;
  animationsCount: number;
  animationClipNames: string[];
  modelOriginalHeight: number;
  modelScale: number;
  finalModelHeight: number;
  modelBoundsSize: { x: number; y: number; z: number };
  modelBoundsCenter: { x: number; y: number; z: number };
  correctionRotation: { x: number; y: number; z: number };
  showModelBounds: boolean;
};

type AnimatedHumanProps = {
  showModelBounds: boolean;
  onDebugChange: (debug: HumanModelDebug) => void;
};

const emptyDebug: HumanModelDebug = {
  modelLoaded: false,
  sceneChildrenCount: 0,
  animationsCount: 0,
  animationClipNames: [],
  modelOriginalHeight: 0,
  modelScale: 1,
  finalModelHeight: 0,
  modelBoundsSize: { x: 0, y: 0, z: 0 },
  modelBoundsCenter: { x: 0, y: 0, z: 0 },
  correctionRotation: { x: 0, y: 0, z: 0 },
  showModelBounds: true,
};

export function AnimatedHuman({
  showModelBounds,
  onDebugChange,
}: AnimatedHumanProps) {
  const gltf = useGLTF(humanModelPath);
  const clipNames = useMemo(
    () => gltf.animations.map((clip) => clip.name).filter(Boolean),
    [gltf.animations],
  );
  const transform = useMemo(() => getModelTransform(gltf.scene), [gltf.scene]);

  useEffect(() => {
    forceModelVisible(gltf.scene);
    onDebugChange({
      modelLoaded: true,
      sceneChildrenCount: transform.sceneChildrenCount,
      animationsCount: gltf.animations.length,
      animationClipNames: clipNames,
      modelOriginalHeight: transform.originalHeight,
      modelScale: transform.scale,
      finalModelHeight: transform.finalHeight,
      modelBoundsSize: toPlainVector(transform.correctedSize),
      modelBoundsCenter: toPlainVector(transform.correctedCenter),
      correctionRotation: toPlainEuler(transform.rotation),
      showModelBounds,
    });
  }, [
    clipNames,
    gltf.animations.length,
    gltf.scene,
    onDebugChange,
    showModelBounds,
    transform,
  ]);

  return (
    <group position={transform.position} scale={transform.scale}>
      <group rotation={transform.rotation}>
        <primitive object={gltf.scene} />
      </group>

      {showModelBounds && (
        <mesh position={transform.correctedCenter}>
          <boxGeometry args={transform.localBoxSize} />
          <meshBasicMaterial color="#ff9f1c" wireframe transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

export function getEmptyHumanModelDebug(
  showModelBounds: boolean,
): HumanModelDebug {
  return {
    ...emptyDebug,
    showModelBounds,
  };
}

function getModelTransform(scene: THREE.Object3D) {
  scene.updateMatrixWorld(true);

  const rawBox = new THREE.Box3().setFromObject(scene);
  const rawSize = rawBox.getSize(new THREE.Vector3());
  const rotation = getCorrectionRotation(rawSize);
  const sampleGroup = new THREE.Group();
  const sampleScene = scene.clone(true);
  sampleGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  sampleGroup.add(sampleScene);
  sampleGroup.updateMatrixWorld(true);

  const correctedBox = new THREE.Box3().setFromObject(sampleGroup);
  const correctedSize = correctedBox.getSize(new THREE.Vector3());
  const correctedCenter = correctedBox.getCenter(new THREE.Vector3());
  const originalHeight = correctedSize.y;
  const scale = originalHeight > 0 ? targetHeight / originalHeight : 1;
  const position = new THREE.Vector3(
    -correctedCenter.x * scale,
    -correctedBox.min.y * scale,
    -correctedCenter.z * scale,
  );
  const sceneChildrenCount = countSceneChildren(scene);

  return {
    position,
    scale,
    sceneChildrenCount,
    originalHeight,
    finalHeight: originalHeight * scale,
    rotation,
    correctedCenter,
    correctedSize,
    localBoxSize: [
      Math.max(correctedSize.x, 0.03),
      Math.max(correctedSize.y, 0.03),
      Math.max(correctedSize.z, 0.03),
    ] as [number, number, number],
  };
}

function getCorrectionRotation(size: THREE.Vector3) {
  if (size.z > size.y * 1.2 && size.z > size.x * 1.1) {
    return new THREE.Euler(-Math.PI / 2, 0, 0);
  }

  if (size.x > size.y * 1.2 && size.x > size.z * 1.1) {
    return new THREE.Euler(0, 0, Math.PI / 2);
  }

  return new THREE.Euler(0, 0, 0);
}

function forceModelVisible(scene: THREE.Object3D) {
  scene.traverse((child) => {
    child.visible = true;
    child.frustumCulled = false;

    if (isMeshOrSkinnedMesh(child)) {
      child.castShadow = true;
      child.receiveShadow = true;
      forceMaterialVisible(child.material);
    }
  });
}

function forceMaterialVisible(
  material: THREE.Material | THREE.Material[] | undefined,
) {
  if (!material) return;

  const materials = Array.isArray(material) ? material : [material];

  materials.forEach((item) => {
    item.transparent = false;
    item.opacity = 1;
    item.depthWrite = true;
    item.needsUpdate = true;
  });
}

function isMeshOrSkinnedMesh(child: THREE.Object3D): child is THREE.Mesh {
  return (child as THREE.Mesh).isMesh || (child as THREE.SkinnedMesh).isSkinnedMesh;
}

function countSceneChildren(scene: THREE.Object3D) {
  let count = 0;

  scene.traverse(() => {
    count += 1;
  });

  return count;
}

function toPlainVector(vector: THREE.Vector3) {
  return {
    x: vector.x,
    y: vector.y,
    z: vector.z,
  };
}

function toPlainEuler(euler: THREE.Euler) {
  return {
    x: euler.x,
    y: euler.y,
    z: euler.z,
  };
}

export function DebugMarker() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="red" />
      </mesh>

      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="green" />
      </mesh>

      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1, 16]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
}

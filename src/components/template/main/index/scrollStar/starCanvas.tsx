"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, type Mesh } from "three";
import { createStarGeometry } from "@/components/template/main/index/hero/shapes";
import { SCROLL_STAR_COLOR } from "@/components/template/main/index/scrollStar/scrollStarStore";

export type SpinRef = { current: number };

function SpinningStar({ spin }: { spin: SpinRef }) {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => createStarGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = performance.now() / 1000;
    if (spin.current > 1) {
      mesh.rotation.y += delta * spin.current;
    } else {
      const front = Math.round(mesh.rotation.y / (Math.PI * 2)) * Math.PI * 2;
      mesh.rotation.y = MathUtils.damp(mesh.rotation.y, front - 0.4 + Math.sin(t * 1.4) * 0.35, 4, delta);
    }
    mesh.rotation.z = Math.sin(t * 1.1) * 0.15;
  });

  return (
    <mesh ref={ref} geometry={geometry} rotation={[0.2, -0.4, 0.15]} scale={1.45}>
      <meshStandardMaterial color={SCROLL_STAR_COLOR} roughness={0.35} metalness={0.05} />
    </mesh>
  );
}

export default function StarCanvas({ spin }: { spin: SpinRef }) {
  return (
    <Canvas
      resize={{ offsetSize: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#ffffff", "#c9ece8", 0.6]} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <SpinningStar spin={spin} />
    </Canvas>
  );
}

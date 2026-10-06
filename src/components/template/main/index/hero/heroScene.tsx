"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import { type Group, MathUtils, type Mesh, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  createLetterTexture,
  createShirtGeometry,
  createStarGeometry,
} from "@/components/template/main/index/hero/shapes";
import { scrollStarStore } from "@/components/template/main/index/scrollStar/scrollStarStore";

const PALETTE = {
  sage: "#38aba3",
  sageDeep: "#127068",
  coral: "#ff7a68",
  mint: "#8ccf5f",
  peach: "#ff8a3d",
  sky: "#0f71c2",
  sun: "#ffc425",
};

const BLOCK_SIZE = 0.88;

const BLOCKS: Array<{ letter: string; color: string; position: [number, number, number]; tilt: number }> = [
  { letter: "K", color: PALETTE.sage, position: [-1.38, -1.2, 0], tilt: 0.06 },
  { letter: "I", color: PALETTE.coral, position: [-0.46, -1.2, 0.08], tilt: -0.08 },
  { letter: "D", color: PALETTE.mint, position: [0.46, -1.2, -0.04], tilt: 0.04 },
  { letter: "S", color: PALETTE.peach, position: [1.38, -1.2, 0.05], tilt: -0.05 },
  { letter: "S", color: PALETTE.sky, position: [-0.92, -0.28, 0.02], tilt: -0.1 },
  { letter: "E", color: PALETTE.sun, position: [0, -0.28, -0.06], tilt: 0.09 },
  { letter: "T", color: PALETTE.sageDeep, position: [0.92, -0.28, 0.04], tilt: -0.04 },
];

const BALLOONS: Array<{ color: string; position: [number, number, number]; scale: number }> = [
  { color: PALETTE.coral, position: [-1.95, 1.55, -0.4], scale: 0.48 },
  { color: PALETTE.sage, position: [1.85, 1.85, -0.9], scale: 0.42 },
  { color: PALETTE.sun, position: [0.25, 2.25, -1.8], scale: 0.36 },
];

const STARS: Array<{ color: string; position: [number, number, number]; scale: number }> = [
  { color: PALETTE.sky, position: [2.05, 0.3, 0.8], scale: 0.75 },
  { color: PALETTE.sage, position: [-0.85, 2.35, 0.2], scale: 0.5 },
  { color: PALETTE.coral, position: [1.45, -2.25, 1], scale: 0.45 },
];

const CONFETTI_COLORS = [PALETTE.coral, PALETTE.mint, PALETTE.sun, PALETTE.sky, PALETTE.sage];

function ToyBlock({ letter, color, position, tilt }: (typeof BLOCKS)[number]) {
  const geometry = useMemo(() => new RoundedBoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, 4, 0.1), []);
  const texture = useMemo(() => createLetterTexture(letter, color), [letter, color]);

  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture]
  );

  return (
    <mesh geometry={geometry} position={position} rotation={[0, tilt * 2, tilt]}>
      <meshStandardMaterial map={texture} roughness={0.45} />
    </mesh>
  );
}

function Balloon({ color, position, scale }: (typeof BALLOONS)[number]) {
  return (
    <group position={position} scale={scale}>
      <mesh scale={[1, 1.18, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, -1.24, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.14, 0.18, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, -2.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 2.6, 6]} />
        <meshStandardMaterial color="#d6d3f0" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Star({
  color,
  position,
  scale,
  track = false,
  hidden = false,
}: (typeof STARS)[number] & { track?: boolean; hidden?: boolean }) {
  const geometry = useMemo(() => createStarGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const ref = useRef<Mesh>(null);
  const { camera, gl } = useThree();
  const world = useMemo(() => new Vector3(), []);
  const worldScale = useMemo(() => new Vector3(), []);

  // the star that leaves on scroll: tell the scroll star where it is on screen, every frame
  useFrame(() => {
    const mesh = ref.current;
    if (!track || !mesh) return;
    mesh.getWorldPosition(world);
    mesh.getWorldScale(worldScale);
    const rect = gl.domElement.getBoundingClientRect();
    const fov = "fov" in camera ? (camera.fov as number) : 38;
    const viewHeight = 2 * Math.tan(MathUtils.degToRad(fov / 2)) * camera.position.distanceTo(world);
    scrollStarStore.home.size = (worldScale.x / viewHeight) * rect.height;
    world.project(camera);
    scrollStarStore.home.x = rect.left + ((world.x + 1) / 2) * rect.width;
    scrollStarStore.home.y = rect.top + ((1 - world.y) / 2) * rect.height;
    scrollStarStore.home.valid = rect.bottom > 0 && rect.width > 0;
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      position={position}
      scale={scale}
      rotation={[0.2, -0.4, 0.15]}
      visible={!hidden}
    >
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
    </mesh>
  );
}

function Shirt() {
  const shirt = useMemo(() => createShirtGeometry(), []);
  const badge = useMemo(() => createStarGeometry(0.16, 0.07, 0.04), []);

  useEffect(
    () => () => {
      shirt.dispose();
      badge.dispose();
    },
    [shirt, badge]
  );

  return (
    <group position={[-2.05, 0.15, 0.6]} rotation={[0.1, 0.45, -0.18]} scale={0.72}>
      <mesh geometry={shirt}>
        <meshStandardMaterial color={PALETTE.sageDeep} roughness={0.7} />
      </mesh>
      <mesh geometry={badge} position={[0.2, 0.18, 0.13]}>
        <meshStandardMaterial color={PALETTE.sun} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Confetti({ count }: { count: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        position: [
          MathUtils.seededRandom(i + 1) * 5.6 - 2.8,
          MathUtils.seededRandom(i + 101) * 5 - 2.2,
          MathUtils.seededRandom(i + 201) * 2.5 - 1.5,
        ] as [number, number, number],
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 0.04 + MathUtils.seededRandom(i + 301) * 0.05,
      })),
    [count]
  );

  return (
    <>
      {pieces.map((piece, i) => (
        <mesh key={i} position={piece.position}>
          <sphereGeometry args={[piece.size, 10, 10]} />
          <meshStandardMaterial color={piece.color} roughness={0.5} />
        </mesh>
      ))}
    </>
  );
}

function Rig({ children, interactive }: { children: ReactNode; interactive: boolean }) {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    const rig = ref.current;
    if (!rig) return;

    const targetY = interactive ? state.pointer.x * 0.35 : 0;
    const targetX = interactive ? -state.pointer.y * 0.12 : 0;
    rig.rotation.y = MathUtils.damp(rig.rotation.y, targetY, 3, delta);
    rig.rotation.x = MathUtils.damp(rig.rotation.x, targetX, 3, delta);
    rig.scale.setScalar(MathUtils.damp(rig.scale.x, 1, 4, delta));
  });

  return (
    <group ref={ref} scale={interactive ? 0.85 : 1}>
      {children}
    </group>
  );
}

interface HeroSceneProps {
  reducedMotion: boolean;
  compact: boolean;
}

export default function HeroScene({ reducedMotion, compact }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const animate = !reducedMotion;
  const floatSpeed = animate ? 1.6 : 0;

  // STARS[0] flies off to the section headers while scrolling (index/scrollStar)
  const [starAway, setStarAway] = useState(scrollStarStore.detached);
  useEffect(() => scrollStarStore.subscribe(setStarAway), []);
  useEffect(
    () => () => {
      scrollStarStore.home.valid = false;
    },
    []
  );

  return (
    <div ref={containerRef} className="absolute inset-y-0 -inset-x-4 md:-inset-x-16" aria-hidden="true">
      <Canvas
        dpr={[1, compact ? 1.5 : 2]}
        camera={{ position: [0, 0.2, 9], fov: 38 }}
        frameloop={animate && visible ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.75} />
        <hemisphereLight args={["#ffffff", "#c9ece8", 0.6]} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <directionalLight position={[-5, 2, 3]} intensity={0.4} color={PALETTE.coral} />

        <Rig interactive={animate}>
          <Float speed={floatSpeed} rotationIntensity={0.25} floatIntensity={0.6}>
            <group position={[0, -0.25, 0]}>
              {BLOCKS.map((block) => (
                <ToyBlock key={`${block.letter}-${block.position.join()}`} {...block} />
              ))}
            </group>
          </Float>

          {BALLOONS.map((balloon) => (
            <Float key={balloon.color} speed={floatSpeed * 1.2} rotationIntensity={0.4} floatIntensity={1.2}>
              <Balloon {...balloon} />
            </Float>
          ))}

          {(compact ? STARS.slice(0, 1) : STARS).map((star, index) => (
            <Float key={star.color} speed={floatSpeed * 1.5} rotationIntensity={1.2} floatIntensity={0.8}>
              <Star {...star} track={index === 0} hidden={index === 0 && starAway} />
            </Float>
          ))}

          {!compact && (
            <Float speed={floatSpeed} rotationIntensity={0.6} floatIntensity={0.9}>
              <Shirt />
            </Float>
          )}

          <Confetti count={compact ? 8 : 18} />
        </Rig>

        <ContactShadows
          position={[0, -2.05, 0]}
          scale={9}
          far={3}
          blur={2.4}
          opacity={0.3}
          resolution={compact ? 256 : 512}
          frames={animate && !compact ? Infinity : 1}
          color="#127068"
        />
      </Canvas>
    </div>
  );
}

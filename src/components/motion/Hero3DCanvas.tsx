import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Procedural South Indian Ceremonial Brass Lamp (Kuthu Vilakku)
 * Elegantly crafted with traditional tiered oil dish, ornamental spindle,
 * glowing ceremonial flame, and royal peacock/kalasha finial.
 */
const BrassLamp: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
  const groupRef = useRef<THREE.Group>(null)
  const flameLightRef = useRef<THREE.PointLight>(null)

  useFrame((state, delta) => {
    if (isPaused || !groupRef.current) return
    // Slow, serene ceremonial auto-rotation
    groupRef.current.rotation.y += delta * 0.45

    // Subtle gentle flame flicker
    if (flameLightRef.current) {
      flameLightRef.current.intensity = 1.4 + Math.sin(state.clock.elapsedTime * 6) * 0.2
    }
  })

  // Ceremonial Brass Material: warm, lustrous heirloom gold
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: '#e2ad38',
    metalness: 0.88,
    roughness: 0.22,
  })

  const flameMaterial = new THREE.MeshStandardMaterial({
    color: '#ffbe3b',
    emissive: '#ff7700',
    emissiveIntensity: 2.2,
    roughness: 0.1,
  })

  return (
    <group ref={groupRef} position={[0, -0.65, 0]}>
      {/* 1. Stepped Base Pedestal */}
      <mesh position={[0, 0.06, 0]} material={brassMaterial}>
        <cylinderGeometry args={[0.55, 0.65, 0.12, 32]} />
      </mesh>
      <mesh position={[0, 0.15, 0]} material={brassMaterial}>
        <cylinderGeometry args={[0.42, 0.52, 0.08, 32]} />
      </mesh>

      {/* 2. Lower Fluted Spindle */}
      <mesh position={[0, 0.4, 0]} material={brassMaterial}>
        <cylinderGeometry args={[0.1, 0.22, 0.45, 24]} />
      </mesh>
      <mesh position={[0, 0.65, 0]} material={brassMaterial}>
        <sphereGeometry args={[0.22, 24, 24]} />
      </mesh>

      {/* 3. Central Column Spindle */}
      <mesh position={[0, 0.95, 0]} material={brassMaterial}>
        <cylinderGeometry args={[0.08, 0.12, 0.45, 24]} />
      </mesh>
      <mesh position={[0, 1.2, 0]} material={brassMaterial}>
        <cylinderGeometry args={[0.2, 0.1, 0.12, 24]} />
      </mesh>

      {/* 4. Deep Ceremonial Oil Dish (Agal) */}
      <mesh position={[0, 1.3, 0]} material={brassMaterial}>
        <cylinderGeometry args={[0.7, 0.35, 0.16, 32]} />
      </mesh>

      {/* 5. Central Kalasha Finial */}
      <mesh position={[0, 1.48, 0]} material={brassMaterial}>
        <cylinderGeometry args={[0.07, 0.14, 0.22, 24]} />
      </mesh>
      <mesh position={[0, 1.62, 0]} material={brassMaterial}>
        <coneGeometry args={[0.12, 0.22, 24]} />
      </mesh>

      {/* 6. Glowing Ceremonial Flame */}
      <mesh position={[0, 1.76, 0]} material={flameMaterial}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>

      {/* Flame Point Light */}
      <pointLight
        ref={flameLightRef}
        position={[0, 1.82, 0]}
        color="#ffa31a"
        intensity={1.5}
        distance={3.5}
        decay={2}
      />
    </group>
  )
}

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  useEffect(() => {
    // 1. Pause when browser tab is inactive / hidden
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 2. Pause when off-screen via IntersectionObserver
    let observer: IntersectionObserver | null = null
    if (containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry) {
            setIsPaused(!entry.isIntersecting)
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(containerRef.current)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (observer && containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none pointer-events-none"
      style={{ touchAction: 'pan-y' }}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={isPaused ? 'never' : 'always'}
        camera={{ position: [0, 0.5, 3.2], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 5, 3]} intensity={1.8} color="#fff4d4" />
        <directionalLight position={[-4, 3, -2]} intensity={0.6} color="#ffd861" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <BrassLamp isPaused={isPaused} />
        </Float>

        <ContactShadows
          position={[0, -0.68, 0]}
          opacity={0.45}
          scale={2.2}
          blur={1.8}
          far={1.8}
          color="#3a2202"
        />
      </Canvas>
    </div>
  )
}

export default Hero3DCanvas

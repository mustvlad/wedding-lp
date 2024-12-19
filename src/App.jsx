import { useTexture } from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Fluid } from "@whatisjery/react-fluid-distortion";
import { EffectComposer } from "@react-three/postprocessing";
import { useMouseMove, useValue, animate, withEase } from "react-ui-animate";
import { useRef } from "react";
import * as THREE from "three";

const CURSOR_SIZE = 25;
const ASPECT_RATIO = 1.77;
const BLEED = 1.2;

function HeavenPlanes() {
  const groupRef = useRef();

  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 0]);

  const textures = useTexture(["p4.png", "p3.png", "p2.png", "p1.png"]);

  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime) / 15;
    state.camera.position.y = Math.cos(state.clock.elapsedTime) / 20;

    const pointerX = state.pointer.x; // Normalized mouse x (-1 to 1)

    // Access each mesh inside the group
    groupRef.current.children.forEach((plane, index) => {
      // Skip the first plane
      if (index === 0) return;

      // Compute target positions and rotation based on mouse
      const targetX = pointerX * (index * 2) * 0.1; // Parallax effect strength
      const targetRotationZ = pointerX * 0.005 * index;

      // Smoothly interpolate position and rotation using THREE.MathUtils.lerp
      plane.position.x = THREE.MathUtils.lerp(
        plane.position.x,
        -targetX,
        0.025
      );
      plane.rotation.z = THREE.MathUtils.lerp(
        plane.rotation.z,
        targetRotationZ,
        0.1
      );
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {textures.map((texture, index) => (
        <mesh key={index} position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <planeGeometry
            args={[
              width > height * ASPECT_RATIO
                ? width + BLEED
                : (height + BLEED) * ASPECT_RATIO,
              width > height * ASPECT_RATIO
                ? (width + BLEED) / ASPECT_RATIO
                : height + BLEED,
            ]}
          />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Cursor() {
  const x = useValue(0);
  const y = useValue(0);

  useMouseMove(({ mouseX, mouseY }) => {
    x.value = withEase(mouseX - CURSOR_SIZE / 2);
    y.value = withEase(mouseY - CURSOR_SIZE / 2);
  });

  return (
    <animate.div
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        border: "0.3px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0px 0px 5px rgba(255, 255, 255, 0.5)",
        borderRadius: "50%",
        translateX: x.value,
        translateY: y.value,
        position: "fixed",
        zIndex: 1000,
      }}
    />
  );
}

export default function App() {
  return (
    <>
      <Cursor />

      <Canvas>
        <HeavenPlanes />

        <EffectComposer>
          <Fluid
            radius={0.03}
            curl={10}
            swirl={5}
            distortion={1}
            force={2}
            pressure={0.94}
            densityDissipation={0.98}
            velocityDissipation={0.99}
            intensity={0.3}
            rainbow={false}
            blend={0}
            showBackground={true}
            backgroundColor="#a7958b"
            fluidColor="#cfc0a8"
          />
        </EffectComposer>
      </Canvas>
    </>
  );
}

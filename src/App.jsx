import { useTexture } from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Fluid } from "@whatisjery/react-fluid-distortion";
import { EffectComposer } from "@react-three/postprocessing";
import {
  useMouseMove,
  useValue,
  animate,
  withEase,
} from "react-ui-animate";
import {
  useRef,
  Suspense,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import * as THREE from "three";
import { RiverPass } from "./RiverPass";

const CURSOR_SIZE = 25;
const ASPECT_RATIO = 1.77;
const BLEED = 1.2;

/** State Context */
const Context = createContext();

function ContextProvider({ children }) {
  const [cursorColor, setCursorColor] = useState("rgba(255, 255, 255, 0.5)");
  return (
    <Context.Provider value={{ cursorColor, setCursorColor }}>
      {children}
    </Context.Provider>
  );
}

/** Heaven Planes */
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

/** Cursor */
function Cursor() {
  const { cursorColor } = useContext(Context);

  const x = useValue(0);
  const y = useValue(0);
  const color = useValue(cursorColor);

  useMouseMove(({ mouseX, mouseY }) => {
    // x.value = withEase(mouseX - CURSOR_SIZE / 2);
    // y.value = withEase(mouseY - CURSOR_SIZE / 2);

    x.value = mouseX - CURSOR_SIZE / 2;
    y.value = mouseY - CURSOR_SIZE / 2;
  });

  // Update color with animation when cursorColor changes
  useEffect(() => {
    color.value = cursorColor;
  }, [color, cursorColor]);

  return (
    <animate.div
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        backgroundColor: color.value,
        border: `0.3px solid ${color.value}`,
        boxShadow: `0px 0px 5px ${color.value}`,
        borderRadius: "50%",
        translateX: x.value,
        translateY: y.value,
        position: "fixed",
        zIndex: 9999,
        transition: "all .075s ease, background-color .5s ease",
      }}
      className="pointer-events-none"
    />
  );
}

/** Corners */
function Corners() {
  return (
    <div className="pointer-events-none">
      <img
        src="Asset 4.svg"
        alt="Corner 4"
        className="fixed top-5 left-5 w-[50px] h-[50px] z-[1000]"
      />

      <img
        src="Asset 3.svg"
        alt="Corner 3"
        className="fixed top-5 right-5 w-[50px] h-[50px] z-[1000]"
      />

      <img
        src="Asset 1.svg"
        alt="Corner 1"
        className="fixed bottom-5 left-5 w-[50px] h-[50px] z-[1000]"
      />

      <img
        src="Asset 2.svg"
        alt="Corner 2"
        className="fixed bottom-5 right-5 w-[50px] h-[50px] z-[1000]"
      />
    </div>
  );
}

/** Content */
function Content() {
  const { setCursorColor } = useContext(Context);

  const handleMouseEnter = () => {
    setCursorColor("rgba(0, 0, 0, 0.5)");
  };

  const handleMouseLeave = () => {
    setCursorColor("rgba(255, 255, 255, 0.5)");
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[1000] pointer-events-none">
      {/* Top text */}
      <div className="absolute top-5 left-0 w-full text-center pt-2 px-20">
        <p className="font-body italic md:text-2xl">
          We can&apos;t wait to begin our journey as a family, surrounded by
          those we love most.
        </p>
      </div>

      {/* Middle text */}
      <div className="absolute top-0 left-0 bottom-0 w-full text-center pt-2 px-20 flex flex-col items-center justify-center">
        <h1 className="font-heading text-4xl md:text-6xl">Andreea & Vlad</h1>
        <p className="font-body italic md:text-2xl mt-2">
          are getting married, and you&apos;re invited!
        </p>
        <div className="flex flex-col items-center justify-center mt-10">
          <img src="/Asset 8.svg" alt="RSVP" className="px-4" />
          <a
            href="#"
            className="bg-white px-8 py-2.5 text-lg my-2 pointer-events-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            RSVP HERE
          </a>
          <img src="/Asset 7.svg" alt="RSVP" className="px-4" />
        </div>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-5 left-0 w-full text-center pb-3 px-20">
        <p className="font-body md:text-2xl">
          Sunday, June 29, 2025, 17:00 • Villa Corsini a Mezzomonte (Tuscany,
          Italy)
        </p>
      </div>
    </div>
  );
}

/** App */
export default function App() {
  return (
    <ContextProvider>
      <Suspense fallback={null}>
        <Cursor />

        <Canvas>
          <HeavenPlanes />
          <EffectComposer>
            <RiverPass progress={0.8} scale={1.5} />
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
              backgroundColor="#a5d7e8"
              fluidColor="#d6edf5"
            />
          </EffectComposer>
        </Canvas>

        <Corners />
        <Content />
      </Suspense>
    </ContextProvider>
  );
}

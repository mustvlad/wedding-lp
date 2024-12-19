import { useTexture } from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Fluid } from "@whatisjery/react-fluid-distortion";
import { EffectComposer } from "@react-three/postprocessing";
import { useMouseMove, useValue, animate } from "react-ui-animate";
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
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const CURSOR_SIZE = 25;
const ASPECT_RATIO = 1.77;
const BLEED = 1.2;
const RIVER_MIN_PROGRESS = 0.01;

/** State Context */
const Context = createContext();

function ContextProvider({ children }) {
  const [cursorColor, setCursorColor] = useState("rgba(255, 255, 255, 0.5)");
  const [cursorSize, setCursorSize] = useState(CURSOR_SIZE);
  const [riverProgress, setRiverProgress] = useState(1);
  
  return (
    <Context.Provider value={{ 
      cursorColor, 
      setCursorColor, 
      cursorSize, 
      setCursorSize, 
      riverProgress, 
      setRiverProgress 
    }}>
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
  const { cursorColor, cursorSize } = useContext(Context);

  const x = useValue(0);
  const y = useValue(0);
  const color = useValue(cursorColor);
  const size = useValue(cursorSize);

  useMouseMove(({ mouseX, mouseY }) => {
    x.value = mouseX - size.currentValue / 2;
    y.value = mouseY - size.currentValue / 2;
  });

  // Update color and size with animation
  useEffect(() => {
    color.value = cursorColor;
    size.value = cursorSize;
  }, [color, cursorColor, size, cursorSize]);

  return (
    <animate.div
      style={{
        width: size.value,
        height: size.value,
        backgroundColor: color.value,
        border: `0.3px solid ${color.value}`,
        boxShadow: `0px 0px 5px ${color.value}`,
        borderRadius: "50%",
        translateX: x.value,
        translateY: y.value,
        position: "fixed",
        zIndex: 9999,
        transition: "all .075s ease, background-color .5s ease, width .3s ease, height .3s ease",
      }}
      className="pointer-events-none hidden md:block"
    />
  );
}

/** Corners */
function Corners() {
  const { riverProgress } = useContext(Context);
  
  return (
    <div className="pointer-events-none">
      <img
        src="Asset 4.svg"
        alt="Corner 4"
        className="fixed top-5 left-5 w-[50px] h-[50px] z-[1000] transition-all duration-1000"
        style={{
          transform: riverProgress === RIVER_MIN_PROGRESS 
            ? 'translate(0, 0)' 
            : 'translate(-100%, -100%)',
          opacity: riverProgress === RIVER_MIN_PROGRESS ? 1 : 0
        }}
      />
      <img
        src="Asset 3.svg"
        alt="Corner 3"
        className="fixed top-5 right-5 w-[50px] h-[50px] z-[1000] transition-all duration-1000"
        style={{
          transform: riverProgress === RIVER_MIN_PROGRESS 
            ? 'translate(0, 0)' 
            : 'translate(100%, -100%)',
          opacity: riverProgress === RIVER_MIN_PROGRESS ? 1 : 0
        }}
      />
      <img
        src="Asset 1.svg"
        alt="Corner 1"
        className="fixed bottom-5 left-5 w-[50px] h-[50px] z-[1000] transition-all duration-1000"
        style={{
          transform: riverProgress === RIVER_MIN_PROGRESS 
            ? 'translate(0, 0)' 
            : 'translate(-100%, 100%)',
          opacity: riverProgress === RIVER_MIN_PROGRESS ? 1 : 0
        }}
      />
      <img
        src="Asset 2.svg"
        alt="Corner 2"
        className="fixed bottom-5 right-5 w-[50px] h-[50px] z-[1000] transition-all duration-1000"
        style={{
          transform: riverProgress === RIVER_MIN_PROGRESS 
            ? 'translate(0, 0)' 
            : 'translate(100%, 100%)',
          opacity: riverProgress === RIVER_MIN_PROGRESS ? 1 : 0
        }}
      />
    </div>
  );
}

/** Content */
function Content() {
  const { setCursorColor, setCursorSize, riverProgress } = useContext(Context);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const containerRef = useRef(null);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    const handleGlobalMouseMove = (event) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerCenterX = rect.left + rect.width / 2;
      const containerCenterY = rect.top + rect.height / 2;

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const distanceX = mouseX - containerCenterX;
      const distanceY = mouseY - containerCenterY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      const radius = 120;

      if (distance < radius) {
        const moveX = (distanceX / radius) * 50;
        const moveY = (distanceY / radius) * 50;
        
        x.set(moveX);
        y.set(moveY);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [x, y]);

  const handleMouseEnter = () => {
    setCursorColor("rgba(0, 0, 0, 0.5)");
    setCursorSize(CURSOR_SIZE * 1.25);
  };

  const handleMouseLeave = () => {
    setCursorColor("rgba(255, 255, 255, 0.5)");
    setCursorSize(CURSOR_SIZE);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 1,
        delayChildren: 0.2,
        staggerChildren: 0.15
      }
    }
  };

  const topTextVariants = {
    hidden: { 
      opacity: 0, 
      y: -50
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const headlineVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.215, 0.610, 0.355, 1.000], // easeOutCubic
      }
    }
  };

  const subtitleVariants = {
    hidden: { 
      opacity: 0, 
      y: 30
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const rsvpContainerVariants = {
    hidden: { 
      opacity: 0, 
      y: 50
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delayChildren: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const rsvpItemVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const bottomTextVariants = {
    hidden: { 
      opacity: 0, 
      y: 50
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {riverProgress === RIVER_MIN_PROGRESS && (
        <motion.div 
          className="fixed top-0 left-0 w-full h-full z-[1000] pointer-events-none"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Top text */}
          <motion.div 
            className="absolute top-5 left-0 w-full text-center pt-2 px-20"
            variants={topTextVariants}
          >
            <p className="font-body italic md:text-2xl">
              We can&apos;t wait to begin our journey as a family, surrounded by
              those we love most.
            </p>
          </motion.div>

          {/* Middle text */}
          <motion.div 
            className="absolute top-0 left-0 bottom-0 w-full text-center pt-2 px-5 flex flex-col items-center justify-center"
          >
            <motion.h1 
              className="font-heading text-4xl md:text-6xl"
              variants={headlineVariants}
            >
              Andreea & Vlad
            </motion.h1>
            <motion.p 
              className="font-body italic md:text-2xl mt-2"
              variants={subtitleVariants}
            >
              are getting married, and you&apos;re invited!
            </motion.p>
            <motion.div 
              ref={containerRef}
              className="flex flex-col items-center justify-center mt-10"
              variants={rsvpContainerVariants}
              style={{
                x: springX,
                y: springY
              }}
            >
              <motion.img 
                src="/Asset 8.svg" 
                alt="RSVP" 
                className="px-4"
                variants={rsvpItemVariants}
              />
              <motion.a
                href="#"
                className="bg-white px-8 py-2.5 text-lg my-2 pointer-events-auto relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                variants={rsvpItemVariants}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "#f8f8f8",
                  transition: { duration: 0.2 }
                }}
              >
                RSVP HERE
              </motion.a>
              <motion.img 
                src="/Asset 7.svg" 
                alt="RSVP" 
                className="px-4"
                variants={rsvpItemVariants}
              />
            </motion.div>
          </motion.div>

          {/* Bottom text */}
          <motion.div 
            className="absolute bottom-5 left-0 w-full text-center pb-3 px-20"
            variants={bottomTextVariants}
          >
            <p className="font-body md:text-2xl">
              Sunday, June 29, 2025, 17:00 • Villa Corsini a Mezzomonte (Tuscany,
              Italy)
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** River */
function River() {
  const { riverProgress, setRiverProgress } = useContext(Context);
  const animationRef = useRef();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const duration = 2500;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.max(RIVER_MIN_PROGRESS, 1 - elapsed / duration);

      setRiverProgress(progress);

      if (progress > RIVER_MIN_PROGRESS) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [setRiverProgress]);

  return <RiverPass progress={riverProgress} scale={1.5} />;
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
            <River />
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

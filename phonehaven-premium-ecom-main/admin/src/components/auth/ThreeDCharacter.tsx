import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { POSES } from "../animations/characterAnimations";
import type { CharacterPose } from "../animations/characterAnimations";
import type { CharacterState } from "../../hooks/useCharacterInteraction";

const LERP_SPEED = 0.08;
const BLINK_INTERVAL = 3500;
const BREATH_SPEED = 1.8;
const BREATH_AMOUNT = 0.015;

function HumanoidCharacter({
  targetPose,
}: {
  targetPose: CharacterPose;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const currentPose = useRef<CharacterPose>({ ...POSES.idle });
  const blinkTimer = useRef(0);
  const blinkState = useRef<"open" | "closing" | "closed" | "opening">("open");
  const blinkAmount = useRef(0);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;

    const cp = currentPose.current;
    const tp = targetPose;

    cp.headRotation[0] += (tp.headRotation[0] - cp.headRotation[0]) * LERP_SPEED;
    cp.headRotation[1] += (tp.headRotation[1] - cp.headRotation[1]) * LERP_SPEED;
    cp.headRotation[2] += (tp.headRotation[2] - cp.headRotation[2]) * LERP_SPEED;
    cp.bodyPosition[0] += (tp.bodyPosition[0] - cp.bodyPosition[0]) * LERP_SPEED;
    cp.bodyPosition[1] += (tp.bodyPosition[1] - cp.bodyPosition[1]) * LERP_SPEED;
    cp.bodyPosition[2] += (tp.bodyPosition[2] - cp.bodyPosition[2]) * LERP_SPEED;
    cp.leftArmRotation[0] += (tp.leftArmRotation[0] - cp.leftArmRotation[0]) * LERP_SPEED;
    cp.leftArmRotation[1] += (tp.leftArmRotation[1] - cp.leftArmRotation[1]) * LERP_SPEED;
    cp.leftArmRotation[2] += (tp.leftArmRotation[2] - cp.leftArmRotation[2]) * LERP_SPEED;
    cp.rightArmRotation[0] += (tp.rightArmRotation[0] - cp.rightArmRotation[0]) * LERP_SPEED;
    cp.rightArmRotation[1] += (tp.rightArmRotation[1] - cp.rightArmRotation[1]) * LERP_SPEED;
    cp.rightArmRotation[2] += (tp.rightArmRotation[2] - cp.rightArmRotation[2]) * LERP_SPEED;
    cp.leftEyePosition[0] += (tp.leftEyePosition[0] - cp.leftEyePosition[0]) * LERP_SPEED;
    cp.leftEyePosition[1] += (tp.leftEyePosition[1] - cp.leftEyePosition[1]) * LERP_SPEED;
    cp.rightEyePosition[0] += (tp.rightEyePosition[0] - cp.rightEyePosition[0]) * LERP_SPEED;
    cp.rightEyePosition[1] += (tp.rightEyePosition[1] - cp.rightEyePosition[1]) * LERP_SPEED;
    cp.eyeScale += (tp.eyeScale - cp.eyeScale) * LERP_SPEED;
    cp.mouthOpen += (tp.mouthOpen - cp.mouthOpen) * LERP_SPEED;
    cp.mouthSmile += (tp.mouthSmile - cp.mouthSmile) * LERP_SPEED;
    cp.eyebrowRaise += (tp.eyebrowRaise - cp.eyebrowRaise) * LERP_SPEED;

    blinkTimer.current += delta * 1000;
    if (blinkState.current === "open" && blinkTimer.current > BLINK_INTERVAL) {
      blinkState.current = "closing";
      blinkTimer.current = 0;
    }
    if (blinkState.current === "closing") {
      blinkAmount.current = Math.min(1, blinkAmount.current + delta * 12);
      if (blinkAmount.current >= 1) {
        blinkState.current = "closed";
        blinkTimer.current = 0;
      }
    } else if (blinkState.current === "closed") {
      if (blinkTimer.current > 60) {
        blinkState.current = "opening";
        blinkTimer.current = 0;
      }
    } else if (blinkState.current === "opening") {
      blinkAmount.current = Math.max(0, blinkAmount.current - delta * 12);
      if (blinkAmount.current <= 0) {
        blinkState.current = "open";
        blinkTimer.current = 0;
      }
    }

    const breathCycle = Math.sin(time * BREATH_SPEED) * BREATH_AMOUNT;

    if (bodyRef.current) {
      bodyRef.current.position.x = cp.bodyPosition[0];
      bodyRef.current.position.y = cp.bodyPosition[1] + breathCycle;
      bodyRef.current.position.z = cp.bodyPosition[2];
    }

    if (headRef.current) {
      headRef.current.rotation.x = cp.headRotation[0] + Math.sin(time * 0.7) * 0.01;
      headRef.current.rotation.y = cp.headRotation[1] + Math.sin(time * 0.5) * 0.008;
      headRef.current.rotation.z = cp.headRotation[2];
    }

    if (leftEyeRef.current) {
      const eyeY = 0.12 + blinkAmount.current * 0.03;
      const scaleY = cp.eyeScale * (1 - blinkAmount.current * 0.85);
      leftEyeRef.current.scale.y = Math.max(0.05, scaleY);
      leftEyeRef.current.position.y = eyeY;
    }
    if (rightEyeRef.current) {
      const eyeY = 0.12 + blinkAmount.current * 0.03;
      const scaleY = cp.eyeScale * (1 - blinkAmount.current * 0.85);
      rightEyeRef.current.scale.y = Math.max(0.05, scaleY);
      rightEyeRef.current.position.y = eyeY;
    }

    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = cp.leftEyePosition[0] * 0.03;
      leftPupilRef.current.position.y = 0.12 + cp.leftEyePosition[1] * 0.03;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = cp.rightEyePosition[0] * 0.03;
      rightPupilRef.current.position.y = 0.12 + cp.rightEyePosition[1] * 0.03;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = cp.leftArmRotation[0];
      leftArmRef.current.rotation.y = cp.leftArmRotation[1];
      leftArmRef.current.rotation.z = cp.leftArmRotation[2];
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = cp.rightArmRotation[0];
      rightArmRef.current.rotation.y = cp.rightArmRotation[1];
      rightArmRef.current.rotation.z = cp.rightArmRotation[2];
    }

    if (leftEyebrowRef.current) {
      leftEyebrowRef.current.position.y = 0.2 + cp.eyebrowRaise * 0.02;
    }
    if (rightEyebrowRef.current) {
      rightEyebrowRef.current.position.y = 0.2 + cp.eyebrowRaise * 0.02;
    }

    if (mouthRef.current) {
      const smileWidth = 0.3 + cp.mouthSmile * 0.1;
      mouthRef.current.scale.x = smileWidth;
      mouthRef.current.scale.y = 0.1 + cp.mouthOpen * 0.15;
    }
  });

  const skinColor = "#f0c8a0";
  const hairColor = "#4a2a0a";
  const shirtColor = "#3b5998";
  const pantsColor = "#2c3e50";
  const shoeColor = "#1a1a2e";
  const eyeWhite = "#ffffff";
  const pupilColor = "#2c1810";
  const mouthColor = "#c0392b";
  const eyebrowColor = "#3d2b1f";

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Body */}
      <group ref={bodyRef}>
        {/* Torso */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.3, 8, 16]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>

        {/* Hoodie detail */}
        <mesh position={[0, 0.58, 0.08]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={shirtColor} roughness={0.5} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.08, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 0.78, 0]}>
          {/* Head sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial color={skinColor} roughness={0.65} />
          </mesh>

          {/* Hair */}
          <mesh position={[0, 0.06, -0.02]} castShadow>
            <sphereGeometry args={[0.185, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={hairColor} roughness={0.8} />
          </mesh>

          {/* Left eye white */}
          <mesh
            ref={leftEyeRef}
            position={[-0.06, 0.12, 0.15]}
          >
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color={eyeWhite} roughness={0.3} />
          </mesh>

          {/* Left pupil */}
          <mesh
            ref={leftPupilRef}
            position={[-0.06, 0.12, 0.185]}
          >
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color={pupilColor} roughness={0.4} />
          </mesh>

          {/* Left eye highlight */}
          <mesh position={[-0.055, 0.13, 0.19]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>

          {/* Right eye white */}
          <mesh
            ref={rightEyeRef}
            position={[0.06, 0.12, 0.15]}
          >
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color={eyeWhite} roughness={0.3} />
          </mesh>

          {/* Right pupil */}
          <mesh
            ref={rightPupilRef}
            position={[0.06, 0.12, 0.185]}
          >
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color={pupilColor} roughness={0.4} />
          </mesh>

          {/* Right eye highlight */}
          <mesh position={[0.065, 0.13, 0.19]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>

          {/* Left eyebrow */}
          <mesh
            ref={leftEyebrowRef}
            position={[-0.06, 0.2, 0.16]}
            rotation={[0, 0, 0.08]}
          >
            <boxGeometry args={[0.055, 0.012, 0.01]} />
            <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
          </mesh>

          {/* Right eyebrow */}
          <mesh
            ref={rightEyebrowRef}
            position={[0.06, 0.2, 0.16]}
            rotation={[0, 0, -0.08]}
          >
            <boxGeometry args={[0.055, 0.012, 0.01]} />
            <meshStandardMaterial color={eyebrowColor} roughness={0.9} />
          </mesh>

          {/* Nose */}
          <mesh position={[0, 0.08, 0.17]} castShadow>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>

          {/* Mouth */}
          <mesh
            ref={mouthRef}
            position={[0, 0.02, 0.165]}
          >
            <boxGeometry args={[1, 1, 0.005]} />
            <meshStandardMaterial color={mouthColor} roughness={0.5} />
          </mesh>

          {/* Left ear */}
          <mesh position={[-0.17, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>

          {/* Right ear */}
          <mesh position={[0.17, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Left arm */}
        <group ref={leftArmRef} position={[-0.22, 0.5, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.15, 6, 12]} />
            <meshStandardMaterial color={shirtColor} roughness={0.6} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rightArmRef} position={[0.22, 0.5, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.15, 6, 12]} />
            <meshStandardMaterial color={shirtColor} roughness={0.6} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Hips / Belt area */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.15, 0.06, 16]} />
          <meshStandardMaterial color="#8B7355" roughness={0.7} />
        </mesh>

        {/* Left leg */}
        <mesh position={[-0.07, 0.0, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.2, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        {/* Left shoe */}
        <mesh position={[-0.07, -0.16, 0.02]} castShadow>
          <boxGeometry args={[0.08, 0.04, 0.12]} />
          <meshStandardMaterial color={shoeColor} roughness={0.8} />
        </mesh>

        {/* Right leg */}
        <mesh position={[0.07, 0.0, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.2, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.7} />
        </mesh>
        {/* Right shoe */}
        <mesh position={[0.07, -0.16, 0.02]} castShadow>
          <boxGeometry args={[0.08, 0.04, 0.12]} />
          <meshStandardMaterial color={shoeColor} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

interface ThreeDCharacterProps {
  characterState: CharacterState;
  className?: string;
}

export function ThreeDCharacter({
  characterState,
  className,
}: ThreeDCharacterProps) {
  const [hasError, setHasError] = useState(false);

  const targetPose = useMemo(() => {
    return POSES[characterState] || POSES.idle;
  }, [characterState]);

  if (hasError) {
    return null;
  }

  return (
    <div className={`three-d-character-container ${className || ""}`}>
      <Canvas
        camera={{ position: [0, 0.3, 1.8], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onError={() => setHasError(true)}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[2, 3, 4]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[-2, 1, 2]} intensity={0.3} />
        <pointLight position={[0, 2, 2]} intensity={0.2} color="#ffeedd" />

        <HumanoidCharacter
          targetPose={targetPose}
        />

        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={0.3}
          scale={2}
          blur={2}
          far={1}
        />

        <Environment preset="city" environmentIntensity={0.3} />
      </Canvas>
    </div>
  );
}

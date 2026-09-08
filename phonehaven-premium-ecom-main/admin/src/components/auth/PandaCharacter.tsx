import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CharacterState } from "../../hooks/useCharacterInteraction";

interface PandaCharacterProps {
  characterState: CharacterState;
  className?: string;
}

const SOFT = { type: "spring" as const, stiffness: 80, damping: 18 };
const SNAPPY = { type: "spring" as const, stiffness: 200, damping: 16 };

function useAutoBlink() {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 2800 + Math.random() * 2000;
      timeout = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); schedule(); }, 130);
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);
  return blinking;
}

function useIdleSway() {
  const [sway, setSway] = useState(0);
  useEffect(() => {
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.012;
      setSway(Math.sin(t) * 3);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  return sway;
}

interface PandaPose {
  eyeScaleY: number;
  pupilX: number;
  pupilY: number;
  mouthD: string;
  eyebrowRotate: number;
  headTilt: number;
  headY: number;
  pawOverEyes: number;
  pawOnChin: number;
  bodyBounce: number;
  blushOpacity: number;
}

function getPose(state: CharacterState, blinking: boolean): PandaPose {
  if (blinking && state !== "passwordHidden" && state !== "success") {
    return {
      eyeScaleY: 0.08,
      pupilX: 0, pupilY: 0,
      mouthD: "M 85 118 Q 100 126 115 118",
      eyebrowRotate: 0,
      headTilt: 0, headY: 0,
      pawOverEyes: 0, pawOnChin: 0,
      bodyBounce: 0, blushOpacity: 0.15,
    };
  }

  switch (state) {
    case "emailFocus":
      return {
        eyeScaleY: 1, pupilX: 6, pupilY: 1,
        mouthD: "M 87 118 Q 100 128 113 118",
        eyebrowRotate: -4,
        headTilt: -6, headY: 0,
        pawOverEyes: 0, pawOnChin: 0,
        bodyBounce: 0, blushOpacity: 0.35,
      };
    case "emailTyping":
      return {
        eyeScaleY: 1, pupilX: 5, pupilY: 2,
        mouthD: "M 88 118 Q 100 126 112 118",
        eyebrowRotate: -2,
        headTilt: -3, headY: -1,
        pawOverEyes: 0, pawOnChin: 0,
        bodyBounce: 1, blushOpacity: 0.3,
      };
    case "passwordFocus":
      return {
        eyeScaleY: 1.08, pupilX: -4, pupilY: 3,
        mouthD: "M 92 120 L 108 120",
        eyebrowRotate: 6,
        headTilt: 5, headY: 2,
        pawOverEyes: 0, pawOnChin: 1,
        bodyBounce: 0, blushOpacity: 0.25,
      };
    case "passwordTyping":
      return {
        eyeScaleY: 1.05, pupilX: -3, pupilY: 3,
        mouthD: "M 90 118 Q 100 124 110 118",
        eyebrowRotate: 4,
        headTilt: 3, headY: 1,
        pawOverEyes: 0, pawOnChin: 1,
        bodyBounce: 1, blushOpacity: 0.25,
      };
    case "passwordVisible":
      return {
        eyeScaleY: 1.35, pupilX: 0, pupilY: 0,
        mouthD: "M 84 116 Q 100 132 116 116",
        eyebrowRotate: -8,
        headTilt: 0, headY: -5,
        pawOverEyes: 0, pawOnChin: 0,
        bodyBounce: -4, blushOpacity: 0.5,
      };
    case "passwordHidden":
      return {
        eyeScaleY: 0.08, pupilX: 0, pupilY: 0,
        mouthD: "M 88 118 Q 100 126 112 118",
        eyebrowRotate: 0,
        headTilt: 4, headY: 0,
        pawOverEyes: 1, pawOnChin: 0,
        bodyBounce: 0, blushOpacity: 0.4,
      };
    case "submitting":
      return {
        eyeScaleY: 0.7, pupilX: 0, pupilY: -2,
        mouthD: "M 92 120 Q 100 124 108 120",
        eyebrowRotate: 3,
        headTilt: 2, headY: -2,
        pawOverEyes: 0, pawOnChin: 0.6,
        bodyBounce: 0, blushOpacity: 0.2,
      };
    case "success":
      return {
        eyeScaleY: 0.35, pupilX: 0, pupilY: 0,
        mouthD: "M 82 114 Q 100 136 118 114",
        eyebrowRotate: -6,
        headTilt: 0, headY: -8,
        pawOverEyes: 0, pawOnChin: 0,
        bodyBounce: -6, blushOpacity: 0.55,
      };
    case "error":
      return {
        eyeScaleY: 0.85, pupilX: 0, pupilY: 2,
        mouthD: "M 90 124 Q 100 118 110 124",
        eyebrowRotate: 10,
        headTilt: -3, headY: 2,
        pawOverEyes: 0, pawOnChin: 0,
        bodyBounce: 2, blushOpacity: 0.1,
      };
    case "switching":
      return {
        eyeScaleY: 1.15, pupilX: 0, pupilY: -1,
        mouthD: "M 88 116 Q 100 128 112 116",
        eyebrowRotate: -5,
        headTilt: 0, headY: -3,
        pawOverEyes: 0, pawOnChin: 0,
        bodyBounce: -2, blushOpacity: 0.35,
      };
    default:
      return {
        eyeScaleY: 1, pupilX: 0, pupilY: 0,
        mouthD: "M 87 118 Q 100 126 113 118",
        eyebrowRotate: 0,
        headTilt: 0, headY: 0,
        pawOverEyes: 0, pawOnChin: 0,
        bodyBounce: 0, blushOpacity: 0.15,
      };
  }
}

export function PandaCharacter({ characterState, className }: PandaCharacterProps) {
  const blinking = useAutoBlink();
  const sway = useIdleSway();
  const [sparkles, setSparkles] = useState(false);
  const p = getPose(characterState, blinking);

  useEffect(() => {
    if (characterState === "success") {
      setSparkles(true);
      const t = setTimeout(() => setSparkles(false), 2500);
      return () => clearTimeout(t);
    }
    setSparkles(false);
  }, [characterState]);

  return (
    <div className={`panda-character-wrap ${className || ""}`}>
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="panda-character-svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="pandaFace" cx="100" cy="95" r="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0ede8" />
          </radialGradient>
          <filter id="pandaShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="212" rx="40" ry="6" fill="#d5c8b8" opacity="0.4" />

        {/* === BODY === */}
        <motion.g
          animate={{ y: p.bodyBounce }}
          transition={SNAPPY}
        >
          {/* Body */}
          <ellipse cx="100" cy="175" rx="38" ry="32" fill="#2a2a2a" filter="url(#pandaShadow)" />
          {/* Belly */}
          <ellipse cx="100" cy="178" rx="22" ry="20" fill="#f5f0ea" />

          {/* Left arm */}
          <motion.g
            animate={{
              rotate: p.pawOnChin > 0.5 ? -30 : p.pawOverEyes > 0.5 ? -10 : 0,
              y: p.pawOverEyes > 0.5 ? -15 : 0,
            }}
            transition={SOFT}
            style={{ transformOrigin: "62px 165px" }}
          >
            <ellipse cx="60" cy="168" rx="14" ry="10" fill="#2a2a2a" />
            <ellipse cx="56" cy="170" rx="6" ry="5" fill="#1a1a1a" />
          </motion.g>

          {/* Right arm */}
          <motion.g
            animate={{
              rotate: p.pawOnChin > 0.5 ? 25 : p.pawOverEyes > 0.5 ? 0 : 0,
              y: p.pawOnChin > 0.5 ? -8 : 0,
            }}
            transition={SOFT}
            style={{ transformOrigin: "138px 165px" }}
          >
            <ellipse cx="140" cy="168" rx="14" ry="10" fill="#2a2a2a" />
            <ellipse cx="144" cy="170" rx="6" ry="5" fill="#1a1a1a" />
          </motion.g>

          {/* Left foot */}
          <ellipse cx="80" cy="205" rx="14" ry="8" fill="#2a2a2a" />
          <ellipse cx="80" cy="204" rx="10" ry="6" fill="#1a1a1a" />

          {/* Right foot */}
          <ellipse cx="120" cy="205" rx="14" ry="8" fill="#2a2a2a" />
          <ellipse cx="120" cy="204" rx="10" ry="6" fill="#1a1a1a" />
        </motion.g>

        {/* === HEAD GROUP === */}
        <motion.g
          animate={{
            rotate: p.headTilt,
            y: sway * 0.3 + p.headY,
          }}
          transition={SOFT}
          style={{ transformOrigin: "100px 85px" }}
        >
          {/* Head - white circle */}
          <circle cx="100" cy="82" r="48" fill="url(#pandaFace)" filter="url(#pandaShadow)" />

          {/* Left ear */}
          <circle cx="62" cy="42" r="16" fill="#2a2a2a" />
          <circle cx="62" cy="42" r="9" fill="#1a1a1a" />

          {/* Right ear */}
          <circle cx="138" cy="42" r="16" fill="#2a2a2a" />
          <circle cx="138" cy="42" r="9" fill="#1a1a1a" />

          {/* Left eye patch */}
          <ellipse cx="78" cy="78" rx="18" ry="16" fill="#2a2a2a" transform="rotate(-8 78 78)" />

          {/* Right eye patch */}
          <ellipse cx="122" cy="78" rx="18" ry="16" fill="#2a2a2a" transform="rotate(8 122 78)" />

          {/* Left eye white */}
          <motion.ellipse
            cx="78" cy="80"
            rx="9" ry="10"
            fill="#ffffff"
            animate={{ scaleY: p.eyeScaleY }}
            transition={SNAPPY}
            style={{ transformOrigin: "78px 80px" }}
          />
          {/* Left pupil */}
          <motion.circle
            r="4.5"
            fill="#1a1a1a"
            animate={{ cx: 78 + p.pupilX, cy: 80 + p.pupilY }}
            transition={{ duration: 0.15 }}
          />
          {/* Left eye highlight */}
          <circle cx="76" cy="77" r="2" fill="#ffffff" />

          {/* Right eye white */}
          <motion.ellipse
            cx="122" cy="80"
            rx="9" ry="10"
            fill="#ffffff"
            animate={{ scaleY: p.eyeScaleY }}
            transition={SNAPPY}
            style={{ transformOrigin: "122px 80px" }}
          />
          {/* Right pupil */}
          <motion.circle
            r="4.5"
            fill="#1a1a1a"
            animate={{ cx: 122 + p.pupilX, cy: 80 + p.pupilY }}
            transition={{ duration: 0.15 }}
          />
          {/* Right eye highlight */}
          <circle cx="120" cy="77" r="2" fill="#ffffff" />

          {/* Nose */}
          <ellipse cx="100" cy="96" rx="5" ry="3.5" fill="#2a2a2a" />
          <ellipse cx="100" cy="95.5" rx="2" ry="1" fill="#555" />

          {/* Mouth */}
          <motion.path
            animate={{ d: p.mouthD }}
            transition={SOFT}
            stroke="#2a2a2a"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cheek blush */}
          <motion.ellipse
            cx="62" cy="94" rx="8" ry="5"
            fill="#f0a0a0"
            animate={{ opacity: p.blushOpacity }}
            transition={{ duration: 0.4 }}
          />
          <motion.ellipse
            cx="138" cy="94" rx="8" ry="5"
            fill="#f0a0a0"
            animate={{ opacity: p.blushOpacity }}
            transition={{ duration: 0.4 }}
          />

          {/* === PAW OVER EYES (for password hidden) === */}
          <motion.g
            animate={{ opacity: p.pawOverEyes }}
            transition={SOFT}
          >
            <ellipse cx="78" cy="80" rx="14" ry="12" fill="#2a2a2a" />
            <ellipse cx="122" cy="80" rx="14" ry="12" fill="#2a2a2a" />
            {/* Paw pads */}
            <circle cx="78" cy="80" r="4" fill="#1a1a1a" />
            <circle cx="72" cy="74" r="2.5" fill="#1a1a1a" />
            <circle cx="84" cy="74" r="2.5" fill="#1a1a1a" />
            <circle cx="122" cy="80" r="4" fill="#1a1a1a" />
            <circle cx="116" cy="74" r="2.5" fill="#1a1a1a" />
            <circle cx="128" cy="74" r="2.5" fill="#1a1a1a" />
          </motion.g>

          {/* === PAW ON CHIN (for thinking) === */}
          <motion.g
            animate={{ opacity: p.pawOnChin }}
            transition={SOFT}
          >
            <ellipse cx="115" cy="110" rx="10" ry="8" fill="#2a2a2a" />
            <circle cx="115" cy="110" r="4" fill="#1a1a1a" />
            <circle cx="110" cy="105" r="2.5" fill="#1a1a1a" />
            <circle cx="120" cy="105" r="2.5" fill="#1a1a1a" />
          </motion.g>
        </motion.g>

        {/* === SPARKLES on success === */}
        <AnimatePresence>
          {sparkles && (
            <>
              {[
                { cx: 48, cy: 50, delay: 0, color: "#f0c86a" },
                { cx: 152, cy: 45, delay: 0.15, color: "#f0a0a0" },
                { cx: 35, cy: 75, delay: 0.3, color: "#a0d8f0" },
                { cx: 165, cy: 70, delay: 0.45, color: "#f0c86a" },
                { cx: 100, cy: 25, delay: 0.2, color: "#f0a0a0" },
              ].map((s, i) => (
                <motion.g key={i}>
                  <motion.path
                    d={`M ${s.cx} ${s.cy - 5} L ${s.cx + 2} ${s.cy - 2} L ${s.cx + 5} ${s.cy} L ${s.cx + 2} ${s.cy + 2} L ${s.cx} ${s.cy + 5} L ${s.cx - 2} ${s.cy + 2} L ${s.cx - 5} ${s.cy} L ${s.cx - 2} ${s.cy - 2} Z`}
                    fill={s.color}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0], y: [0, -25, -50] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, delay: s.delay, ease: "easeOut" }}
                    style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
                  />
                </motion.g>
              ))}
            </>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

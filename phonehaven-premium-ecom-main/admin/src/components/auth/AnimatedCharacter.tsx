import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CharacterState } from "../../hooks/useCharacterInteraction";

interface AnimatedCharacterProps {
  characterState: CharacterState;
  className?: string;
}

type EyeVariant = "idle" | "typing" | "wide" | "wink" | "sad" | "excited" | "peek";
type MouthVariant = "idle" | "smile" | "wide-smile" | "surprised" | "sad" | "thinking";
type HandVariant = "idle" | "thinking" | "wave" | "cover" | "celebrate" | "shrug";

const SPRING = { type: "spring" as const, stiffness: 120, damping: 14 };
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
        setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 150);
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
      t += 0.015;
      setSway(Math.sin(t) * 2.5);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return sway;
}

function getVariants(state: CharacterState): {
  eye: EyeVariant;
  mouth: MouthVariant;
  hand: HandVariant;
  headTilt: number;
  bodyY: number;
  bodyScale: number;
} {
  switch (state) {
    case "emailFocus":
      return { eye: "typing", mouth: "smile", hand: "idle", headTilt: -8, bodyY: 0, bodyScale: 1 };
    case "emailTyping":
      return { eye: "typing", mouth: "smile", hand: "idle", headTilt: -5, bodyY: 0, bodyScale: 1 };
    case "passwordFocus":
      return { eye: "idle", mouth: "thinking", hand: "thinking", headTilt: 6, bodyY: 2, bodyScale: 1 };
    case "passwordTyping":
      return { eye: "typing", mouth: "smile", hand: "thinking", headTilt: 4, bodyY: 1, bodyScale: 1 };
    case "passwordVisible":
      return { eye: "wide", mouth: "wide-smile", hand: "wave", headTilt: 0, bodyY: -3, bodyScale: 1.02 };
    case "passwordHidden":
      return { eye: "wink", mouth: "smile", hand: "cover", headTilt: 5, bodyY: 0, bodyScale: 1 };
    case "submitting":
      return { eye: "excited", mouth: "smile", hand: "idle", headTilt: 0, bodyY: -5, bodyScale: 1.03 };
    case "success":
      return { eye: "excited", mouth: "wide-smile", hand: "celebrate", headTilt: 0, bodyY: -8, bodyScale: 1.05 };
    case "error":
      return { eye: "sad", mouth: "sad", hand: "shrug", headTilt: -3, bodyY: 2, bodyScale: 0.98 };
    case "switching":
      return { eye: "excited", mouth: "surprised", hand: "wave", headTilt: 0, bodyY: -2, bodyScale: 1 };
    default:
      return { eye: "idle", mouth: "idle", hand: "idle", headTilt: 0, bodyY: 0, bodyScale: 1 };
  }
}

export function AnimatedCharacter({ characterState, className }: AnimatedCharacterProps) {
  const blinking = useAutoBlink();
  const sway = useIdleSway();
  const [sparkles, setSparkles] = useState(false);

  const v = getVariants(characterState);

  useEffect(() => {
    if (characterState === "success") {
      setSparkles(true);
      const t = setTimeout(() => setSparkles(false), 2500);
      return () => clearTimeout(t);
    }
    setSparkles(false);
  }, [characterState]);

  const getEyeYScale = useCallback((): number => {
    if (blinking) return 0.1;
    if (v.eye === "wide") return 1.25;
    if (v.eye === "excited") return 0.5;
    if (v.eye === "sad") return 0.85;
    return 1;
  }, [blinking, v.eye]);

  const getLeftPupil = useCallback((): { x: number; y: number } => {
    if (v.eye === "typing") return { x: 2, y: 3 };
    if (v.eye === "wink") return { x: 0, y: 0 };
    return { x: 0, y: 0 };
  }, [v.eye]);

  const getMouthPath = useCallback((): string => {
    switch (v.mouth) {
      case "smile":
        return "M 88 138 Q 100 148 112 138";
      case "wide-smile":
        return "M 84 136 Q 100 154 116 136";
      case "surprised":
        return "M 94 142 Q 100 148 106 142";
      case "sad":
        return "M 92 144 Q 100 138 108 144";
      case "thinking":
        return "M 94 140 L 106 140";
      default:
        return "M 90 140 Q 100 146 110 140";
    }
  }, [v.mouth]);

  const leftHandPath = useCallback((): string => {
    switch (v.hand) {
      case "thinking":
        return "M 42 128 Q 38 108 44 90";
      case "cover":
        return "M 42 128 Q 36 100 50 78";
      case "celebrate":
        return "M 42 128 Q 30 100 36 72";
      case "shrug":
        return "M 42 128 Q 34 118 30 124";
      default:
        return "M 42 128 Q 34 140 30 152";
    }
  }, [v.hand]);

  const rightHandPath = useCallback((): string => {
    switch (v.hand) {
      case "thinking":
        return "M 158 128 Q 162 108 156 90";
      case "wave":
        return "M 158 128 Q 168 96 164 72";
      case "celebrate":
        return "M 158 128 Q 170 100 164 72";
      case "shrug":
        return "M 158 128 Q 166 118 170 124";
      default:
        return "M 158 128 Q 166 140 170 152";
    }
  }, [v.hand]);

  return (
    <div className={`animated-character-wrap ${className || ""}`}>
      <svg
        viewBox="0 0 200 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animated-character-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skinGrad" x1="100" y1="40" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5d0a9" />
            <stop offset="100%" stopColor="#e8b88a" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="100" y1="30" x2="100" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5c3a1e" />
            <stop offset="100%" stopColor="#3d2512" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="100" y1="145" x2="100" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4a7c59" />
            <stop offset="100%" stopColor="#3a6347" />
          </linearGradient>
          <linearGradient id="pantsGrad" x1="100" y1="205" x2="100" y2="255" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34495e" />
            <stop offset="100%" stopColor="#2c3e50" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Shadow on ground */}
        <ellipse cx="100" cy="272" rx="36" ry="5" fill="#d5c8b8" opacity="0.5" />

        {/* === BODY GROUP with idle sway + state transforms === */}
        <motion.g
          animate={{
            y: v.bodyY,
            scaleY: v.bodyScale,
            rotate: sway,
          }}
          transition={SNAPPY}
          style={{ transformOrigin: "100px 270px" }}
        >
          {/* === LEFT LEG === */}
          <motion.g
            animate={{ y: characterState === "submitting" ? -3 : 0 }}
            transition={SPRING}
          >
            <rect x="80" y="208" width="16" height="48" rx="8" fill="url(#pantsGrad)" />
            <ellipse cx="88" cy="257" rx="12" ry="6" fill="#1a1a2e" />
            <ellipse cx="88" cy="255.5" rx="10" ry="4.5" fill="#2c3e50" />
          </motion.g>

          {/* === RIGHT LEG === */}
          <motion.g
            animate={{ y: characterState === "submitting" ? -3 : 0 }}
            transition={{ ...SPRING, delay: 0.05 }}
          >
            <rect x="104" y="208" width="16" height="48" rx="8" fill="url(#pantsGrad)" />
            <ellipse cx="112" cy="257" rx="12" ry="6" fill="#1a1a2e" />
            <ellipse cx="112" cy="255.5" rx="10" ry="4.5" fill="#2c3e50" />
          </motion.g>

          {/* === TORSO === */}
          <motion.rect
            x="72" y="145" width="56" height="70" rx="14"
            fill="url(#shirtGrad)"
            filter="url(#shadow)"
          />
          {/* Collar */}
          <path d="M 88 145 L 100 155 L 112 145" stroke="#3a6347" strokeWidth="1.5" fill="none" />
          {/* Hoodie pocket */}
          <rect x="86" y="178" width="28" height="12" rx="4" fill="#3a6347" opacity="0.5" />
          {/* Belt */}
          <rect x="72" y="205" width="56" height="6" rx="2" fill="#8B7355" />
          <rect x="96" y="203.5" width="8" height="9" rx="2" fill="#7a6349" />

          {/* === LEFT ARM === */}
          <motion.path
            d={leftHandPath()}
            stroke="url(#shirtGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: leftHandPath(),
              rotate: v.hand === "thinking" ? -15 : v.hand === "celebrate" ? -25 : v.hand === "shrug" ? -5 : 0,
            }}
            transition={SOFT}
            style={{ transformOrigin: "72px 150px" }}
          />
          {/* Left hand */}
          <motion.circle
            r="8"
            fill="url(#skinGrad)"
            animate={{
              cx: v.hand === "thinking" ? 44 : v.hand === "cover" ? 50 : v.hand === "celebrate" ? 36 : v.hand === "shrug" ? 30 : 30,
              cy: v.hand === "thinking" ? 90 : v.hand === "cover" ? 78 : v.hand === "celebrate" ? 72 : v.hand === "shrug" ? 124 : 152,
            }}
            transition={SOFT}
          />

          {/* === RIGHT ARM === */}
          <motion.path
            d={rightHandPath()}
            stroke="url(#shirtGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: rightHandPath(),
              rotate: v.hand === "wave" ? 10 : v.hand === "celebrate" ? 25 : v.hand === "shrug" ? 5 : 0,
            }}
            transition={SOFT}
            style={{ transformOrigin: "128px 150px" }}
          />
          {/* Right hand */}
          <motion.circle
            r="8"
            fill="url(#skinGrad)"
            animate={{
              cx: v.hand === "wave" ? 164 : v.hand === "celebrate" ? 164 : v.hand === "shrug" ? 170 : 170,
              cy: v.hand === "wave" ? 72 : v.hand === "celebrate" ? 72 : v.hand === "shrug" ? 124 : 152,
            }}
            transition={SOFT}
          />
          {/* Waving sparkle on right hand during wave */}
          {v.hand === "wave" && (
            <>
              <motion.circle
                cx="172" cy="64" r="2.5" fill="#f0c86a"
                animate={{ opacity: [0, 1, 0], y: [0, -6, -12] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.3 }}
              />
              <motion.circle
                cx="156" cy="60" r="2" fill="#f0c86a"
                animate={{ opacity: [0, 1, 0], y: [0, -8, -16] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5, delay: 0.2 }}
              />
            </>
          )}

          {/* === NECK === */}
          <rect x="92" y="133" width="16" height="16" rx="4" fill="url(#skinGrad)" />

          {/* === HEAD GROUP with tilt === */}
          <motion.g
            animate={{ rotate: v.headTilt }}
            transition={SOFT}
            style={{ transformOrigin: "100px 100px" }}
          >
            {/* Hair back */}
            <ellipse cx="100" cy="78" rx="40" ry="38" fill="url(#hairGrad)" />

            {/* Face */}
            <ellipse cx="100" cy="86" rx="34" ry="32" fill="url(#skinGrad)" />

            {/* Hair front bangs */}
            <path
              d="M 66 72 Q 68 48 84 44 Q 92 42 100 44 Q 108 42 116 44 Q 132 48 134 72 Q 128 62 116 58 Q 104 56 92 58 Q 80 62 74 72 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair side left */}
            <path d="M 66 72 Q 62 88 64 104 Q 66 94 70 82 Z" fill="url(#hairGrad)" />
            {/* Hair side right */}
            <path d="M 134 72 Q 138 88 136 104 Q 134 94 130 82 Z" fill="url(#hairGrad)" />

            {/* === LEFT EYE === */}
            <motion.g
              animate={{ scaleY: v.eye === "wink" ? 0.1 : getEyeYScale() }}
              transition={SNAPPY}
              style={{ transformOrigin: "84px 90px" }}
            >
              {/* Eye white */}
              <ellipse cx="84" cy="90" rx="8" ry="9" fill="#ffffff" />
              {/* Iris */}
              <motion.circle
                r="5"
                fill="#3d2b1f"
                animate={{ cx: 84 + getLeftPupil().x, cy: 90 + getLeftPupil().y }}
                transition={{ duration: 0.2 }}
              />
              {/* Pupil */}
              <motion.circle
                r="2.5"
                fill="#1a0f08"
                animate={{ cx: 84 + getLeftPupil().x, cy: 90 + getLeftPupil().y }}
                transition={{ duration: 0.2 }}
              />
              {/* Highlight */}
              <circle cx="82" cy="87" r="1.8" fill="#ffffff" />
            </motion.g>

            {/* === RIGHT EYE === */}
            <motion.g
              animate={{ scaleY: v.eye === "wink" ? 1.1 : v.eye === "wide" ? 1.3 : getEyeYScale() }}
              transition={SNAPPY}
              style={{ transformOrigin: "116px 90px" }}
            >
              {/* Eye white */}
              <ellipse cx="116" cy="90" rx="8" ry="9" fill="#ffffff" />
              {/* Iris */}
              <motion.circle
                r="5"
                fill="#3d2b1f"
                animate={{ cx: 116 + getLeftPupil().x, cy: 90 + getLeftPupil().y }}
                transition={{ duration: 0.2 }}
              />
              {/* Pupil */}
              <motion.circle
                r="2.5"
                fill="#1a0f08"
                animate={{ cx: 116 + getLeftPupil().x, cy: 90 + getLeftPupil().y }}
                transition={{ duration: 0.2 }}
              />
              {/* Highlight */}
              <circle cx="114" cy="87" r="1.8" fill="#ffffff" />
            </motion.g>

            {/* === EYEBROWS === */}
            <motion.line
              x1="74" y1="76" x2="92" y2="76"
              stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round"
              animate={{
                y1: v.eye === "sad" ? 78 : v.eye === "excited" ? 73 : 76,
                y2: v.eye === "sad" ? 74 : v.eye === "excited" ? 74 : 76,
                rotate: v.eye === "sad" ? 8 : v.eye === "excited" ? -5 : 0,
              }}
              transition={SOFT}
              style={{ transformOrigin: "83px 76px" }}
            />
            <motion.line
              x1="108" y1="76" x2="126" y2="76"
              stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round"
              animate={{
                y1: v.eye === "sad" ? 74 : v.eye === "excited" ? 74 : 76,
                y2: v.eye === "sad" ? 78 : v.eye === "excited" ? 73 : 76,
                rotate: v.eye === "sad" ? -8 : v.eye === "excited" ? 5 : 0,
              }}
              transition={SOFT}
              style={{ transformOrigin: "117px 76px" }}
            />

            {/* Nose */}
            <ellipse cx="100" cy="98" rx="2.5" ry="2" fill="#d4a574" />

            {/* === MOUTH === */}
            <motion.path
              animate={{ d: getMouthPath() }}
              transition={SOFT}
              stroke="#c0392b"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* === CHEEK BLUSH === */}
            <motion.ellipse
              cx="68" cy="96" rx="7" ry="4"
              fill="#e8a08a"
              animate={{ opacity: characterState !== "idle" ? 0.4 : 0.18 }}
              transition={{ duration: 0.5 }}
            />
            <motion.ellipse
              cx="132" cy="96" rx="7" ry="4"
              fill="#e8a08a"
              animate={{ opacity: characterState !== "idle" ? 0.4 : 0.18 }}
              transition={{ duration: 0.5 }}
            />

            {/* Ears */}
            <ellipse cx="66" cy="88" rx="5" ry="6" fill="url(#skinGrad)" />
            <ellipse cx="66" cy="88" rx="2.5" ry="4" fill="#d4a574" />
            <ellipse cx="134" cy="88" rx="5" ry="6" fill="url(#skinGrad)" />
            <ellipse cx="134" cy="88" rx="2.5" ry="4" fill="#d4a574" />
          </motion.g>
        </motion.g>

        {/* === CELEBRATION PARTICLES === */}
        <AnimatePresence>
          {sparkles && (
            <>
              {[
                { cx: 60, cy: 50, delay: 0, color: "#f0c86a" },
                { cx: 140, cy: 45, delay: 0.15, color: "#e8a08a" },
                { cx: 45, cy: 70, delay: 0.3, color: "#4a7c59" },
                { cx: 155, cy: 65, delay: 0.45, color: "#f0c86a" },
                { cx: 100, cy: 30, delay: 0.2, color: "#e8a08a" },
              ].map((p, i) => (
                <motion.g key={i}>
                  {/* Star */}
                  <motion.path
                    d={`M ${p.cx} ${p.cy - 4} L ${p.cx + 1.5} ${p.cy - 1.5} L ${p.cx + 4} ${p.cy} L ${p.cx + 1.5} ${p.cy + 1.5} L ${p.cx} ${p.cy + 4} L ${p.cx - 1.5} ${p.cy + 1.5} L ${p.cx - 4} ${p.cy} L ${p.cx - 1.5} ${p.cy - 1.5} Z`}
                    fill={p.color}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [0, -20, -40] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
                    style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}
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

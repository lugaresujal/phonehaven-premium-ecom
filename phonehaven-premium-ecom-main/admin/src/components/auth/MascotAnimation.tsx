import { useMemo } from "react";

interface MascotProps {
  focusedField: string | null;
  showPassword: boolean;
  submitting: boolean;
  hasError: boolean;
}

export function MascotAnimation({ focusedField, showPassword, submitting, hasError }: MascotProps) {
  const isPasswordField = focusedField === "password" || focusedField === "newPassword" || focusedField === "confirmPassword";
  const isEmailField = focusedField === "email" || focusedField === "name";

  const eyeState = useMemo(() => {
    if (submitting) return "excited";
    if (hasError) return "worried";
    if (isPasswordField && !showPassword) return "peek";
    if (isPasswordField && showPassword) return "looking-down";
    if (isEmailField) return "looking-side";
    if (focusedField) return "looking-down";
    return "idle";
  }, [focusedField, showPassword, submitting, hasError, isPasswordField, isEmailField]);

  const pupilOffset = useMemo(() => {
    if (isEmailField) return { x: 5, y: 2 };
    if (isPasswordField) return { x: 0, y: 4 };
    if (focusedField) return { x: 2, y: 3 };
    return { x: 0, y: 0 };
  }, [focusedField, isEmailField, isPasswordField]);

  const headTilt = useMemo(() => {
    if (isEmailField) return -3;
    if (isPasswordField) return 3;
    if (submitting) return 0;
    return 0;
  }, [focusedField, isEmailField, isPasswordField, submitting]);

  const armState = useMemo(() => {
    if (submitting) return "waving";
    if (isPasswordField && !showPassword) return "covering";
    if (isEmailField) return "pointing";
    return "idle";
  }, [isPasswordField, showPassword, isEmailField, submitting]);

  return (
    <div className="auth-character">
      <svg
        className="auth-character-svg"
        viewBox="0 0 240 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Shadow on ground */}
        <ellipse cx="120" cy="350" rx="45" ry="7" fill="#d5c8b8" opacity="0.5" />

        {/* === BODY GROUP with idle sway === */}
        <g className={`auth-char-body ${submitting ? "auth-char-jumping" : ""}`} style={{ transformOrigin: "120px 350px" }}>

          {/* === LEFT LEG === */}
          <g className="auth-char-leg-left">
            <rect x="98" y="260" width="20" height="70" rx="10" fill="#2F2219" />
            {/* Shoe */}
            <ellipse cx="108" cy="332" rx="16" ry="8" fill="#1a1410" />
            <ellipse cx="108" cy="330" rx="14" ry="6" fill="#2F2219" />
          </g>

          {/* === RIGHT LEG === */}
          <g className="auth-char-leg-right">
            <rect x="122" y="260" width="20" height="70" rx="10" fill="#2F2219" />
            {/* Shoe */}
            <ellipse cx="132" cy="332" rx="16" ry="8" fill="#1a1410" />
            <ellipse cx="132" cy="330" rx="14" ry="6" fill="#2F2219" />
          </g>

          {/* === TORSO === */}
          <rect x="88" y="170" width="64" height="100" rx="16" fill="#2F2219" />
          {/* Shirt detail / collar */}
          <path d="M105 170 L120 185 L135 170" stroke="#3D2D1F" strokeWidth="2" fill="none" />
          {/* Belt */}
          <rect x="88" y="248" width="64" height="8" rx="2" fill="#D4A574" />
          <rect x="116" y="246" width="8" height="12" rx="2" fill="#c4956a" />

          {/* === LEFT ARM === */}
          <g className={`auth-char-arm-left ${armState === "pointing" ? "auth-char-arm-pointing" : ""} ${armState === "covering" ? "auth-char-arm-cover" : ""} ${armState === "waving" ? "auth-char-arm-wave" : ""}`} style={{ transformOrigin: "88px 185px" }}>
            <rect x="58" y="178" width="34" height="16" rx="8" fill="#2F2219" />
            {/* Hand */}
            <circle cx="58" cy="186" r="10" fill="#e8c9a0" />
            {armState === "covering" && (
              <>
                {/* Fingers spread over eyes area */}
                <rect x="48" y="174" width="5" height="14" rx="2.5" fill="#d4a574" transform="rotate(-15 48 174)" />
                <rect x="54" y="170" width="5" height="16" rx="2.5" fill="#d4a574" transform="rotate(-5 54 170)" />
                <rect x="60" y="168" width="5" height="17" rx="2.5" fill="#d4a574" />
                <rect x="66" y="170" width="5" height="15" rx="2.5" fill="#d4a574" transform="rotate(8 66 170)" />
              </>
            )}
          </g>

          {/* === RIGHT ARM === */}
          <g className={`auth-char-arm-right ${armState === "pointing" ? "auth-char-arm-right-point" : ""} ${armState === "waving" ? "auth-char-arm-right-wave" : ""}`} style={{ transformOrigin: "152px 185px" }}>
            <rect x="148" y="178" width="34" height="16" rx="8" fill="#2F2219" />
            {/* Hand */}
            <circle cx="182" cy="186" r="10" fill="#e8c9a0" />
            {armState === "pointing" && (
              <g transform="translate(178, 178) rotate(20)">
                <rect x="0" y="0" width="20" height="5" rx="2.5" fill="#e8c9a0" />
                <circle cx="20" cy="2.5" r="3" fill="#d4a574" />
              </g>
            )}
          </g>

          {/* === NECK === */}
          <rect x="110" y="155" width="20" height="20" rx="4" fill="#e8c9a0" />

          {/* === HEAD GROUP with tilt === */}
          <g className="auth-char-head" style={{ transformOrigin: "120px 130px", transform: `rotate(${headTilt}deg)` }}>

            {/* Hair back */}
            <ellipse cx="120" cy="100" rx="52" ry="50" fill="#5c3a1e" />

            {/* Face */}
            <ellipse cx="120" cy="110" rx="44" ry="42" fill="#e8c9a0" />

            {/* Hair front - bangs */}
            <path d="M76 90 Q80 60 100 55 Q110 52 120 54 Q130 52 140 55 Q160 60 164 90 Q155 78 140 75 Q125 72 110 75 Q95 78 86 90 Z" fill="#5c3a1e" />
            {/* Hair side left */}
            <path d="M76 90 Q72 110 74 130 Q76 120 80 105 Z" fill="#5c3a1e" />
            {/* Hair side right */}
            <path d="M164 90 Q168 110 166 130 Q164 120 160 105 Z" fill="#5c3a1e" />

            {/* === EYES === */}
            {eyeState === "worried" ? (
              <>
                {/* Worried eyes - eyebrows angled */}
                <line x1="92" y1="100" x2="104" y2="103" stroke="#5c3a1e" strokeWidth="3" strokeLinecap="round" />
                <line x1="136" y1="103" x2="148" y2="100" stroke="#5c3a1e" strokeWidth="3" strokeLinecap="round" />
                <ellipse cx="100" cy="114" rx="8" ry="9" fill="#fff" />
                <ellipse cx="140" cy="114" rx="8" ry="9" fill="#fff" />
                <circle cx="100" cy="116" r="5" fill="#2F2219" />
                <circle cx="140" cy="116" r="5" fill="#2F2219" />
                <circle cx="98" cy="114" r="2" fill="#fff" />
                <circle cx="138" cy="114" r="2" fill="#fff" />
                {/* Worried mouth */}
                <path d="M112 138 Q120 134 128 138" stroke="#c47a5a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : eyeState === "excited" ? (
              <>
                {/* Excited eyes - happy squint */}
                <path d="M92 112 Q100 106 108 112" stroke="#2F2219" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M132 112 Q140 106 148 112" stroke="#2F2219" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Happy blush */}
                <ellipse cx="88" cy="120" rx="8" ry="5" fill="#e8a08a" opacity="0.5" />
                <ellipse cx="152" cy="120" rx="8" ry="5" fill="#e8a08a" opacity="0.5" />
                {/* Big smile */}
                <path d="M108 134 Q120 146 132 134" stroke="#c47a5a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : eyeState === "peek" ? (
              <>
                {/* Peek - hand covering, eyes peeking through fingers */}
                {/* Eyebrows normal */}
                <line x1="92" y1="102" x2="106" y2="102" stroke="#5c3a1e" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="134" y1="102" x2="148" y2="102" stroke="#5c3a1e" strokeWidth="2.5" strokeLinecap="round" />
                {/* Small peeking eyes */}
                <circle cx="100" cy="114" r="4" fill="#2F2219" />
                <circle cx="140" cy="114" r="4" fill="#2F2219" />
                <circle cx="99" cy="113" r="1.5" fill="#fff" />
                <circle cx="139" cy="113" r="1.5" fill="#fff" />
                {/* Smile */}
                <path d="M112 136 Q120 142 128 136" stroke="#c47a5a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                {/* Normal / Looking - expressive eyes */}
                {/* Eyebrows */}
                <line x1="90" y1="100" x2="108" y2="100" stroke="#5c3a1e" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="132" y1="100" x2="150" y2="100" stroke="#5c3a1e" strokeWidth="2.5" strokeLinecap="round" />
                {/* Eye whites */}
                <ellipse cx="100" cy="114" rx="10" ry="11" fill="#fff" />
                <ellipse cx="140" cy="114" rx="10" ry="11" fill="#fff" />
                {/* Irises */}
                <circle cx={100 + pupilOffset.x} cy={114 + pupilOffset.y} r="6" fill="#5c3a1e" className="auth-char-pupil" />
                <circle cx={140 + pupilOffset.x} cy={114 + pupilOffset.y} r="6" fill="#5c3a1e" className="auth-char-pupil" />
                {/* Pupils */}
                <circle cx={100 + pupilOffset.x} cy={114 + pupilOffset.y} r="3" fill="#2F2219" className="auth-char-pupil" />
                <circle cx={140 + pupilOffset.x} cy={114 + pupilOffset.y} r="3" fill="#2F2219" className="auth-char-pupil" />
                {/* Eye shine */}
                <circle cx={97 + pupilOffset.x * 0.4} cy={111 + pupilOffset.y * 0.3} r="2" fill="#fff" />
                <circle cx={137 + pupilOffset.x * 0.4} cy={111 + pupilOffset.y * 0.3} r="2" fill="#fff" />
                {/* Mouth */}
                <path d="M112 134 Q120 140 128 134" stroke="#c47a5a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Nose */}
            <ellipse cx="120" cy="124" rx="3" ry="2.5" fill="#d4a574" />

            {/* Cheek blush */}
            <ellipse cx="84" cy="122" rx="9" ry="5" fill="#e8a08a" opacity={focusedField ? 0.45 : 0.2} className="auth-char-blush" />
            <ellipse cx="156" cy="122" rx="9" ry="5" fill="#e8a08a" opacity={focusedField ? 0.45 : 0.2} className="auth-char-blush" />

            {/* Ear left */}
            <ellipse cx="76" cy="112" rx="6" ry="8" fill="#e8c9a0" />
            <ellipse cx="76" cy="112" rx="3" ry="5" fill="#d4a574" />

            {/* Ear right */}
            <ellipse cx="164" cy="112" rx="6" ry="8" fill="#e8c9a0" />
            <ellipse cx="164" cy="112" rx="3" ry="5" fill="#d4a574" />
          </g>

        </g>
      </svg>

      {/* Floating sparkles */}
      <div className="auth-char-sparkles">
        <span className="auth-sparkle s1" />
        <span className="auth-sparkle s2" />
        <span className="auth-sparkle s3" />
        <span className="auth-sparkle s4" />
      </div>
    </div>
  );
}

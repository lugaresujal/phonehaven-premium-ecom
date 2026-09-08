export interface CharacterPose {
  headRotation: [number, number, number];
  bodyPosition: [number, number, number];
  leftArmRotation: [number, number, number];
  rightArmRotation: [number, number, number];
  leftEyePosition: [number, number];
  rightEyePosition: [number, number];
  eyeScale: number;
  mouthOpen: number;
  mouthSmile: number;
  eyebrowRaise: number;
  blinkAmount: number;
  bodyBreathe: number;
}

export const POSES: Record<string, CharacterPose> = {
  idle: {
    headRotation: [0, 0, 0],
    bodyPosition: [0, 0, 0],
    leftArmRotation: [0, 0, 0.1],
    rightArmRotation: [0, 0, -0.1],
    leftEyePosition: [0, 0],
    rightEyePosition: [0, 0],
    eyeScale: 1,
    mouthOpen: 0,
    mouthSmile: 0.3,
    eyebrowRaise: 0,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  emailFocus: {
    headRotation: [0, -0.15, 0.05],
    bodyPosition: [0, 0, 0],
    leftArmRotation: [0, 0, 0.1],
    rightArmRotation: [-0.2, 0, -0.15],
    leftEyePosition: [-0.15, 0],
    rightEyePosition: [-0.15, 0],
    eyeScale: 1,
    mouthOpen: 0,
    mouthSmile: 0.4,
    eyebrowRaise: 0.2,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  emailTyping: {
    headRotation: [0, -0.12, 0.04],
    bodyPosition: [0, 0, 0],
    leftArmRotation: [0, 0, 0.1],
    rightArmRotation: [-0.15, 0.1, -0.2],
    leftEyePosition: [-0.12, 0.05],
    rightEyePosition: [-0.12, 0.05],
    eyeScale: 1,
    mouthOpen: 0,
    mouthSmile: 0.5,
    eyebrowRaise: 0.1,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  passwordFocus: {
    headRotation: [0.08, 0, 0],
    bodyPosition: [0.05, 0, 0],
    leftArmRotation: [0, 0, 0.1],
    rightArmRotation: [-0.5, 0, -0.3],
    leftEyePosition: [0, 0.1],
    rightEyePosition: [0, 0.1],
    eyeScale: 1.05,
    mouthOpen: 0.05,
    mouthSmile: 0.2,
    eyebrowRaise: 0.3,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  passwordTyping: {
    headRotation: [0.06, 0, 0],
    bodyPosition: [0.03, 0, 0],
    leftArmRotation: [0, 0, 0.1],
    rightArmRotation: [-0.45, 0.1, -0.35],
    leftEyePosition: [0, 0.08],
    rightEyePosition: [0, 0.08],
    eyeScale: 1.02,
    mouthOpen: 0.02,
    mouthSmile: 0.35,
    eyebrowRaise: 0.2,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  passwordVisible: {
    headRotation: [0.12, 0, 0],
    bodyPosition: [0, 0, 0],
    leftArmRotation: [0, 0, 0.1],
    rightArmRotation: [-1.2, 0, -0.5],
    leftEyePosition: [0, 0],
    rightEyePosition: [0, 0],
    eyeScale: 1.25,
    mouthOpen: 0.15,
    mouthSmile: 0.6,
    eyebrowRaise: 0.6,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  passwordHidden: {
    headRotation: [0.05, 0, 0.08],
    bodyPosition: [0, 0, 0],
    leftArmRotation: [0, 0, 0.1],
    rightArmRotation: [-0.8, 0, -0.2],
    leftEyePosition: [0, 0],
    rightEyePosition: [0, 0],
    eyeScale: 0.3,
    mouthOpen: 0,
    mouthSmile: 0.7,
    eyebrowRaise: 0.1,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  submitting: {
    headRotation: [0, 0, 0],
    bodyPosition: [0, 0.05, 0],
    leftArmRotation: [0, 0, 0.3],
    rightArmRotation: [0, 0, -0.3],
    leftEyePosition: [0, 0],
    rightEyePosition: [0, 0],
    eyeScale: 1,
    mouthOpen: 0,
    mouthSmile: 0.3,
    eyebrowRaise: 0,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  success: {
    headRotation: [0.1, 0, 0],
    bodyPosition: [0, 0.1, 0],
    leftArmRotation: [-0.5, 0, 0.4],
    rightArmRotation: [-0.5, 0, -0.4],
    leftEyePosition: [0, 0],
    rightEyePosition: [0, 0],
    eyeScale: 0.5,
    mouthOpen: 0.2,
    mouthSmile: 1,
    eyebrowRaise: 0.5,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  error: {
    headRotation: [-0.1, 0, 0],
    bodyPosition: [0, -0.02, 0],
    leftArmRotation: [0, 0, 0.4],
    rightArmRotation: [0.2, 0, -0.3],
    leftEyePosition: [0, -0.05],
    rightEyePosition: [0, -0.05],
    eyeScale: 0.9,
    mouthOpen: 0.05,
    mouthSmile: -0.3,
    eyebrowRaise: -0.2,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
  switching: {
    headRotation: [0, 0.2, 0],
    bodyPosition: [0, 0.03, 0],
    leftArmRotation: [-0.3, 0, 0.6],
    rightArmRotation: [-0.3, 0, -0.6],
    leftEyePosition: [0, 0],
    rightEyePosition: [0, 0],
    eyeScale: 1,
    mouthOpen: 0.1,
    mouthSmile: 0.5,
    eyebrowRaise: 0.3,
    blinkAmount: 0,
    bodyBreathe: 0,
  },
};

export function lerpPose(
  a: CharacterPose,
  b: CharacterPose,
  t: number
): CharacterPose {
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const lerpArr = (x: number[], y: number[]) =>
    x.map((v, i) => lerp(v, y[i])) as [number, number] & [number, number, number];

  return {
    headRotation: lerpArr(a.headRotation, b.headRotation) as [number, number, number],
    bodyPosition: lerpArr(a.bodyPosition, b.bodyPosition) as [number, number, number],
    leftArmRotation: lerpArr(a.leftArmRotation, b.leftArmRotation) as [number, number, number],
    rightArmRotation: lerpArr(a.rightArmRotation, b.rightArmRotation) as [number, number, number],
    leftEyePosition: lerpArr(a.leftEyePosition, b.leftEyePosition) as [number, number],
    rightEyePosition: lerpArr(a.rightEyePosition, b.rightEyePosition) as [number, number],
    eyeScale: lerp(a.eyeScale, b.eyeScale),
    mouthOpen: lerp(a.mouthOpen, b.mouthOpen),
    mouthSmile: lerp(a.mouthSmile, b.mouthSmile),
    eyebrowRaise: lerp(a.eyebrowRaise, b.eyebrowRaise),
    blinkAmount: lerp(a.blinkAmount, b.blinkAmount),
    bodyBreathe: lerp(a.bodyBreathe, b.bodyBreathe),
  };
}

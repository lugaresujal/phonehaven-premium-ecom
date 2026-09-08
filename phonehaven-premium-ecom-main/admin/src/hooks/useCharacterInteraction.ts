import { useCallback, useRef, useState } from "react";

export type CharacterState =
  | "idle"
  | "emailFocus"
  | "emailTyping"
  | "passwordFocus"
  | "passwordTyping"
  | "passwordVisible"
  | "passwordHidden"
  | "submitting"
  | "success"
  | "error"
  | "switching";

interface UseCharacterInteractionReturn {
  characterState: CharacterState;
  focusedField: string | null;
  onFieldFocus: (fieldName: string) => void;
  onFieldBlur: () => void;
  onFieldType: (fieldName: string) => void;
  onPasswordToggle: (visible: boolean) => void;
  onSubmitting: (isSubmitting: boolean) => void;
  onSuccess: () => void;
  onError: () => void;
  onSwitch: () => void;
}

export function useCharacterInteraction(): UseCharacterInteractionReturn {
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (stateTimer.current) {
      clearTimeout(stateTimer.current);
      stateTimer.current = null;
    }
  }, []);

  const setStateWithTimeout = useCallback(
    (state: CharacterState, duration: number, fallback: CharacterState = "idle") => {
      clearTimer();
      setCharacterState(state);
      stateTimer.current = setTimeout(() => {
        setCharacterState(fallback);
        stateTimer.current = null;
      }, duration);
    },
    [clearTimer]
  );

  const onFieldFocus = useCallback(
    (fieldName: string) => {
      clearTimer();
      setFocusedField(fieldName);
      if (fieldName === "email" || fieldName === "name") {
        setCharacterState("emailFocus");
      } else if (
        fieldName === "password" ||
        fieldName === "newPassword" ||
        fieldName === "confirmPassword"
      ) {
        setCharacterState("passwordFocus");
      }
    },
    [clearTimer]
  );

  const onFieldBlur = useCallback(() => {
    clearTimer();
    setFocusedField(null);
    setCharacterState("idle");
  }, [clearTimer]);

  const onFieldType = useCallback(
    (fieldName: string) => {
      clearTimer();
      if (fieldName === "email" || fieldName === "name") {
        setCharacterState("emailTyping");
      } else if (
        fieldName === "password" ||
        fieldName === "newPassword" ||
        fieldName === "confirmPassword"
      ) {
        setCharacterState("passwordTyping");
      }
    },
    [clearTimer]
  );

  const onPasswordToggle = useCallback(
    (visible: boolean) => {
      if (visible) {
        setStateWithTimeout("passwordVisible", 2000, "passwordFocus");
      } else {
        setStateWithTimeout("passwordHidden", 1500, "passwordFocus");
      }
    },
    [setStateWithTimeout]
  );

  const onSubmitting = useCallback(
    (isSubmitting: boolean) => {
      if (isSubmitting) {
        clearTimer();
        setCharacterState("submitting");
      }
    },
    [clearTimer]
  );

  const onSuccess = useCallback(() => {
    setStateWithTimeout("success", 3000, "idle");
  }, [setStateWithTimeout]);

  const onError = useCallback(() => {
    setStateWithTimeout("error", 3000, "idle");
  }, [setStateWithTimeout]);

  const onSwitch = useCallback(() => {
    setStateWithTimeout("switching", 1500, "idle");
  }, [setStateWithTimeout]);

  return {
    characterState,
    focusedField,
    onFieldFocus,
    onFieldBlur,
    onFieldType,
    onPasswordToggle,
    onSubmitting,
    onSuccess,
    onError,
    onSwitch,
  };
}

"use client";
import type { AnimationState } from "@/lib/types";
interface Props {
  animationState: AnimationState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}
export default function Controls({
  animationState,
  onStart,
  onPause,
  onReset,
}: Props) {
  const playing = animationState === "playing";
  return (
    <div className="controls">
      <button
        id={playing ? "btn-pause" : "btn-start"}
        className="primary-button"
        onClick={playing ? onPause : onStart}
      >
        <span aria-hidden>{playing ? "Ⅱ" : "▶"}</span>
        {playing
          ? "Pause tracking"
          : animationState === "paused"
            ? "Resume tracking"
            : animationState === "completed"
              ? "Replay route"
              : "Start tracking"}
      </button>
      <button
        id="btn-reset"
        className="reset-button"
        onClick={onReset}
        disabled={animationState === "idle"}
      >
        <span aria-hidden>↺</span> Reset
      </button>
    </div>
  );
}

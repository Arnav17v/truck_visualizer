import { createTimeline } from "animejs";
import type { Timeline } from "animejs";
import { SEGMENT_DURATION_MS, TOTAL_DURATION_MS } from "./routeData";

export type { Timeline };
export { TOTAL_DURATION_MS };

export const progressProxy = { value: 0 };

export function createRouteTimeline(
  onProgress: (progress: number) => void,
  onComplete: () => void,
): Timeline {
  progressProxy.value = 0;

  const tl = createTimeline({
    autoplay: false,
    defaults: {
      ease: "inOutQuad",
    },
    onUpdate() {
      onProgress(progressProxy.value);
    },
    onComplete() {
      onComplete();
    },
  });

  const segDur = SEGMENT_DURATION_MS;

  tl.add(
    progressProxy,
    { value: [0, 1 / 3], duration: segDur, ease: "inOutQuad" },
    0,
  );

  tl.add(
    progressProxy,
    { value: [1 / 3, 2 / 3], duration: segDur, ease: "inOutQuad" },
    segDur,
  );

  tl.add(
    progressProxy,
    { value: [2 / 3, 1], duration: segDur, ease: "inOutQuad" },
    segDur * 2,
  );

  return tl;
}

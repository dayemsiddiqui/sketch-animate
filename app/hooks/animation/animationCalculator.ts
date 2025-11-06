import type { AnimateOptions } from "~/lib/Animate";
import { toAnimateOptions } from "./converters";

export interface AnimationTransform {
  opacity: number;
  offsetX: number;
  offsetY: number;
  shouldSkip: boolean; // true if animation is complete and shape should not be drawn
}

/**
 * Calculates the transformation for an entering shape
 */
function calculateEntranceAnimation(
  elapsed: number,
  animateIn: AnimateOptions | undefined
): { opacity: number; offsetX: number; offsetY: number } {
  let opacity = 1;
  let offsetX = 0;
  let offsetY = 0;

  const animateInOpts = toAnimateOptions(animateIn);
  if (!animateInOpts) return { opacity, offsetX, offsetY };

  animateInOpts.effects.forEach((effect) => {
    const progress = Math.min(elapsed / effect.duration, 1);

    if (effect.type === "fade") {
      opacity *= progress;
    } else if (effect.type === "slide") {
      const slideProgress = 1 - progress; // Start far, move to 0

      // Handle Position-based offset (new pattern)
      if (effect.offset) {
        offsetX += effect.offset.x * slideProgress;
        offsetY += effect.offset.y * slideProgress;
      }
      // Handle direction+distance (old pattern)
      else if (effect.direction && effect.distance) {
        switch (effect.direction) {
          case "left":
            offsetX -= effect.distance * slideProgress;
            break;
          case "right":
            offsetX += effect.distance * slideProgress;
            break;
          case "top":
            offsetY -= effect.distance * slideProgress;
            break;
          case "bottom":
            offsetY += effect.distance * slideProgress;
            break;
        }
      }
    }
  });

  return { opacity, offsetX, offsetY };
}

/**
 * Calculates the transformation for an exiting shape
 */
function calculateExitAnimation(
  elapsed: number,
  animateOut: AnimateOptions | undefined
): { opacity: number; offsetX: number; offsetY: number; shouldSkip: boolean } {
  let opacity = 1;
  let offsetX = 0;
  let offsetY = 0;

  const animateOutOpts = toAnimateOptions(animateOut);
  if (!animateOutOpts) return { opacity, offsetX, offsetY, shouldSkip: false };

  // Check if exit animation has completed - if so, skip drawing entirely
  const maxDuration = Math.max(...animateOutOpts.effects.map((e) => e.duration));
  if (elapsed >= maxDuration) {
    return { opacity: 0, offsetX: 0, offsetY: 0, shouldSkip: true };
  }

  animateOutOpts.effects.forEach((effect) => {
    const progress = Math.min(elapsed / effect.duration, 1);

    if (effect.type === "fade") {
      opacity *= 1 - progress; // Fade out
    } else if (effect.type === "slide") {
      // Handle Position-based offset (new pattern)
      if (effect.offset) {
        offsetX += effect.offset.x * progress;
        offsetY += effect.offset.y * progress;
      }
      // Handle direction+distance (old pattern)
      else if (effect.direction && effect.distance) {
        // Slide out (move away)
        switch (effect.direction) {
          case "left":
            offsetX -= effect.distance * progress;
            break;
          case "right":
            offsetX += effect.distance * progress;
            break;
          case "top":
            offsetY -= effect.distance * progress;
            break;
          case "bottom":
            offsetY += effect.distance * progress;
            break;
        }
      }
    }
  });

  return { opacity, offsetX, offsetY, shouldSkip: false };
}

/**
 * Calculates the complete animation transform for a shape
 */
export function calculateShapeTransform(
  shape: {
    state: "entering" | "visible" | "exiting";
    addedAt: number;
    removedAt?: number;
    animateIn?: AnimateOptions;
    animateOut?: AnimateOptions;
  },
  currentTime: number,
  removingInfo?: { removedAt: number; animateOut?: AnimateOptions }
): AnimationTransform {
  // Check if shape is being removed (from ref - immediate check)
  if (removingInfo) {
    const elapsed = currentTime - removingInfo.removedAt;
    const { opacity, offsetX, offsetY, shouldSkip } = calculateExitAnimation(
      elapsed,
      removingInfo.animateOut
    );
    return { opacity, offsetX, offsetY, shouldSkip };
  }

  // Handle entrance animation
  if (shape.state === "entering" && shape.animateIn) {
    const elapsed = currentTime - shape.addedAt;
    const { opacity, offsetX, offsetY } = calculateEntranceAnimation(elapsed, shape.animateIn);
    return { opacity, offsetX, offsetY, shouldSkip: false };
  }

  // Handle exit animation (from state)
  if (shape.state === "exiting" && shape.removedAt && shape.animateOut) {
    const elapsed = currentTime - shape.removedAt;
    const { opacity, offsetX, offsetY, shouldSkip } = calculateExitAnimation(
      elapsed,
      shape.animateOut
    );
    return { opacity, offsetX, offsetY, shouldSkip };
  }

  // No animation - fully visible
  return { opacity: 1, offsetX: 0, offsetY: 0, shouldSkip: false };
}

/**
 * Checks if an entrance animation is complete
 */
export function isEntranceAnimationComplete(
  elapsed: number,
  animateIn: AnimateOptions | undefined
): boolean {
  const animateInOpts = toAnimateOptions(animateIn);
  if (!animateInOpts) return true;

  const maxDuration = Math.max(...animateInOpts.effects.map((e) => e.duration));
  return elapsed >= maxDuration;
}

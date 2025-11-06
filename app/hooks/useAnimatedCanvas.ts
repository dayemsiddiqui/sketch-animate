import { useRef, useEffect, useCallback } from "react";
import type { Timeline } from "~/lib/Timeline";
import type { CanvasDimension } from "~/lib/CanvasDimensions";
import { useAnimationTimeline } from "./useAnimationTimeline";

type DrawFunction = (canvas: HTMLCanvasElement) => void;

interface UseAnimatedCanvasOptions {
  /**
   * Timeline instance with scenes to animate
   */
  timeline: Timeline;

  /**
   * Canvas dimensions (width and height)
   * Can use CanvasDimensions presets or custom dimensions
   */
  dimensions?: CanvasDimension;

  /**
   * Whether to scale canvas to fit viewport without scrolling
   * Default is false
   */
  fitViewport?: boolean;

  /**
   * Frames per second for the animation.
   * Default is 12 FPS to match traditional hand-drawn animation feel.
   */
  fps?: number;
}

export interface AnimatedCanvasRef {
  current: HTMLCanvasElement | null;
  dimensions?: CanvasDimension;
  fitViewport: boolean;
}

/**
 * Custom hook for creating animated canvas elements with timeline-based animations.
 * Perfect for creating hand-drawn wiggle animations with Rough.js where each
 * frame is slightly different due to natural randomness.
 *
 * The animation runs at a specified FPS (default 12) to mimic traditional
 * hand-drawn animation timing, where animators draw "on twos" (12 FPS).
 *
 * @param options - Configuration object with timeline, dimensions, and viewport settings
 * @returns canvasRef - Extended ref with metadata for the AnimatedCanvas component
 *
 * @example
 * ```tsx
 * import { CanvasDimensions } from "~/lib/CanvasDimensions";
 * import { Timeline } from "~/lib/Timeline";
 *
 * const timeline = new Timeline()
 *   .addScene("intro", 3000, async (api) => {
 *     const rect = api.rect(100, 100, 200, 150);
 *   })
 *   .loop(true);
 *
 * const canvasRef = useAnimatedCanvas({
 *   timeline,
 *   dimensions: CanvasDimensions.instagramReel,
 *   fitViewport: true,
 *   fps: 12
 * });
 *
 * return <AnimatedCanvas ref={canvasRef} className="..." />;
 * ```
 */
export function useAnimatedCanvas(
  options: UseAnimatedCanvasOptions
): AnimatedCanvasRef {
  const { timeline, dimensions, fitViewport = false, fps = 12 } = options;

  // Get draw function from timeline
  const draw = useAnimationTimeline(timeline);

  // Internal canvas ref for animation loop
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);

  // Create extended ref object with metadata (stable across renders)
  const extendedRef = useRef<AnimatedCanvasRef>({
    get current() {
      return internalCanvasRef.current;
    },
    set current(value) {
      internalCanvasRef.current = value;
    },
    dimensions,
    fitViewport,
  } as AnimatedCanvasRef);

  // Update metadata on options change
  extendedRef.current.dimensions = dimensions;
  extendedRef.current.fitViewport = fitViewport;

  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(0);

  const animate = useCallback(
    (currentTime: number) => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate time since last frame
      const elapsed = currentTime - lastFrameTimeRef.current;
      const frameInterval = 1000 / fps; // Convert FPS to milliseconds

      // Only draw if enough time has passed
      if (elapsed >= frameInterval) {
        // Clear the canvas before each frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the new frame
        draw(canvas);

        // Update last frame time, accounting for any overflow
        lastFrameTimeRef.current = currentTime - (elapsed % frameInterval);
      }

      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(animate);
    },
    [draw, fps]
  );

  useEffect(() => {
    // Start the animation loop with initial timestamp
    animationFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup: cancel animation frame on unmount
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [animate]);

  // Return extended ref with metadata for AnimatedCanvas component
  return extendedRef.current;
}

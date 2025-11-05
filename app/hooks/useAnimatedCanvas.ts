import { useRef, useEffect, useCallback } from "react";

type DrawFunction = (canvas: HTMLCanvasElement) => void;

interface UseAnimatedCanvasOptions {
  /**
   * Frames per second for the animation.
   * Default is 12 FPS to match traditional hand-drawn animation feel.
   */
  fps?: number;
}

/**
 * Custom hook for creating animated canvas elements with continuous redraws.
 * Perfect for creating hand-drawn wiggle animations with Rough.js where each
 * frame is slightly different due to natural randomness.
 *
 * The animation runs at a specified FPS (default 12) to mimic traditional
 * hand-drawn animation timing, where animators draw "on twos" (12 FPS).
 *
 * @param draw - Callback function that receives the canvas element for drawing
 * @param options - Configuration options including FPS
 * @returns canvasRef - Ref to attach to the canvas element
 *
 * @example
 * ```tsx
 * // Default 12 FPS (hand-drawn animation feel)
 * const canvasRef = useAnimatedCanvas((canvas) => {
 *   const rc = rough.canvas(canvas);
 *   rc.rectangle(150, 150, 100, 100);
 * });
 *
 * // Custom FPS
 * const canvasRef = useAnimatedCanvas((canvas) => {
 *   const rc = rough.canvas(canvas);
 *   rc.rectangle(150, 150, 100, 100);
 * }, { fps: 24 });
 *
 * return <canvas ref={canvasRef} width={400} height={400} />;
 * ```
 */
export function useAnimatedCanvas(
  draw: DrawFunction,
  options: UseAnimatedCanvasOptions = {}
) {
  const { fps = 12 } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(0);

  const animate = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current;
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

  return canvasRef;
}

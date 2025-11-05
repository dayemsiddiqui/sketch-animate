import { useRef, useEffect } from "react";

type DrawFunction = (canvas: HTMLCanvasElement) => void;

/**
 * Custom hook for managing canvas elements in React.
 * Provides a cleaner pattern than using useRef + useEffect directly.
 *
 * @param draw - Callback function that receives the canvas element for drawing
 * @returns canvasRef - Ref to attach to the canvas element
 *
 * @example
 * ```tsx
 * const canvasRef = useCanvas((canvas) => {
 *   const ctx = canvas.getContext('2d');
 *   ctx.fillRect(0, 0, 100, 100);
 * });
 *
 * return <canvas ref={canvasRef} width={400} height={400} />;
 * ```
 */
export function useCanvas(draw: DrawFunction) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      draw(canvas);
    }
  }, [draw]);

  return canvasRef;
}

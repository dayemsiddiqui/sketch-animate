import type { AnimatedCanvasRef } from "~/hooks/useAnimatedCanvas";
import type { CSSProperties } from "react";

interface AnimatedCanvasProps {
  /**
   * Extended ref from useAnimatedCanvas hook containing canvas element and metadata
   */
  ref: AnimatedCanvasRef;

  /**
   * Additional CSS class names to apply to the canvas element
   */
  className?: string;

  /**
   * Inline styles to apply to the canvas element
   */
  style?: CSSProperties;

  /**
   * ARIA label for accessibility
   */
  "aria-label"?: string;
}

/**
 * Canvas component that renders with dimensions and viewport-fit settings
 * from the useAnimatedCanvas hook.
 *
 * This component is designed to work seamlessly with useAnimatedCanvas,
 * automatically reading dimensions and applying viewport-fit scaling when enabled.
 *
 * @example
 * ```tsx
 * import { useAnimatedCanvas } from "~/hooks/useAnimatedCanvas";
 * import { AnimatedCanvas } from "~/components/AnimatedCanvas";
 * import { CanvasDimensions } from "~/lib/CanvasDimensions";
 * import { Timeline } from "~/lib/Timeline";
 *
 * function MyComponent() {
 *   const timeline = new Timeline()
 *     .addScene("intro", 3000, async (api) => {
 *       api.rect(100, 100, 200, 150);
 *     })
 *     .loop(true);
 *
 *   const canvasRef = useAnimatedCanvas({
 *     timeline,
 *     dimensions: CanvasDimensions.instagramReel,
 *     fitViewport: true
 *   });
 *
 *   return (
 *     <AnimatedCanvas
 *       ref={canvasRef}
 *       className="border border-gray-200 rounded-lg"
 *       aria-label="Animated sketch canvas"
 *     />
 *   );
 * }
 * ```
 */
export function AnimatedCanvas({
  ref: canvasRef,
  className = "",
  style,
  "aria-label": ariaLabel,
}: AnimatedCanvasProps) {
  // Extract dimensions and fitViewport from ref metadata
  const { dimensions, fitViewport } = canvasRef;

  // Build class names
  const classNames = [
    className,
    fitViewport ? "animated-canvas-fit-viewport" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <canvas
      ref={(el) => {
        canvasRef.current = el;
      }}
      width={dimensions?.width}
      height={dimensions?.height}
      className={classNames}
      style={style}
      aria-label={ariaLabel}
    />
  );
}

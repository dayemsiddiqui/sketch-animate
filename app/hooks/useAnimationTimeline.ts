import { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import type { Scene, Shape, SceneAPI } from "./types";

/**
 * Hook for managing an animation timeline with multiple scenes.
 * Each scene can use async/await to choreograph when shapes appear.
 *
 * @param scenes - Array of scenes to animate through
 * @param options - Configuration options
 * @returns Draw function to pass to useAnimatedCanvas
 *
 * @example
 * ```tsx
 * const scenes: Scene[] = [
 *   {
 *     name: "intro",
 *     duration: 3000,
 *     draw: async (api) => {
 *       api.addShape({ type: "rectangle", x: 150, y: 150, width: 100, height: 100 });
 *       await api.wait(1000);
 *       api.addShape({ type: "circle", x: 300, y: 150, radius: 50 });
 *     }
 *   }
 * ];
 *
 * const draw = useAnimationTimeline(scenes);
 * const canvasRef = useAnimatedCanvas(draw);
 * ```
 */
export function useAnimationTimeline(
  scenes: Scene[],
  options: { loop?: boolean } = {}
) {
  const { loop = true } = options;

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const sceneStartTimeRef = useRef<number>(Date.now());
  const sceneExecutedRef = useRef<boolean>(false);

  // Move to next scene
  const nextScene = useCallback(() => {
    const nextIndex = currentSceneIndex + 1;
    if (nextIndex < scenes.length) {
      setCurrentSceneIndex(nextIndex);
    } else if (loop) {
      setCurrentSceneIndex(0);
    }
    sceneStartTimeRef.current = Date.now();
    sceneExecutedRef.current = false;
    setShapes([]);
  }, [currentSceneIndex, scenes.length, loop]);

  // Execute current scene
  useEffect(() => {
    if (sceneExecutedRef.current) return;
    if (!scenes[currentSceneIndex]) return;

    sceneExecutedRef.current = true;
    const scene = scenes[currentSceneIndex];
    sceneStartTimeRef.current = Date.now();

    // Create the Scene API
    const api: SceneAPI = {
      addShape: (shape: Shape) => {
        setShapes((prev) => [...prev, shape]);
      },

      clearShapes: () => {
        setShapes([]);
      },

      wait: (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },

      getRoughCanvas: () => {
        throw new Error("getRoughCanvas can only be called during draw");
      },

      getCanvas: () => {
        throw new Error("getCanvas can only be called during draw");
      },
    };

    // Execute the scene's draw function
    scene.draw(api).catch((error) => {
      console.error(`Error in scene ${scene.name || currentSceneIndex}:`, error);
    });

    // Set up scene duration timer if specified
    if (scene.duration) {
      const timer = setTimeout(() => {
        nextScene();
      }, scene.duration);

      return () => clearTimeout(timer);
    }
  }, [currentSceneIndex, nextScene]);

  // Return draw function that renders all current shapes
  const draw = useCallback(
    (canvas: HTMLCanvasElement) => {
      const rc = rough.canvas(canvas);

      // Draw all shapes
      shapes.forEach((shape) => {
        switch (shape.type) {
          case "rectangle":
            if (shape.width !== undefined && shape.height !== undefined) {
              rc.rectangle(
                shape.x,
                shape.y,
                shape.width,
                shape.height,
                shape.options
              );
            }
            break;

          case "circle":
            if (shape.radius !== undefined) {
              rc.circle(shape.x, shape.y, shape.radius * 2, shape.options);
            }
            break;

          case "ellipse":
            if (shape.width !== undefined && shape.height !== undefined) {
              rc.ellipse(
                shape.x,
                shape.y,
                shape.width,
                shape.height,
                shape.options
              );
            }
            break;

          case "line":
            if (shape.width !== undefined && shape.height !== undefined) {
              rc.line(
                shape.x,
                shape.y,
                shape.x + shape.width,
                shape.y + shape.height,
                shape.options
              );
            }
            break;
        }
      });
    },
    [shapes]
  );

  return draw;
}

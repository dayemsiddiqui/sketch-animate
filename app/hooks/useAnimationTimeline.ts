import { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import type { Shape, SceneAPI } from "./types";
import type { Timeline } from "~/lib/Timeline";

/**
 * Hook for managing an animation timeline with multiple scenes.
 * Each scene can use async/await to choreograph when shapes appear.
 *
 * @param timeline - Timeline instance created with the Timeline class
 * @returns Draw function to pass to useAnimatedCanvas
 *
 * @example
 * ```tsx
 * const timeline = new Timeline()
 *   .addScene("intro", 3000, async (api) => {
 *     api.addShape({ type: "rectangle", x: 150, y: 150, width: 100, height: 100 });
 *     await api.wait(1000);
 *     api.addShape({ type: "circle", x: 300, y: 150, radius: 50 });
 *   })
 *   .loop(true);
 *
 * const draw = useAnimationTimeline(timeline);
 * const canvasRef = useAnimatedCanvas(draw);
 * ```
 */
export function useAnimationTimeline(timeline: Timeline) {
  const scenes = timeline.getScenes();
  const loop = timeline.getLoop();

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

      // Helper methods for common shapes
      rect: (x: number, y: number, width: number, height: number, options?) => {
        api.addShape({ type: "rectangle", x, y, width, height, options });
      },

      square: (x: number, y: number, size: number, options?) => {
        api.addShape({ type: "rectangle", x, y, width: size, height: size, options });
      },

      circle: (x: number, y: number, radius: number, options?) => {
        api.addShape({ type: "circle", x, y, radius, options });
      },

      ellipse: (x: number, y: number, width: number, height: number, options?) => {
        api.addShape({ type: "ellipse", x, y, width, height, options });
      },

      triangle: (x: number, y: number, size: number, options?) => {
        // Create an equilateral triangle
        const height = (Math.sqrt(3) / 2) * size;
        const points: [number, number][] = [
          [x + size / 2, y], // Top point
          [x + size, y + height], // Bottom right
          [x, y + height], // Bottom left
        ];
        api.addShape({ type: "polygon", x: 0, y: 0, points, options });
      },

      polygon: (points: [number, number][], options?) => {
        api.addShape({ type: "polygon", x: 0, y: 0, points, options });
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

          case "polygon":
            if (shape.points && shape.points.length > 0) {
              rc.polygon(shape.points, shape.options);
            }
            break;
        }
      });
    },
    [shapes]
  );

  return draw;
}

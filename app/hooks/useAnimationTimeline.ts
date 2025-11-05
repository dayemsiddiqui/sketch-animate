import { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import type { Shape, SceneAPI, ShapeDrawOptions, ShadowOptions, LabelOptions } from "./types";
import type { Timeline } from "~/lib/Timeline";
import { drawSketchyText } from "~/lib/SketchyText";
import {
  drawRectangleCastShadow,
  drawCircleCastShadow,
  drawPolygonCastShadow,
} from "~/lib/CastShadow";
import { Shadow } from "~/lib/Shadow";
import { Label } from "~/lib/Label";

/**
 * Convert shadow (class or object) to plain options object
 */
function toShadowOptions(shadow: ShadowOptions | Shadow | undefined): ShadowOptions | undefined {
  if (!shadow) return undefined;
  return shadow instanceof Shadow ? shadow.toOptions() : shadow;
}

/**
 * Convert label (class or object) to plain options object
 */
function toLabelOptions(label: LabelOptions | Label | undefined): LabelOptions | undefined {
  if (!label) return undefined;
  return label instanceof Label ? label.toOptions() : label;
}

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
      rect: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions) => {
        const { shadow, label, ...roughOptions } = options || {};
        api.addShape({
          type: "rectangle",
          x,
          y,
          width,
          height,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
        });
      },

      square: (x: number, y: number, size: number, options?: ShapeDrawOptions) => {
        const { shadow, label, ...roughOptions } = options || {};
        api.addShape({
          type: "rectangle",
          x,
          y,
          width: size,
          height: size,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
        });
      },

      circle: (x: number, y: number, radius: number, options?: ShapeDrawOptions) => {
        const { shadow, label, ...roughOptions } = options || {};
        api.addShape({
          type: "circle",
          x,
          y,
          radius,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
        });
      },

      ellipse: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions) => {
        const { shadow, label, ...roughOptions } = options || {};
        api.addShape({
          type: "ellipse",
          x,
          y,
          width,
          height,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
        });
      },

      triangle: (x: number, y: number, size: number, options?: ShapeDrawOptions) => {
        const { shadow, label, ...roughOptions } = options || {};
        // Create an equilateral triangle
        const height = (Math.sqrt(3) / 2) * size;
        const points: [number, number][] = [
          [x + size / 2, y], // Top point
          [x + size, y + height], // Bottom right
          [x, y + height], // Bottom left
        ];
        api.addShape({
          type: "polygon",
          x: 0,
          y: 0,
          points,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
        });
      },

      polygon: (points: [number, number][], options?: ShapeDrawOptions) => {
        const { shadow, label, ...roughOptions } = options || {};
        api.addShape({
          type: "polygon",
          x: 0,
          y: 0,
          points,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
        });
      },

      text: (text: string, x: number, y: number, options?) => {
        api.addShape({
          type: "text",
          x,
          y,
          text,
          fontSize: options?.fontSize,
          fontFamily: options?.fontFamily,
          color: options?.color,
          textAlign: options?.textAlign,
          textBaseline: options?.textBaseline,
          shadow: options?.shadow,
        });
      },

      sketchyText: (text: string, x: number, y: number, options?) => {
        api.addShape({
          type: "sketchyText",
          x,
          y,
          text,
          fontSize: options?.fontSize,
          fontFamily: options?.fontFamily,
          color: options?.color,
          textAlign: options?.textAlign,
          textBaseline: options?.textBaseline,
          jitter: options?.jitter,
          roughness: options?.roughness,
          shadow: options?.shadow,
        });
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
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw all shapes
      shapes.forEach((shape) => {
        const shadowType = shape.shadow?.type || "drop";
        const isCastShadow = shape.shadow && shadowType === "cast";

        // For cast shadows, draw the shadow geometry first
        if (isCastShadow && shape.shadow) {
          switch (shape.type) {
            case "rectangle":
              if (shape.width !== undefined && shape.height !== undefined) {
                drawRectangleCastShadow(
                  rc,
                  shape.x,
                  shape.y,
                  shape.width,
                  shape.height,
                  shape.shadow
                );
              }
              break;

            case "circle":
              if (shape.radius !== undefined) {
                drawCircleCastShadow(rc, shape.x, shape.y, shape.radius, shape.shadow);
              }
              break;

            case "ellipse":
              // Treat ellipse as circle for cast shadow (simplified)
              if (shape.width !== undefined && shape.height !== undefined) {
                const avgRadius = (shape.width + shape.height) / 4;
                drawCircleCastShadow(rc, shape.x, shape.y, avgRadius, shape.shadow);
              }
              break;

            case "polygon":
              if (shape.points && shape.points.length > 0) {
                drawPolygonCastShadow(rc, shape.points, shape.shadow);
              }
              break;
          }
        }

        // Apply drop shadow if specified (not cast)
        if (shape.shadow && !isCastShadow) {
          ctx.shadowColor = shape.shadow.color;
          ctx.shadowOffsetX = shape.shadow.offsetX;
          ctx.shadowOffsetY = shape.shadow.offsetY;
          ctx.shadowBlur = shape.shadow.blur || 0;
        }

        // Draw the main shape
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

          case "text":
            if (shape.text) {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                const fontSize = shape.fontSize || 24;
                const fontFamily = shape.fontFamily || "sans-serif";
                const color = shape.color || "#000000";

                ctx.font = `${fontSize}px ${fontFamily}`;
                ctx.fillStyle = color;
                ctx.textAlign = shape.textAlign || "left";
                ctx.textBaseline = shape.textBaseline || "alphabetic";

                ctx.fillText(shape.text, shape.x, shape.y);
              }
            }
            break;

          case "sketchyText":
            if (shape.text) {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                drawSketchyText(ctx, shape.text, shape.x, shape.y, {
                  fontSize: shape.fontSize,
                  fontFamily: shape.fontFamily,
                  color: shape.color,
                  textAlign: shape.textAlign,
                  textBaseline: shape.textBaseline,
                  jitter: shape.jitter,
                  roughness: shape.roughness,
                });
              }
            }
            break;
        }

        // Reset shadow after drawing each shape
        if (shape.shadow) {
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        }

        // Draw label if specified
        if (shape.label) {
          const label = shape.label;
          let labelX = shape.x;
          let labelY = shape.y;

          // Calculate center position based on shape type
          switch (shape.type) {
            case "rectangle":
              if (shape.width !== undefined && shape.height !== undefined) {
                labelX = shape.x + shape.width / 2;
                labelY = shape.y + shape.height / 2;

                // Apply vertical alignment
                if (label.align === "top") {
                  labelY = shape.y + (label.fontSize || 24) / 2 + 5;
                } else if (label.align === "bottom") {
                  labelY = shape.y + shape.height - (label.fontSize || 24) / 2 - 5;
                }
              }
              break;

            case "circle":
              if (shape.radius !== undefined) {
                labelX = shape.x;
                labelY = shape.y;
              }
              break;

            case "ellipse":
              labelX = shape.x;
              labelY = shape.y;
              break;

            case "polygon":
              // Calculate centroid of polygon
              if (shape.points && shape.points.length > 0) {
                let sumX = 0;
                let sumY = 0;
                shape.points.forEach(([x, y]) => {
                  sumX += x;
                  sumY += y;
                });
                labelX = sumX / shape.points.length;
                labelY = sumY / shape.points.length;
              }
              break;
          }

          // Apply custom offsets
          labelX += label.offsetX || 0;
          labelY += label.offsetY || 0;

          // Draw the label text
          if (label.sketchy) {
            drawSketchyText(ctx, label.text, labelX, labelY, {
              fontSize: label.fontSize,
              fontFamily: label.fontFamily,
              color: label.color,
              textAlign: "center",
              textBaseline: "middle",
              jitter: label.jitter,
              roughness: label.roughness,
            });
          } else {
            const fontSize = label.fontSize || 16;
            const fontFamily = label.fontFamily || "sans-serif";
            const color = label.color || "#000000";

            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label.text, labelX, labelY);
          }
        }
      });
    },
    [shapes]
  );

  return draw;
}

import { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import type { Shape, SceneAPI, ShapeDrawOptions, ShadowOptions, LabelOptions, ShapeHandle } from "./types";
import type { Timeline } from "~/lib/Timeline";
import { drawSketchyText } from "~/lib/SketchyText";
import {
  drawRectangleCastShadow,
  drawCircleCastShadow,
  drawPolygonCastShadow,
} from "~/lib/CastShadow";
import { Shadow } from "~/lib/Shadow";
import { Label } from "~/lib/Label";
import { Animate, type AnimateOptions } from "~/lib/Animate";

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
 * Convert animation (class or object) to plain options object
 */
function toAnimateOptions(animate: AnimateOptions | Animate | undefined): AnimateOptions | undefined {
  if (!animate) return undefined;
  return animate instanceof Animate ? animate.toOptions() : animate;
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
  const shapeIdCounterRef = useRef<number>(0);

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
    shapeIdCounterRef.current = 0; // Reset shape ID counter for new scene
    setShapes([]);
  }, [currentSceneIndex, scenes.length, loop]);

  // Helper to create ShapeHandle for a shape
  const createShapeHandle = useCallback((shapeId: string): ShapeHandle => {
    return {
      remove: async (animation?: AnimateOptions | Animate) => {
        const animateOpts = toAnimateOptions(animation);

        // Mark shape as exiting and set removedAt timestamp
        setShapes((prev) =>
          prev.map((s) =>
            s.id === shapeId
              ? {
                  ...s,
                  state: "exiting" as const,
                  removedAt: Date.now(),
                  animateOut: animateOpts || s.animateOut,
                }
              : s
          )
        );

        // Calculate max animation duration
        const shape = shapes.find((s) => s.id === shapeId);
        const exitAnim = animateOpts || toAnimateOptions(shape?.animateOut);
        const maxDuration = exitAnim
          ? Math.max(...exitAnim.effects.map((e) => e.duration))
          : 0;

        // Wait for animation to complete
        if (maxDuration > 0) {
          await new Promise((resolve) => setTimeout(resolve, maxDuration));
        }

        // Remove shape from array
        setShapes((prev) => prev.filter((s) => s.id !== shapeId));
      },
    };
  }, [shapes]);

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
        // Generate unique ID and add lifecycle metadata
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const shapeWithMeta: Shape = {
          ...shape,
          id,
          state: shape.animateIn ? "entering" : "visible",
          addedAt: now,
        };
        setShapes((prev) => [...prev, shapeWithMeta]);
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
      rect: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions): ShapeHandle => {
        const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(animateIn);
        api.addShape({
          type: "rectangle",
          x,
          y,
          width,
          height,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
      },

      square: (x: number, y: number, size: number, options?: ShapeDrawOptions): ShapeHandle => {
        const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(animateIn);
        api.addShape({
          type: "rectangle",
          x,
          y,
          width: size,
          height: size,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
      },

      circle: (x: number, y: number, radius: number, options?: ShapeDrawOptions): ShapeHandle => {
        const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(animateIn);
        api.addShape({
          type: "circle",
          x,
          y,
          radius,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
      },

      ellipse: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions): ShapeHandle => {
        const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(animateIn);
        api.addShape({
          type: "ellipse",
          x,
          y,
          width,
          height,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
      },

      triangle: (x: number, y: number, size: number, options?: ShapeDrawOptions): ShapeHandle => {
        const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(animateIn);
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
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
      },

      polygon: (points: [number, number][], options?: ShapeDrawOptions): ShapeHandle => {
        const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(animateIn);
        api.addShape({
          type: "polygon",
          x: 0,
          y: 0,
          points,
          options: roughOptions,
          shadow: toShadowOptions(shadow),
          label: toLabelOptions(label),
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
      },

      text: (text: string, x: number, y: number, options?): ShapeHandle => {
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(options?.animateIn);
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
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(options?.animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
      },

      sketchyText: (text: string, x: number, y: number, options?): ShapeHandle => {
        const id = `shape-${++shapeIdCounterRef.current}`;
        const now = Date.now();
        const animateInOpts = toAnimateOptions(options?.animateIn);
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
          animateIn: animateInOpts,
          animateOut: toAnimateOptions(options?.animateOut),
          id,
          state: animateInOpts ? "entering" : "visible",
          addedAt: now,
        });
        return createShapeHandle(id);
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

      const currentTime = Date.now();

      // Draw all shapes
      shapes.forEach((shape) => {
        // Calculate animation progress
        let opacity = 1;
        let offsetX = 0;
        let offsetY = 0;

        if (shape.state === "entering" && shape.animateIn) {
          const elapsed = currentTime - shape.addedAt;
          const animateInOpts = toAnimateOptions(shape.animateIn);

          if (animateInOpts) {
            animateInOpts.effects.forEach((effect) => {
              const progress = Math.min(elapsed / effect.duration, 1);

              if (effect.type === "fade") {
                opacity *= progress;
              } else if (effect.type === "slide" && effect.direction && effect.distance) {
                const slideProgress = 1 - progress; // Start far, move to 0
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
            });

            // Check if all entrance animations are complete
            const maxDuration = Math.max(...animateInOpts.effects.map((e) => e.duration));
            if (elapsed >= maxDuration) {
              // Update state to visible (will happen on next render)
              setShapes((prev) =>
                prev.map((s) => (s.id === shape.id ? { ...s, state: "visible" as const } : s))
              );
            }
          }
        } else if (shape.state === "exiting" && shape.removedAt && shape.animateOut) {
          const elapsed = currentTime - shape.removedAt;
          const animateOutOpts = toAnimateOptions(shape.animateOut);

          if (animateOutOpts) {
            animateOutOpts.effects.forEach((effect) => {
              const progress = Math.min(elapsed / effect.duration, 1);

              if (effect.type === "fade") {
                opacity *= 1 - progress; // Fade out
              } else if (effect.type === "slide" && effect.direction && effect.distance) {
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
            });
          }
        }

        // Save canvas state before applying transformations
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(offsetX, offsetY);

        // Convert shadow class to options if needed
        const shadowOpts = toShadowOptions(shape.shadow);
        const shadowType = shadowOpts?.type || "drop";
        const isCastShadow = shadowOpts && shadowType === "cast";

        // For cast shadows, draw the shadow geometry first
        if (isCastShadow && shadowOpts) {
          switch (shape.type) {
            case "rectangle":
              if (shape.width !== undefined && shape.height !== undefined) {
                drawRectangleCastShadow(
                  rc,
                  shape.x,
                  shape.y,
                  shape.width,
                  shape.height,
                  shadowOpts
                );
              }
              break;

            case "circle":
              if (shape.radius !== undefined) {
                drawCircleCastShadow(rc, shape.x, shape.y, shape.radius, shadowOpts);
              }
              break;

            case "ellipse":
              // Treat ellipse as circle for cast shadow (simplified)
              if (shape.width !== undefined && shape.height !== undefined) {
                const avgRadius = (shape.width + shape.height) / 4;
                drawCircleCastShadow(rc, shape.x, shape.y, avgRadius, shadowOpts);
              }
              break;

            case "polygon":
              if (shape.points && shape.points.length > 0) {
                drawPolygonCastShadow(rc, shape.points, shadowOpts);
              }
              break;
          }
        }

        // Apply drop shadow if specified (not cast)
        if (shadowOpts && !isCastShadow) {
          ctx.shadowColor = shadowOpts.color;
          ctx.shadowOffsetX = shadowOpts.offsetX;
          ctx.shadowOffsetY = shadowOpts.offsetY;
          ctx.shadowBlur = shadowOpts.blur || 0;
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
        if (shadowOpts) {
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        }

        // Draw label if specified
        const labelOpts = toLabelOptions(shape.label);
        if (labelOpts) {
          let labelX = shape.x;
          let labelY = shape.y;

          // Calculate center position based on shape type
          switch (shape.type) {
            case "rectangle":
              if (shape.width !== undefined && shape.height !== undefined) {
                labelX = shape.x + shape.width / 2;
                labelY = shape.y + shape.height / 2;

                // Apply vertical alignment
                if (labelOpts.align === "top") {
                  labelY = shape.y + (labelOpts.fontSize || 24) / 2 + 5;
                } else if (labelOpts.align === "bottom") {
                  labelY = shape.y + shape.height - (labelOpts.fontSize || 24) / 2 - 5;
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
          labelX += labelOpts.offsetX || 0;
          labelY += labelOpts.offsetY || 0;

          // Draw the label text
          if (labelOpts.sketchy) {
            drawSketchyText(ctx, labelOpts.text, labelX, labelY, {
              fontSize: labelOpts.fontSize,
              fontFamily: labelOpts.fontFamily,
              color: labelOpts.color,
              textAlign: "center",
              textBaseline: "middle",
              jitter: labelOpts.jitter,
              roughness: labelOpts.roughness,
            });
          } else {
            const fontSize = labelOpts.fontSize || 16;
            const fontFamily = labelOpts.fontFamily || "sans-serif";
            const color = labelOpts.color || "#000000";

            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(labelOpts.text, labelX, labelY);
          }
        }

        // Restore canvas state after drawing shape
        ctx.restore();
      });
    },
    [shapes]
  );

  return draw;
}

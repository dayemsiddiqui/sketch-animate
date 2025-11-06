import { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import type { Shape, SceneAPI, ShapeHandle } from "./types";
import type { Timeline } from "~/lib/Timeline";
import { Animate, type AnimateOptions } from "~/lib/Animate";
import { toAnimateOptions } from "./animation/converters";
import { createShapeFactoryMethods } from "./animation/shapeFactory";
import { calculateShapeTransform, isEntranceAnimationComplete } from "./animation/animationCalculator";
import { renderShadow, clearShadow } from "./animation/renderers/shadowRenderer";
import { renderShape } from "./animation/renderers/shapeRenderer";
import { renderLabel } from "./animation/renderers/labelRenderer";
import { Canvas } from "~/lib/Canvas";
import { Position } from "~/lib/Position";
import { Duration } from "~/lib/Duration";

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
  const shapesRef = useRef<Shape[]>([]); // Keep ref in sync with state for draw function
  const sceneStartTimeRef = useRef<number>(Date.now());
  const sceneExecutedRef = useRef<boolean>(false);
  const shapeIdCounterRef = useRef<number>(0);
  // Store shape metadata to avoid stale closures in remove() and for getPosition()
  const shapeMetadataRef = useRef<Map<string, { animateOut?: AnimateOptions | undefined; x: number; y: number }>>(new Map());
  // Track shapes being removed with their removal timestamp (for immediate render updates)
  const removingShapesRef = useRef<Map<string, { removedAt: number; animateOut?: AnimateOptions | undefined }>>(new Map());

  // Keep ref in sync with state
  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

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
    shapeMetadataRef.current.clear(); // Clear metadata for new scene
    removingShapesRef.current.clear(); // Clear removing shapes for new scene
    setShapes([]);
  }, [currentSceneIndex, scenes.length, loop]);

  // Helper to create ShapeHandle for a shape
  const createShapeHandle = useCallback((shapeId: string): ShapeHandle => {
    return {
      getPosition: () => {
        const metadata = shapeMetadataRef.current.get(shapeId);
        if (!metadata) {
          // Fallback: try to find shape in current state
          const shape = shapesRef.current.find((s) => s.id === shapeId);
          if (shape) {
            return Position.at(shape.x, shape.y);
          }
          return Position.zero();
        }
        return Position.at(metadata.x, metadata.y);
      },
      remove: async (animation?: AnimateOptions | Animate) => {
        const animateOpts = toAnimateOptions(animation);
        const now = Date.now();

        // IMMEDIATELY track in ref for render function (no React state delay)
        const metadata = shapeMetadataRef.current.get(shapeId);
        const exitAnim = animateOpts || metadata?.animateOut;
        removingShapesRef.current.set(shapeId, {
          removedAt: now,
          animateOut: exitAnim,
        });

        // Mark shape as exiting and set removedAt timestamp in state
        setShapes((prev) =>
          prev.map((s) =>
            s.id === shapeId
              ? {
                  ...s,
                  state: "exiting" as const,
                  removedAt: now,
                  animateOut: animateOpts || s.animateOut,
                }
              : s
          )
        );

        // Calculate max animation duration from metadata ref (avoids stale closure)
        const maxDuration = exitAnim
          ? Math.max(...exitAnim.effects.map((e) => e.duration))
          : 0;

        // Wait for animation to complete
        if (maxDuration > 0) {
          await new Promise((resolve) => setTimeout(resolve, maxDuration));
        }

        // Remove shape from array and cleanup metadata
        setShapes((prev) => prev.filter((s) => s.id !== shapeId));
        shapeMetadataRef.current.delete(shapeId);
        removingShapesRef.current.delete(shapeId);

        // Give React time to process the state update before resolving
        await new Promise((resolve) => setTimeout(resolve, 50));
      },
    };
  }, []);

  // Execute current scene
  useEffect(() => {
    if (sceneExecutedRef.current) return;
    if (!scenes[currentSceneIndex]) return;

    sceneExecutedRef.current = true;
    const scene = scenes[currentSceneIndex];
    sceneStartTimeRef.current = Date.now();

    // Get dimensions from timeline for canvas helpers
    const dimensions = timeline.getDimensions();
    const canvasHelper = dimensions
      ? Canvas.create(dimensions)
      : Canvas.create({ width: 1080, height: 1920 }); // Default to instagramReel dimensions

    // Create the Scene API - start with base methods
    const baseApi = {
      canvas: canvasHelper,

      addShape: (shape: Shape) => {
        // Preserve provided id (from factory) to keep handles/metadata in sync.
        // Only generate a new id if one was not provided.
        let id = shape.id;
        if (!id) {
          id = `shape-${++shapeIdCounterRef.current}`;
        } else {
          // Update counter if the provided ID is higher to prevent collisions
          const numericId = Number(id.replace("shape-", ""));
          if (!Number.isNaN(numericId) && numericId > shapeIdCounterRef.current) {
            shapeIdCounterRef.current = numericId;
          }
        }

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

      wait: (duration: Duration): Promise<void> => {
        return new Promise<void>((resolve) => setTimeout(resolve, duration.ms));
      },

      getRoughCanvas: () => {
        throw new Error("getRoughCanvas can only be called during draw");
      },

      getCanvas: () => {
        throw new Error("getCanvas can only be called during draw");
      },
    };

    // Add shape factory methods using extracted module
    const api: SceneAPI = {
      ...baseApi,
      ...createShapeFactoryMethods(baseApi, shapeIdCounterRef, shapeMetadataRef, createShapeHandle),
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

      // Draw all shapes - use ref to avoid stale closure
      shapesRef.current.forEach((shape) => {
        // Calculate animation transform using extracted calculator
        const removingInfo = removingShapesRef.current.get(shape.id);

        // Convert shape animations to plain options for calculator
        const shapeForCalc = {
          state: shape.state,
          addedAt: shape.addedAt,
          removedAt: shape.removedAt,
          animateIn: toAnimateOptions(shape.animateIn),
          animateOut: toAnimateOptions(shape.animateOut),
        };

        const transform = calculateShapeTransform(shapeForCalc, currentTime, removingInfo);

        // Skip drawing if animation is complete
        if (transform.shouldSkip) {
          return;
        }

        // Check if entrance animation is complete and update state
        if (shape.state === "entering" && shape.animateIn) {
          const elapsed = currentTime - shape.addedAt;
          if (isEntranceAnimationComplete(elapsed, toAnimateOptions(shape.animateIn))) {
            // Use functional update to ensure we're working with the latest state
            setShapes((prev) =>
              prev.map((s) => (s.id === shape.id ? { ...s, state: "visible" as const } : s))
            );
          }
        }

        // Save canvas state before applying transformations
        ctx.save();
        ctx.globalAlpha = transform.opacity;
        ctx.translate(transform.offsetX, transform.offsetY);

        // Render shadow using extracted renderer
        const { shadowOpts } = renderShadow(shape, ctx, rc);

        // Render main shape using extracted renderer
        renderShape(shape, ctx, rc, canvas);

        // Clear shadow after drawing shape
        if (shadowOpts) {
          clearShadow(ctx);
        }

        // Render label using extracted renderer
        renderLabel(shape, ctx);

        // Restore canvas state after drawing shape
        ctx.restore();
      });
    },
    [] // Empty deps - use shapesRef to avoid stale closures
  );

  return draw;
}

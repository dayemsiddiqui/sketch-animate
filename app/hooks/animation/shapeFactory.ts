import type { Shape, SceneAPI, ShapeDrawOptions, ShapeHandle } from "../types";
import type { AnimateOptions } from "~/lib/Animate";
import { toShadowOptions, toLabelOptions, toAnimateOptions } from "./converters";
import type { MutableRefObject } from "react";

/**
 * Helper function to build a shape with metadata
 * Reduces duplication across all shape creation methods
 */
function buildShapeWithMetadata(
  shapeData: Partial<Shape>,
  options: ShapeDrawOptions | undefined,
  shapeIdCounterRef: MutableRefObject<number>,
  shapeMetadataRef: MutableRefObject<Map<string, { animateOut?: AnimateOptions }>>,
  addShape: (shape: Shape) => void,
  createShapeHandle: (id: string) => ShapeHandle
): ShapeHandle {
  const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
  const id = `shape-${++shapeIdCounterRef.current}`;
  const now = Date.now();
  const animateInOpts = toAnimateOptions(animateIn);
  const animateOutOpts = toAnimateOptions(animateOut);

  // Store metadata for remove() to avoid stale closure
  shapeMetadataRef.current.set(id, { animateOut: animateOutOpts });

  addShape({
    ...shapeData,
    options: roughOptions,
    shadow: toShadowOptions(shadow),
    label: toLabelOptions(label),
    animateIn: animateInOpts,
    animateOut: animateOutOpts,
    id,
    state: animateInOpts ? "entering" : "visible",
    addedAt: now,
  } as Shape);

  return createShapeHandle(id);
}

/**
 * Creates all shape factory methods for the Scene API
 */
export function createShapeFactoryMethods(
  api: Pick<SceneAPI, 'addShape'>,
  shapeIdCounterRef: MutableRefObject<number>,
  shapeMetadataRef: MutableRefObject<Map<string, { animateOut?: AnimateOptions }>>,
  createShapeHandle: (id: string) => ShapeHandle
) {
  return {
    rect: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions): ShapeHandle => {
      return buildShapeWithMetadata(
        { type: "rectangle", x, y, width, height },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    square: (x: number, y: number, size: number, options?: ShapeDrawOptions): ShapeHandle => {
      return buildShapeWithMetadata(
        { type: "rectangle", x, y, width: size, height: size },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    circle: (x: number, y: number, radius: number, options?: ShapeDrawOptions): ShapeHandle => {
      return buildShapeWithMetadata(
        { type: "circle", x, y, radius },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    ellipse: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions): ShapeHandle => {
      return buildShapeWithMetadata(
        { type: "ellipse", x, y, width, height },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    triangle: (x: number, y: number, size: number, options?: ShapeDrawOptions): ShapeHandle => {
      // Create an equilateral triangle
      const height = (Math.sqrt(3) / 2) * size;
      const points: [number, number][] = [
        [x + size / 2, y], // Top point
        [x + size, y + height], // Bottom right
        [x, y + height], // Bottom left
      ];

      return buildShapeWithMetadata(
        { type: "polygon", x: 0, y: 0, points },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    polygon: (points: [number, number][], options?: ShapeDrawOptions): ShapeHandle => {
      return buildShapeWithMetadata(
        { type: "polygon", x: 0, y: 0, points },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    text: (text: string, x: number, y: number, options?: any): ShapeHandle => {
      const { animateIn, animateOut, shadow, ...textOptions } = options || {};
      return buildShapeWithMetadata(
        { type: "text", x, y, text, ...textOptions },
        { animateIn, animateOut, shadow },
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    sketchyText: (text: string, x: number, y: number, options?: any): ShapeHandle => {
      const { animateIn, animateOut, shadow, ...textOptions } = options || {};
      return buildShapeWithMetadata(
        { type: "sketchyText", x, y, text, ...textOptions },
        { animateIn, animateOut, shadow },
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },
  };
}

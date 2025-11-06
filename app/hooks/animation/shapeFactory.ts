import type { Shape, SceneAPI, ShapeDrawOptions, ShapeHandle } from "../types";
import type { AnimateOptions } from "~/lib/Animate";
import { toShadowOptions, toLabelOptions, toAnimateOptions } from "./converters";
import type { MutableRefObject } from "react";
import { Position } from "~/lib/Position";

/**
 * Helper to check if a value is a Position object
 */
function isPosition(value: any): value is Position {
  return value instanceof Position;
}

/**
 * Helper function to build a shape with metadata
 * Reduces duplication across all shape creation methods
 */
function buildShapeWithMetadata(
  shapeData: Partial<Shape>,
  options: ShapeDrawOptions | undefined,
  shapeIdCounterRef: MutableRefObject<number>,
  shapeMetadataRef: MutableRefObject<Map<string, { animateOut?: AnimateOptions; x: number; y: number }>>,
  addShape: (shape: Shape) => void,
  createShapeHandle: (id: string) => ShapeHandle
): ShapeHandle {
  const { shadow, label, animateIn, animateOut, ...roughOptions } = options || {};
  const id = `shape-${++shapeIdCounterRef.current}`;
  const now = Date.now();
  const animateInOpts = toAnimateOptions(animateIn);
  const animateOutOpts = toAnimateOptions(animateOut);

  // Store metadata for remove() and getPosition() to avoid stale closure
  shapeMetadataRef.current.set(id, {
    animateOut: animateOutOpts,
    x: shapeData.x || 0,
    y: shapeData.y || 0
  });

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
  shapeMetadataRef: MutableRefObject<Map<string, { animateOut?: AnimateOptions; x: number; y: number }>>,
  createShapeHandle: (id: string) => ShapeHandle
) {
  return {
    rect: (positionOrX: Position | number, yOrWidth: number, widthOrHeight: number, heightOrOptions?: number | ShapeDrawOptions, optionsOrUndefined?: ShapeDrawOptions): ShapeHandle => {
      let x, y, width, height, options;
      if (isPosition(positionOrX)) {
        x = positionOrX.x;
        y = positionOrX.y;
        width = yOrWidth;
        height = widthOrHeight;
        options = heightOrOptions as ShapeDrawOptions | undefined;
      } else {
        x = positionOrX;
        y = yOrWidth;
        width = widthOrHeight;
        height = heightOrOptions as number;
        options = optionsOrUndefined;
      }
      return buildShapeWithMetadata(
        { type: "rectangle", x, y, width, height },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    square: (positionOrX: Position | number, yOrSize: number, sizeOrOptions?: number | ShapeDrawOptions, optionsOrUndefined?: ShapeDrawOptions): ShapeHandle => {
      let x, y, size, options;
      if (isPosition(positionOrX)) {
        x = positionOrX.x;
        y = positionOrX.y;
        size = yOrSize;
        options = sizeOrOptions as ShapeDrawOptions | undefined;
      } else {
        x = positionOrX;
        y = yOrSize;
        size = sizeOrOptions as number;
        options = optionsOrUndefined;
      }
      return buildShapeWithMetadata(
        { type: "rectangle", x, y, width: size, height: size },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    circle: (positionOrX: Position | number, yOrRadius: number, radiusOrOptions?: number | ShapeDrawOptions, optionsOrUndefined?: ShapeDrawOptions): ShapeHandle => {
      let x, y, radius, options;
      if (isPosition(positionOrX)) {
        x = positionOrX.x;
        y = positionOrX.y;
        radius = yOrRadius;
        options = radiusOrOptions as ShapeDrawOptions | undefined;
      } else {
        x = positionOrX;
        y = yOrRadius;
        radius = radiusOrOptions as number;
        options = optionsOrUndefined;
      }
      return buildShapeWithMetadata(
        { type: "circle", x, y, radius },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    ellipse: (positionOrX: Position | number, yOrWidth: number, widthOrHeight: number, heightOrOptions?: number | ShapeDrawOptions, optionsOrUndefined?: ShapeDrawOptions): ShapeHandle => {
      let x, y, width, height, options;
      if (isPosition(positionOrX)) {
        x = positionOrX.x;
        y = positionOrX.y;
        width = yOrWidth;
        height = widthOrHeight;
        options = heightOrOptions as ShapeDrawOptions | undefined;
      } else {
        x = positionOrX;
        y = yOrWidth;
        width = widthOrHeight;
        height = heightOrOptions as number;
        options = optionsOrUndefined;
      }
      return buildShapeWithMetadata(
        { type: "ellipse", x, y, width, height },
        options,
        shapeIdCounterRef,
        shapeMetadataRef,
        api.addShape,
        createShapeHandle
      );
    },

    triangle: (positionOrX: Position | number, yOrSize: number, sizeOrOptions?: number | ShapeDrawOptions, optionsOrUndefined?: ShapeDrawOptions): ShapeHandle => {
      let x, y, size, options;
      if (isPosition(positionOrX)) {
        x = positionOrX.x;
        y = positionOrX.y;
        size = yOrSize;
        options = sizeOrOptions as ShapeDrawOptions | undefined;
      } else {
        x = positionOrX;
        y = yOrSize;
        size = sizeOrOptions as number;
        options = optionsOrUndefined;
      }
      // Create an equilateral triangle
      const height = (Math.sqrt(3) / 2) * size;
      const points: [number, number][] = [
        [x + size / 2, y], // Top point
        [x + size, y + height], // Bottom right
        [x, y + height], // Bottom left
      ];

      return buildShapeWithMetadata(
        { type: "polygon", x, y, points },
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

    text: (text: string, positionOrX: Position | number, yOrOptions?: number | any, optionsOrUndefined?: any): ShapeHandle => {
      let x, y, options;
      if (isPosition(positionOrX)) {
        x = positionOrX.x;
        y = positionOrX.y;
        options = yOrOptions;
      } else {
        x = positionOrX;
        y = yOrOptions as number;
        options = optionsOrUndefined;
      }
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

    sketchyText: (text: string, positionOrX: Position | number, yOrOptions?: number | any, optionsOrUndefined?: any): ShapeHandle => {
      let x, y, options;
      if (isPosition(positionOrX)) {
        x = positionOrX.x;
        y = positionOrX.y;
        options = yOrOptions;
      } else {
        x = positionOrX;
        y = yOrOptions as number;
        options = optionsOrUndefined;
      }
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

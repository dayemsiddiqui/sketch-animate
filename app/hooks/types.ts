/**
 * Types for the sketch animation system
 */

import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Options } from "roughjs/bin/core";
import type { AnimateOptions } from "~/lib/Animate";

/**
 * Shadow configuration for shapes
 */
export interface ShadowOptions {
  /**
   * Type of shadow:
   * - "drop": Soft shadow with blur (default)
   * - "cast": Solid, connected shadow for stylistic/retro look
   */
  type?: "drop" | "cast";
  color: string;
  offsetX: number;
  offsetY: number;
  blur?: number; // Only applies to "drop" type
}

/**
 * Label configuration for shapes
 * Makes it easy to add text on/inside shapes without manual positioning
 */
export interface LabelOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  /**
   * Vertical alignment within the shape
   * - "middle": Center vertically (default)
   * - "top": Align to top
   * - "bottom": Align to bottom
   */
  align?: "middle" | "top" | "bottom";
  /**
   * Additional offset from calculated position
   */
  offsetX?: number;
  offsetY?: number;
  /**
   * Use sketchy text style
   */
  sketchy?: boolean;
  jitter?: number;
  roughness?: number;
}

/**
 * Shape drawing options that include Rough.js options, shadow, label, and animations
 * Accepts both plain objects and builder class instances
 */
export type ShapeDrawOptions = Options & {
  shadow?: ShadowOptions | import("~/lib/Shadow").Shadow;
  label?: LabelOptions | import("~/lib/Label").Label;
  animateIn?: AnimateOptions | import("~/lib/Animate").Animate;
  animateOut?: AnimateOptions | import("~/lib/Animate").Animate;
};

/**
 * Shape lifecycle state
 */
export type ShapeState = "entering" | "visible" | "exiting";

/**
 * A shape that can be drawn on the canvas
 */
export interface Shape {
  // Identity and lifecycle
  id: string;
  state: ShapeState;
  addedAt: number; // timestamp when shape was added
  removedAt?: number; // timestamp when removal was triggered

  // Shape type and geometry
  type: "rectangle" | "circle" | "ellipse" | "line" | "polygon" | "text" | "sketchyText";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: [number, number][];
  options?: Options;

  // Text-specific properties (for both text and sketchyText)
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  textBaseline?: "top" | "middle" | "bottom" | "alphabetic";

  // Sketchy text specific properties
  jitter?: number;
  roughness?: number;

  // Shadow (optional for any shape) - accepts plain object or Shadow class
  shadow?: ShadowOptions | import("~/lib/Shadow").Shadow;

  // Label (optional for any shape) - accepts plain object or Label class
  label?: LabelOptions | import("~/lib/Label").Label;

  // Animation options
  animateIn?: AnimateOptions | import("~/lib/Animate").Animate;
  animateOut?: AnimateOptions | import("~/lib/Animate").Animate;
}

/**
 * Handle to a shape instance that allows controlling it
 */
export interface ShapeHandle {
  /**
   * Remove this shape with an optional exit animation
   * @param animation - Optional exit animation (overrides animateOut from creation)
   * @returns Promise that resolves when the exit animation completes
   */
  remove: (animation?: AnimateOptions | import("~/lib/Animate").Animate) => Promise<void>;
}

/**
 * API provided to scene draw functions for choreographing animations
 */
export interface SceneAPI {
  /**
   * Add a shape to be drawn in the current frame (low-level method)
   */
  addShape: (shape: Shape) => void;

  /**
   * Remove all shapes from the canvas
   */
  clearShapes: () => void;

  /**
   * Wait for a specified duration (Puppeteer-style)
   * @param ms - Duration to wait in milliseconds
   */
  wait: (ms: number) => Promise<void>;

  /**
   * Get the Rough.js canvas instance for custom drawing
   */
  getRoughCanvas: () => RoughCanvas;

  /**
   * Get the raw HTML canvas element
   */
  getCanvas: () => HTMLCanvasElement;

  // Helper methods for common shapes
  /**
   * Add a rectangle
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  rect: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions) => ShapeHandle;

  /**
   * Add a square
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  square: (x: number, y: number, size: number, options?: ShapeDrawOptions) => ShapeHandle;

  /**
   * Add a circle
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  circle: (x: number, y: number, radius: number, options?: ShapeDrawOptions) => ShapeHandle;

  /**
   * Add an ellipse
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  ellipse: (x: number, y: number, width: number, height: number, options?: ShapeDrawOptions) => ShapeHandle;

  /**
   * Add an equilateral triangle
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  triangle: (x: number, y: number, size: number, options?: ShapeDrawOptions) => ShapeHandle;

  /**
   * Add a custom polygon
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  polygon: (points: [number, number][], options?: ShapeDrawOptions) => ShapeHandle;

  /**
   * Add text with optional styling (clean, non-wiggly)
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  text: (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      textAlign?: "left" | "center" | "right";
      textBaseline?: "top" | "middle" | "bottom" | "alphabetic";
      shadow?: ShadowOptions;
      animateIn?: AnimateOptions | import("~/lib/Animate").Animate;
      animateOut?: AnimateOptions | import("~/lib/Animate").Animate;
    }
  ) => ShapeHandle;

  /**
   * Add sketchy, hand-drawn text with wiggle effects
   * @returns ShapeHandle to control the shape (e.g., remove it later)
   */
  sketchyText: (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      textAlign?: "left" | "center" | "right";
      textBaseline?: "top" | "middle" | "bottom" | "alphabetic";
      jitter?: number;
      roughness?: number;
      shadow?: ShadowOptions;
      animateIn?: AnimateOptions | import("~/lib/Animate").Animate;
      animateOut?: AnimateOptions | import("~/lib/Animate").Animate;
    }
  ) => ShapeHandle;
}

/**
 * A scene in the animation timeline
 */
export interface Scene {
  /**
   * Optional name for debugging
   */
  name?: string;

  /**
   * Duration of the scene in milliseconds
   * If not specified, scene runs until draw function completes
   */
  duration?: number;

  /**
   * Async function that choreographs what to draw in this scene
   */
  draw: (api: SceneAPI) => Promise<void>;
}

/**
 * Types for the sketch animation system
 */

import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Options } from "roughjs/bin/core";

/**
 * A shape that can be drawn on the canvas
 */
export interface Shape {
  type: "rectangle" | "circle" | "ellipse" | "line" | "polygon";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: [number, number][];
  options?: Options;
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
   */
  rect: (x: number, y: number, width: number, height: number, options?: Options) => void;

  /**
   * Add a square
   */
  square: (x: number, y: number, size: number, options?: Options) => void;

  /**
   * Add a circle
   */
  circle: (x: number, y: number, radius: number, options?: Options) => void;

  /**
   * Add an ellipse
   */
  ellipse: (x: number, y: number, width: number, height: number, options?: Options) => void;

  /**
   * Add an equilateral triangle
   */
  triangle: (x: number, y: number, size: number, options?: Options) => void;

  /**
   * Add a custom polygon
   */
  polygon: (points: [number, number][], options?: Options) => void;
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

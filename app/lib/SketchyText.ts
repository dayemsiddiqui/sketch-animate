/**
 * SketchyText - Utility for rendering hand-drawn, wiggly text
 *
 * This module handles the complex logic for creating text that looks
 * hand-drawn with authentic wiggle/jitter effects on each frame.
 */

export interface SketchyTextOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  textBaseline?: "top" | "middle" | "bottom" | "alphabetic";

  /**
   * Amount of random jitter/wiggle in pixels (default: 1)
   * Higher values = more wobble
   */
  jitter?: number;

  /**
   * How rough/sketchy the text appears (1-5, default: 2)
   * Higher values = more hand-drawn look with multiple overlapping strokes
   */
  roughness?: number;
}

/**
 * Draw sketchy, hand-drawn text with wiggle effects
 *
 * This function renders text with:
 * - Random position jitter for wiggle effect
 * - Multiple overlapping strokes for sketchy appearance
 * - Slight rotation variation
 *
 * @param ctx - Canvas 2D context
 * @param text - Text to render
 * @param x - X position
 * @param y - Y position
 * @param options - Styling and effect options
 */
export function drawSketchyText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: SketchyTextOptions = {}
): void {
  const {
    fontSize = 24,
    fontFamily = "sans-serif",
    color = "#000000",
    textAlign = "left",
    textBaseline = "alphabetic",
    jitter = 1,
    roughness = 2,
  } = options;

  // Save context state
  ctx.save();

  // Set font and alignment
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Generate random offsets for wiggle effect
  const jitterX = (Math.random() - 0.5) * jitter * 2;
  const jitterY = (Math.random() - 0.5) * jitter * 2;
  const jitterRotation = (Math.random() - 0.5) * 0.02; // Small rotation in radians

  // Apply jitter transformation
  ctx.translate(x + jitterX, y + jitterY);
  ctx.rotate(jitterRotation);

  // Draw multiple overlapping strokes for sketchy effect
  const numStrokes = Math.max(1, Math.floor(roughness));

  for (let i = 0; i < numStrokes; i++) {
    // Slight offset for each stroke to create hand-drawn look
    const strokeOffsetX = (Math.random() - 0.5) * 0.5;
    const strokeOffsetY = (Math.random() - 0.5) * 0.5;

    // First layer: filled text
    if (i === 0) {
      ctx.fillText(text, strokeOffsetX, strokeOffsetY);
    }

    // Additional layers: thin strokes for roughness
    if (i > 0) {
      ctx.lineWidth = 0.5;
      ctx.strokeText(text, strokeOffsetX, strokeOffsetY);
    }
  }

  // Restore context state
  ctx.restore();
}

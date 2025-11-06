import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Shape } from "../../types";
import { drawSketchyText } from "~/lib/SketchyText";

/**
 * Renders the main shape geometry
 */
export function renderShape(
  shape: Shape,
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas,
  canvas: HTMLCanvasElement
): void {
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
        const fontSize = shape.fontSize || 24;
        const fontFamily = shape.fontFamily || "sans-serif";
        const color = shape.color || "#000000";

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = shape.textAlign || "left";
        ctx.textBaseline = shape.textBaseline || "alphabetic";

        ctx.fillText(shape.text, shape.x, shape.y);
      }
      break;

    case "sketchyText":
      if (shape.text) {
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
      break;
  }
}

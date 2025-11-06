import type { Shape, LabelOptions } from "../../types";
import { drawSketchyText } from "~/lib/SketchyText";
import { toLabelOptions } from "../converters";

/**
 * Calculates the label position based on shape type and geometry
 */
function calculateLabelPosition(shape: Shape, labelOpts: LabelOptions): { x: number; y: number } {
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

  return { x: labelX, y: labelY };
}

/**
 * Renders a label for a shape
 */
export function renderLabel(shape: Shape, ctx: CanvasRenderingContext2D): void {
  const labelOpts = toLabelOptions(shape.label);
  if (!labelOpts) return;

  const { x: labelX, y: labelY } = calculateLabelPosition(shape, labelOpts);

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

import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Shape, ShadowOptions } from "../../types";
import {
  drawRectangleCastShadow,
  drawCircleCastShadow,
  drawPolygonCastShadow,
} from "~/lib/CastShadow";
import { toShadowOptions } from "../converters";

/**
 * Renders shadow for a shape (both cast and drop shadows)
 */
export function renderShadow(
  shape: Shape,
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas
): { shadowOpts: ShadowOptions | undefined; isCastShadow: boolean | undefined } {
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

  return { shadowOpts, isCastShadow };
}

/**
 * Clears any shadow effects from the canvas context
 */
export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
}

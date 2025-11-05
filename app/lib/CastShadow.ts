/**
 * CastShadow - Utility for rendering stylistic cast/long shadows
 *
 * Creates the retro/vintage poster style shadows where the shadow is solid,
 * has a large offset, and is visually connected to the original shape.
 */

import type { RoughCanvas } from "roughjs/bin/canvas";
import type { ShadowOptions } from "~/hooks/types";

/**
 * Draw a cast shadow for a rectangle
 */
export function drawRectangleCastShadow(
  rc: RoughCanvas,
  x: number,
  y: number,
  width: number,
  height: number,
  shadow: ShadowOptions
): void {
  const { offsetX, offsetY, color } = shadow;

  // Draw the connecting extrusion shape
  // This creates the 3D connecting area between original and shadow
  const points: [number, number][] = [
    // Original shape corners (clockwise)
    [x + width, y], // Top right
    [x + width, y + height], // Bottom right
    // Shadow shape corners (continuing clockwise)
    [x + width + offsetX, y + height + offsetY], // Shadow bottom right
    [x + width + offsetX, y + offsetY], // Shadow top right
  ];

  rc.polygon(points, {
    fill: color,
    fillStyle: "solid",
    stroke: "none",
  });

  // Draw bottom extrusion
  const bottomPoints: [number, number][] = [
    [x, y + height], // Original bottom left
    [x + width, y + height], // Original bottom right
    [x + width + offsetX, y + height + offsetY], // Shadow bottom right
    [x + offsetX, y + height + offsetY], // Shadow bottom left
  ];

  rc.polygon(bottomPoints, {
    fill: color,
    fillStyle: "solid",
    stroke: "none",
  });

  // Draw the offset shadow rectangle
  rc.rectangle(x + offsetX, y + offsetY, width, height, {
    fill: color,
    fillStyle: "solid",
    stroke: "none",
  });
}

/**
 * Draw a cast shadow for a circle
 */
export function drawCircleCastShadow(
  rc: RoughCanvas,
  x: number,
  y: number,
  radius: number,
  shadow: ShadowOptions
): void {
  const { offsetX, offsetY, color } = shadow;

  // For circles, we'll create an elliptical connecting shape
  // This is a simplified approach - drawing an ellipse between the circles
  const angle = Math.atan2(offsetY, offsetX);
  const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

  // Draw multiple ellipses to create the connecting extrusion
  const steps = Math.max(3, Math.floor(distance / 5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x + offsetX * t;
    const cy = y + offsetY * t;

    rc.circle(cx, cy, radius * 2, {
      fill: color,
      fillStyle: "solid",
      stroke: "none",
    });
  }
}

/**
 * Draw a cast shadow for a polygon (including triangles)
 */
export function drawPolygonCastShadow(
  rc: RoughCanvas,
  points: [number, number][],
  shadow: ShadowOptions
): void {
  const { offsetX, offsetY, color } = shadow;

  // Draw connecting extrusion for each edge
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];

    const extrusionPoints: [number, number][] = [
      [x1, y1], // Original point 1
      [x2, y2], // Original point 2
      [x2 + offsetX, y2 + offsetY], // Shadow point 2
      [x1 + offsetX, y1 + offsetY], // Shadow point 1
    ];

    rc.polygon(extrusionPoints, {
      fill: color,
      fillStyle: "solid",
      stroke: "none",
    });
  }

  // Draw the offset shadow polygon
  const shadowPoints: [number, number][] = points.map(
    ([x, y]) => [x + offsetX, y + offsetY]
  );

  rc.polygon(shadowPoints, {
    fill: color,
    fillStyle: "solid",
    stroke: "none",
  });
}

import { Shadow } from "~/lib/Shadow";
import { Label } from "~/lib/Label";
import { Animate, type AnimateOptions } from "~/lib/Animate";
import type { ShadowOptions, LabelOptions } from "../types";

/**
 * Convert shadow (class or object) to plain options object
 */
export function toShadowOptions(shadow: ShadowOptions | Shadow | undefined): ShadowOptions | undefined {
  if (!shadow) return undefined;
  return shadow instanceof Shadow ? shadow.toOptions() : shadow;
}

/**
 * Convert label (class or object) to plain options object
 */
export function toLabelOptions(label: LabelOptions | Label | undefined): LabelOptions | undefined {
  if (!label) return undefined;
  return label instanceof Label ? label.toOptions() : label;
}

/**
 * Convert animation (class or object) to plain options object
 */
export function toAnimateOptions(animate: AnimateOptions | Animate | undefined): AnimateOptions | undefined {
  if (!animate) return undefined;
  return animate instanceof Animate ? animate.toOptions() : animate;
}

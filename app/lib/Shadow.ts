/**
 * Shadow - Builder class for creating shadow configurations
 *
 * Provides a fluent, chainable API for configuring shadows with better
 * type safety and IDE autocomplete.
 */

import type { ShadowOptions } from "~/hooks/types";

export class Shadow {
  private options: ShadowOptions;

  constructor() {
    this.options = {
      color: "rgba(0, 0, 0, 0.3)",
      offsetX: 5,
      offsetY: 5,
      type: "drop",
    };
  }

  /**
   * Create a drop shadow (soft, blurred)
   */
  static drop(
    color: string = "rgba(0, 0, 0, 0.3)",
    offsetX: number = 5,
    offsetY: number = 5,
    blur: number = 4
  ): Shadow {
    return new Shadow()
      .type("drop")
      .color(color)
      .offset(offsetX, offsetY)
      .blur(blur);
  }

  /**
   * Create a cast shadow (solid, connected, retro style)
   */
  static cast(
    color: string = "rgba(0, 0, 0, 0.7)",
    offsetX: number = 15,
    offsetY: number = 15
  ): Shadow {
    return new Shadow()
      .type("cast")
      .color(color)
      .offset(offsetX, offsetY);
  }

  /**
   * Set shadow type
   */
  type(type: "drop" | "cast"): this {
    this.options.type = type;
    return this;
  }

  /**
   * Set shadow color
   */
  color(color: string): this {
    this.options.color = color;
    return this;
  }

  /**
   * Set shadow offset
   */
  offset(x: number, y: number): this {
    this.options.offsetX = x;
    this.options.offsetY = y;
    return this;
  }

  /**
   * Set blur radius (only applies to drop shadows)
   */
  blur(blur: number): this {
    this.options.blur = blur;
    return this;
  }

  /**
   * Convert to plain options object
   * @internal Used by rendering logic
   */
  toOptions(): ShadowOptions {
    return { ...this.options };
  }
}

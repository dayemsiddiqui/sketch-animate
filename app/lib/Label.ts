/**
 * Label - Builder class for creating label configurations
 *
 * Provides a fluent, chainable API for configuring text labels on shapes
 * with better type safety and IDE autocomplete.
 */

import type { LabelOptions } from "~/hooks/types";

export class Label {
  private options: LabelOptions;

  constructor(text: string) {
    this.options = {
      text,
      fontSize: 16,
      color: "#000000",
      align: "middle",
    };
  }

  /**
   * Create a new label
   */
  static create(text: string): Label {
    return new Label(text);
  }

  /**
   * Set font size
   */
  fontSize(size: number): this {
    this.options.fontSize = size;
    return this;
  }

  /**
   * Set font family
   */
  fontFamily(family: string): this {
    this.options.fontFamily = family;
    return this;
  }

  /**
   * Set text color
   */
  color(color: string): this {
    this.options.color = color;
    return this;
  }

  /**
   * Set vertical alignment
   */
  align(align: "middle" | "top" | "bottom"): this {
    this.options.align = align;
    return this;
  }

  /**
   * Set position offset
   */
  offset(x: number, y: number): this {
    this.options.offsetX = x;
    this.options.offsetY = y;
    return this;
  }

  /**
   * Enable sketchy text style
   */
  sketchy(jitter: number = 1.5, roughness: number = 3): this {
    this.options.sketchy = true;
    this.options.jitter = jitter;
    this.options.roughness = roughness;
    return this;
  }

  /**
   * Convert to plain options object
   * @internal Used by rendering logic
   */
  toOptions(): LabelOptions {
    return { ...this.options };
  }
}

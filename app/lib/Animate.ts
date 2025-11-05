/**
 * Animate - Builder class for creating shape animation configurations
 *
 * Provides a fluent, chainable API for configuring entrance and exit animations
 * for shapes with fade and slide effects. Each effect can have independent durations.
 */

export type Direction = "left" | "right" | "top" | "bottom";

export interface AnimationEffect {
  type: "fade" | "slide";
  direction?: Direction;
  distance?: number;
  duration: number;
}

export interface AnimateOptions {
  effects: AnimationEffect[];
}

export class Animate {
  private effects: AnimationEffect[] = [];

  /**
   * Create a fade-in animation
   * @param duration - Duration in milliseconds
   */
  static fadeIn(duration: number): Animate {
    return new Animate().fadeIn(duration);
  }

  /**
   * Create a fade-out animation
   * @param duration - Duration in milliseconds
   */
  static fadeOut(duration: number): Animate {
    return new Animate().fadeOut(duration);
  }

  /**
   * Create a slide-from animation
   * @param direction - Direction to slide from
   * @param distance - Distance in pixels
   * @param duration - Duration in milliseconds
   */
  static slideFrom(direction: Direction, distance: number, duration: number = 300): Animate {
    return new Animate().slideFrom(direction, distance, duration);
  }

  /**
   * Create a slide-to animation
   * @param direction - Direction to slide to
   * @param distance - Distance in pixels
   * @param duration - Duration in milliseconds
   */
  static slideTo(direction: Direction, distance: number, duration: number = 300): Animate {
    return new Animate().slideTo(direction, distance, duration);
  }

  /**
   * Add a fade-in effect
   * @param duration - Duration in milliseconds
   */
  fadeIn(duration: number): this {
    this.effects.push({
      type: "fade",
      duration,
    });
    return this;
  }

  /**
   * Add a fade-out effect
   * @param duration - Duration in milliseconds
   */
  fadeOut(duration: number): this {
    this.effects.push({
      type: "fade",
      duration,
    });
    return this;
  }

  /**
   * Add a slide-from effect (shape slides in from a direction)
   * @param direction - Direction to slide from
   * @param distance - Distance in pixels to slide
   * @param duration - Duration in milliseconds (defaults to 300ms)
   */
  slideFrom(direction: Direction, distance: number, duration: number = 300): this {
    this.effects.push({
      type: "slide",
      direction,
      distance,
      duration,
    });
    return this;
  }

  /**
   * Add a slide-to effect (shape slides out to a direction)
   * @param direction - Direction to slide to
   * @param distance - Distance in pixels to slide
   * @param duration - Duration in milliseconds (defaults to 300ms)
   */
  slideTo(direction: Direction, distance: number, duration: number = 300): this {
    this.effects.push({
      type: "slide",
      direction,
      distance,
      duration,
    });
    return this;
  }

  /**
   * Convert to plain options object
   * @internal Used by rendering logic
   */
  toOptions(): AnimateOptions {
    return {
      effects: [...this.effects],
    };
  }
}

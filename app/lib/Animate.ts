/**
 * Animate - Builder class for creating shape animation configurations
 *
 * Provides a fluent, chainable API for configuring entrance and exit animations
 * for shapes with fade and slide effects. Each effect can have independent durations.
 */

import { Position } from "./Position";

export type Direction = "left" | "right" | "top" | "bottom";

export interface AnimationEffect {
  type: "fade" | "slide";
  direction?: Direction;
  distance?: number;
  offset?: Position; // NEW: Position-based offset (alternative to direction+distance)
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
   * Supports two patterns:
   * - slideFrom(direction, distance, duration)
   * - slideFrom(offset: Position, duration)
   */
  static slideFrom(directionOrOffset: Direction | Position, distanceOrDuration: number, duration?: number): Animate {
    return new Animate().slideFrom(directionOrOffset as any, distanceOrDuration, duration);
  }

  /**
   * Create a slide-to animation
   * Supports two patterns:
   * - slideTo(direction, distance, duration)
   * - slideTo(offset: Position, duration)
   */
  static slideTo(directionOrOffset: Direction | Position, distanceOrDuration: number, duration?: number): Animate {
    return new Animate().slideTo(directionOrOffset as any, distanceOrDuration, duration);
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
   * Add a slide-from effect (shape slides in from a direction or offset)
   * Supports two patterns:
   * - slideFrom(direction: Direction, distance: number, duration?: number)
   * - slideFrom(offset: Position, duration?: number)
   */
  slideFrom(directionOrOffset: Direction | Position, distanceOrDuration: number = 300, duration?: number): this {
    if (directionOrOffset instanceof Position) {
      // Pattern: slideFrom(Position, duration)
      this.effects.push({
        type: "slide",
        offset: directionOrOffset,
        duration: distanceOrDuration,
      });
    } else {
      // Pattern: slideFrom(direction, distance, duration)
      this.effects.push({
        type: "slide",
        direction: directionOrOffset,
        distance: distanceOrDuration,
        duration: duration || 300,
      });
    }
    return this;
  }

  /**
   * Add a slide-to effect (shape slides out to a direction or offset)
   * Supports two patterns:
   * - slideTo(direction: Direction, distance: number, duration?: number)
   * - slideTo(offset: Position, duration?: number)
   */
  slideTo(directionOrOffset: Direction | Position, distanceOrDuration: number = 300, duration?: number): this {
    if (directionOrOffset instanceof Position) {
      // Pattern: slideTo(Position, duration)
      this.effects.push({
        type: "slide",
        offset: directionOrOffset,
        duration: distanceOrDuration,
      });
    } else {
      // Pattern: slideTo(direction, distance, duration)
      this.effects.push({
        type: "slide",
        direction: directionOrOffset,
        distance: distanceOrDuration,
        duration: duration || 300,
      });
    }
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

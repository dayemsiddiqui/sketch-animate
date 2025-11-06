/**
 * Animate - Builder class for creating shape animation configurations
 *
 * Provides a fluent, chainable API for configuring entrance and exit animations
 * for shapes with fade and slide effects. Each effect can have independent durations.
 */

import { Position } from "./Position";
import { Duration } from "./Duration";

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
   * @param duration - Duration object
   */
  static fadeIn(duration: Duration): Animate {
    return new Animate().fadeIn(duration);
  }

  /**
   * Create a fade-out animation
   * @param duration - Duration object
   */
  static fadeOut(duration: Duration): Animate {
    return new Animate().fadeOut(duration);
  }

  /**
   * Create a slide-from animation
   * Supports two patterns:
   * - slideFrom(direction, distance, duration)
   * - slideFrom(offset: Position, duration)
   */
  static slideFrom(directionOrOffset: Direction | Position, distanceOrDuration: number | Duration, duration?: Duration): Animate {
    return new Animate().slideFrom(directionOrOffset as any, distanceOrDuration, duration);
  }

  /**
   * Create a slide-to animation
   * Supports two patterns:
   * - slideTo(direction, distance, duration)
   * - slideTo(offset: Position, duration)
   */
  static slideTo(directionOrOffset: Direction | Position, distanceOrDuration: number | Duration, duration?: Duration): Animate {
    return new Animate().slideTo(directionOrOffset as any, distanceOrDuration, duration);
  }

  /**
   * Add a fade-in effect
   * @param duration - Duration object
   */
  fadeIn(duration: Duration): this {
    this.effects.push({
      type: "fade",
      duration: duration.ms,
    });
    return this;
  }

  /**
   * Add a fade-out effect
   * @param duration - Duration object
   */
  fadeOut(duration: Duration): this {
    this.effects.push({
      type: "fade",
      duration: duration.ms,
    });
    return this;
  }

  /**
   * Add a slide-from effect (shape slides in from a direction or offset)
   * Supports two patterns:
   * - slideFrom(direction: Direction, distance: number, duration: Duration)
   * - slideFrom(offset: Position, duration: Duration)
   */
  slideFrom(directionOrOffset: Direction | Position, distanceOrDuration: number | Duration, duration?: Duration): this {
    if (directionOrOffset instanceof Position) {
      // Pattern: slideFrom(Position, duration)
      this.effects.push({
        type: "slide",
        offset: directionOrOffset,
        duration: (distanceOrDuration as Duration).ms,
      });
    } else {
      // Pattern: slideFrom(direction, distance, duration)
      if (!duration) {
        throw new Error("Duration is required when using slideFrom with direction");
      }
      this.effects.push({
        type: "slide",
        direction: directionOrOffset,
        distance: distanceOrDuration as number,
        duration: duration.ms,
      });
    }
    return this;
  }

  /**
   * Add a slide-to effect (shape slides out to a direction or offset)
   * Supports two patterns:
   * - slideTo(direction: Direction, distance: number, duration: Duration)
   * - slideTo(offset: Position, duration: Duration)
   */
  slideTo(directionOrOffset: Direction | Position, distanceOrDuration: number | Duration, duration?: Duration): this {
    if (directionOrOffset instanceof Position) {
      // Pattern: slideTo(Position, duration)
      this.effects.push({
        type: "slide",
        offset: directionOrOffset,
        duration: (distanceOrDuration as Duration).ms,
      });
    } else {
      // Pattern: slideTo(direction, distance, duration)
      if (!duration) {
        throw new Error("Duration is required when using slideTo with direction");
      }
      this.effects.push({
        type: "slide",
        direction: directionOrOffset,
        distance: distanceOrDuration as number,
        duration: duration.ms,
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

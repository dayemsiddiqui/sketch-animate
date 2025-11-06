/**
 * Duration class for semantic time values in animations.
 * Provides a fluent API for creating duration values without magic numbers.
 *
 * All durations are stored and returned in milliseconds, which is the standard
 * unit used throughout the animation system.
 *
 * @example
 * ```tsx
 * // Create durations
 * const fadeTime = Duration.milliseconds(600);
 * const slideTime = Duration.seconds(0.7);
 * const sceneLength = Duration.seconds(12);
 * const longWait = Duration.minutes(2);
 *
 * // Use in animations
 * Animate.fadeIn(Duration.milliseconds(600))
 * Animate.slideFrom(Position.fromLeft(150), Duration.seconds(0.7))
 *
 * // Use in timeline
 * timeline.addScene("demo", Duration.seconds(12), async (api) => {
 *   await api.wait(Duration.seconds(2));
 * });
 * ```
 */
export class Duration {
  /**
   * Duration value in milliseconds
   */
  readonly ms: number;

  private constructor(milliseconds: number) {
    this.ms = milliseconds;
  }

  // ========================================
  // Static Factory Methods
  // ========================================

  /**
   * Create a duration from milliseconds
   * @param value - Duration in milliseconds
   * @returns Duration instance
   *
   * @example
   * ```tsx
   * Duration.milliseconds(600) // 600ms
   * Duration.milliseconds(1500) // 1.5 seconds
   * ```
   */
  static milliseconds(value: number): Duration {
    return new Duration(value);
  }

  /**
   * Alias for milliseconds()
   */
  static ms(value: number): Duration {
    return Duration.milliseconds(value);
  }

  /**
   * Create a duration from seconds
   * @param value - Duration in seconds
   * @returns Duration instance
   *
   * @example
   * ```tsx
   * Duration.seconds(2) // 2000ms
   * Duration.seconds(0.5) // 500ms
   * Duration.seconds(1.5) // 1500ms
   * ```
   */
  static seconds(value: number): Duration {
    return new Duration(value * 1000);
  }

  /**
   * Alias for seconds()
   */
  static s(value: number): Duration {
    return Duration.seconds(value);
  }

  /**
   * Create a duration from minutes
   * @param value - Duration in minutes
   * @returns Duration instance
   *
   * @example
   * ```tsx
   * Duration.minutes(2) // 120000ms (2 minutes)
   * Duration.minutes(0.5) // 30000ms (30 seconds)
   * ```
   */
  static minutes(value: number): Duration {
    return new Duration(value * 60 * 1000);
  }

  /**
   * Alias for minutes()
   */
  static m(value: number): Duration {
    return Duration.minutes(value);
  }

  /**
   * Create a duration from hours
   * @param value - Duration in hours
   * @returns Duration instance
   *
   * @example
   * ```tsx
   * Duration.hours(1) // 3600000ms (1 hour)
   * Duration.hours(0.5) // 1800000ms (30 minutes)
   * ```
   */
  static hours(value: number): Duration {
    return new Duration(value * 60 * 60 * 1000);
  }

  /**
   * Alias for hours()
   */
  static h(value: number): Duration {
    return Duration.hours(value);
  }

  /**
   * Create a zero duration (0ms)
   */
  static zero(): Duration {
    return new Duration(0);
  }

  // ========================================
  // Arithmetic Operations
  // ========================================

  /**
   * Add another duration to this one
   */
  add(other: Duration): Duration {
    return new Duration(this.ms + other.ms);
  }

  /**
   * Subtract another duration from this one
   */
  subtract(other: Duration): Duration {
    return new Duration(Math.max(0, this.ms - other.ms));
  }

  /**
   * Multiply duration by a scalar
   */
  multiply(factor: number): Duration {
    return new Duration(this.ms * factor);
  }

  /**
   * Divide duration by a scalar
   */
  divide(factor: number): Duration {
    if (factor === 0) {
      throw new Error("Cannot divide duration by zero");
    }
    return new Duration(this.ms / factor);
  }

  // ========================================
  // Comparison Operations
  // ========================================

  /**
   * Check if this duration is longer than another
   */
  isLongerThan(other: Duration): boolean {
    return this.ms > other.ms;
  }

  /**
   * Check if this duration is shorter than another
   */
  isShorterThan(other: Duration): boolean {
    return this.ms < other.ms;
  }

  /**
   * Check if this duration equals another (within tolerance)
   */
  equals(other: Duration, tolerance: number = 1): boolean {
    return Math.abs(this.ms - other.ms) < tolerance;
  }

  // ========================================
  // Conversion Methods
  // ========================================

  /**
   * Get duration in milliseconds (raw value)
   */
  toMilliseconds(): number {
    return this.ms;
  }

  /**
   * Get duration in seconds
   */
  toSeconds(): number {
    return this.ms / 1000;
  }

  /**
   * Get duration in minutes
   */
  toMinutes(): number {
    return this.ms / (60 * 1000);
  }

  /**
   * Get duration in hours
   */
  toHours(): number {
    return this.ms / (60 * 60 * 1000);
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Create a copy of this duration
   */
  clone(): Duration {
    return new Duration(this.ms);
  }

  /**
   * Round duration to nearest millisecond
   */
  round(): Duration {
    return new Duration(Math.round(this.ms));
  }

  /**
   * Floor duration
   */
  floor(): Duration {
    return new Duration(Math.floor(this.ms));
  }

  /**
   * Ceil duration
   */
  ceil(): Duration {
    return new Duration(Math.ceil(this.ms));
  }

  /**
   * Clamp duration within bounds
   */
  clamp(min: Duration, max: Duration): Duration {
    return new Duration(Math.max(min.ms, Math.min(max.ms, this.ms)));
  }

  /**
   * Convert duration to string for debugging
   */
  toString(): string {
    if (this.ms < 1000) {
      return `Duration(${this.ms}ms)`;
    } else if (this.ms < 60000) {
      return `Duration(${this.toSeconds()}s)`;
    } else if (this.ms < 3600000) {
      return `Duration(${this.toMinutes()}m)`;
    } else {
      return `Duration(${this.toHours()}h)`;
    }
  }
}

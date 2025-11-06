/**
 * 2D Position/Vector class for intuitive positioning and composition.
 * Provides immutable vector operations and transformations.
 *
 * @example
 * ```tsx
 * // Create positions
 * const pos = Position.at(100, 200);
 * const center = Position.at(api.canvas.centerX, api.canvas.centerY);
 *
 * // Use with shapes
 * api.rect(pos, 100, 100);
 * api.circle(center, 50);
 *
 * // Compose and transform
 * const offset = pos.offset(50, -30);
 * const moved = pos.moveRight(100).moveDown(50);
 *
 * // Vector math
 * const sum = pos1.add(pos2);
 * const diff = pos1.subtract(pos2);
 * const scaled = pos.scale(2);
 *
 * // Transformations
 * const rotated = pos.rotate(45, origin);
 * const distance = pos1.distance(pos2);
 * ```
 */
export class Position {
  /**
   * X coordinate
   */
  readonly x: number;

  /**
   * Y coordinate
   */
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // ========================================
  // Static Factory Methods
  // ========================================

  /**
   * Create a position at specific coordinates
   */
  static at(x: number, y: number): Position {
    return new Position(x, y);
  }

  /**
   * Create a position at origin (0, 0)
   */
  static zero(): Position {
    return new Position(0, 0);
  }

  /**
   * Create a position from an object with x, y properties
   */
  static from(obj: { x: number; y: number }): Position {
    return new Position(obj.x, obj.y);
  }

  // ========================================
  // Offset Methods
  // ========================================

  /**
   * Create a new position offset by dx, dy
   */
  offset(dx: number, dy: number): Position {
    return new Position(this.x + dx, this.y + dy);
  }

  /**
   * Move position right (positive x direction)
   */
  moveRight(amount: number): Position {
    return new Position(this.x + amount, this.y);
  }

  /**
   * Move position left (negative x direction)
   */
  moveLeft(amount: number): Position {
    return new Position(this.x - amount, this.y);
  }

  /**
   * Move position down (positive y direction)
   */
  moveDown(amount: number): Position {
    return new Position(this.x, this.y + amount);
  }

  /**
   * Move position up (negative y direction)
   */
  moveUp(amount: number): Position {
    return new Position(this.x, this.y - amount);
  }

  // ========================================
  // Vector Math Operations
  // ========================================

  /**
   * Add another position (vector addition)
   */
  add(other: Position): Position {
    return new Position(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another position (vector subtraction)
   */
  subtract(other: Position): Position {
    return new Position(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiply by a scalar
   */
  multiply(scalar: number): Position {
    return new Position(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide by a scalar
   */
  divide(scalar: number): Position {
    if (scalar === 0) {
      throw new Error("Cannot divide position by zero");
    }
    return new Position(this.x / scalar, this.y / scalar);
  }

  /**
   * Scale position by a factor (alias for multiply)
   */
  scale(factor: number): Position {
    return this.multiply(factor);
  }

  // ========================================
  // Geometric Operations
  // ========================================

  /**
   * Calculate distance to another position
   */
  distance(other: Position): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate magnitude (length) of position vector from origin
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize vector (unit vector with same direction)
   */
  normalize(): Position {
    const mag = this.magnitude();
    if (mag === 0) {
      return Position.zero();
    }
    return this.divide(mag);
  }

  /**
   * Rotate position around an origin point
   * @param degrees - Rotation angle in degrees (clockwise)
   * @param origin - Point to rotate around (defaults to 0,0)
   */
  rotate(degrees: number, origin: Position = Position.zero()): Position {
    // Convert degrees to radians
    const radians = (degrees * Math.PI) / 180;

    // Translate to origin
    const translated = this.subtract(origin);

    // Rotate
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const rotatedX = translated.x * cos - translated.y * sin;
    const rotatedY = translated.x * sin + translated.y * cos;

    // Translate back
    return new Position(rotatedX, rotatedY).add(origin);
  }

  /**
   * Calculate angle of vector in degrees (0 = right, 90 = down)
   */
  angle(): number {
    return (Math.atan2(this.y, this.x) * 180) / Math.PI;
  }

  /**
   * Calculate dot product with another position
   */
  dot(other: Position): number {
    return this.x * other.x + this.y * other.y;
  }

  // ========================================
  // Alignment Operations
  // ========================================

  /**
   * Align this position with another position
   * @param other - Position to align with
   * @param alignment - How to align ('center', 'top', 'bottom', 'left', 'right')
   */
  alignWith(
    other: Position,
    alignment: "center" | "top" | "bottom" | "left" | "right" | "horizontal" | "vertical"
  ): Position {
    switch (alignment) {
      case "center":
      case "horizontal":
        return new Position(other.x, this.y);
      case "vertical":
        return new Position(this.x, other.y);
      case "top":
        return new Position(this.x, other.y);
      case "bottom":
        return new Position(this.x, other.y);
      case "left":
        return new Position(other.x, this.y);
      case "right":
        return new Position(other.x, this.y);
      default:
        return this;
    }
  }

  // ========================================
  // Interpolation
  // ========================================

  /**
   * Linear interpolation between this position and another
   * @param other - Target position
   * @param t - Interpolation factor (0 = this position, 1 = other position)
   */
  lerp(other: Position, t: number): Position {
    return new Position(this.x + (other.x - this.x) * t, this.y + (other.y - this.y) * t);
  }

  /**
   * Get the center point (midpoint) between this position and another
   * Alias for lerp(other, 0.5)
   * @param other - Other position
   * @returns Position at the midpoint
   */
  centerWith(other: Position): Position {
    return this.lerp(other, 0.5);
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Create a copy of this position
   */
  clone(): Position {
    return new Position(this.x, this.y);
  }

  /**
   * Check if this position equals another (within tolerance)
   */
  equals(other: Position, tolerance: number = 0.001): boolean {
    return Math.abs(this.x - other.x) < tolerance && Math.abs(this.y - other.y) < tolerance;
  }

  /**
   * Convert position to array [x, y]
   */
  toArray(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * Convert position to object {x, y}
   */
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Convert position to string for debugging
   */
  toString(): string {
    return `Position(${this.x}, ${this.y})`;
  }

  /**
   * Round coordinates to nearest integer
   */
  round(): Position {
    return new Position(Math.round(this.x), Math.round(this.y));
  }

  /**
   * Floor coordinates
   */
  floor(): Position {
    return new Position(Math.floor(this.x), Math.floor(this.y));
  }

  /**
   * Ceil coordinates
   */
  ceil(): Position {
    return new Position(Math.ceil(this.x), Math.ceil(this.y));
  }

  /**
   * Clamp position within bounds
   */
  clamp(min: Position, max: Position): Position {
    return new Position(
      Math.max(min.x, Math.min(max.x, this.x)),
      Math.max(min.y, Math.min(max.y, this.y))
    );
  }
}

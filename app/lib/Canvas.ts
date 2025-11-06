import type { CanvasDimension } from "./CanvasDimensions";
import { Position } from "./Position";

/**
 * Canvas dimension helper for easy positioning and sizing of shapes.
 * Provides semantic access to canvas boundaries, center points, and
 * relative sizing utilities.
 *
 * @example
 * ```tsx
 * const timeline = new Timeline()
 *   .addScene("demo", 3000, async (api) => {
 *     // Position at center
 *     api.rect(api.canvas.centerX, api.canvas.centerY, 100, 100);
 *
 *     // Use padding
 *     const p = api.canvas.padding(50);
 *     api.rect(p.left, p.top, 100, 100);
 *
 *     // Percentage-based sizing
 *     api.rect(100, 100, api.canvas.percent(50), api.canvas.percent(30));
 *
 *     // Relative to edges
 *     api.circle(api.canvas.right - 100, api.canvas.bottom - 100, 50);
 *   });
 * ```
 */
export class Canvas {
  private dimensions: CanvasDimension;
  private _padding: number = 0;

  constructor(dimensions: CanvasDimension) {
    this.dimensions = dimensions;
  }

  /**
   * Set global padding for the canvas.
   * Once set, all position properties (left, top, right, bottom, centerX, centerY)
   * will automatically respect this padding.
   *
   * @param amount - Padding amount in pixels
   * @returns This Canvas instance for chaining
   *
   * @example
   * ```tsx
   * api.canvas.setPadding(80);
   * // Now all positioning is relative to the padded area
   * api.rect(api.canvas.left, api.canvas.top, 100, 100);
   * // Renders at (80, 80) instead of (0, 0)
   * ```
   */
  setPadding(amount: number): this {
    this._padding = amount;
    return this;
  }

  /**
   * Get the current global padding amount
   */
  getPadding(): number {
    return this._padding;
  }

  // ========================================
  // Position Helpers
  // ========================================

  /**
   * Get the center position of the canvas (respects padding)
   * Shorthand for canvas.pos.center
   *
   * @returns Position at the center of the content area
   *
   * @example
   * ```tsx
   * api.circle(api.canvas.getCenter(), 50);
   * ```
   */
  getCenter(): Position {
    return Position.at(this.centerX, this.centerY);
  }

  /**
   * Create a Position object at specified coordinates
   * Convenience method for Position.at(x, y)
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Position object
   *
   * @example
   * ```tsx
   * const pos = api.canvas.getPosition(100, 200);
   * api.rect(pos, 50, 50);
   *
   * // Can then use Position methods
   * api.circle(pos.moveRight(100), 25);
   * ```
   */
  getPosition(x: number, y: number): Position {
    return Position.at(x, y);
  }

  /**
   * Position helper object providing canvas-relative position constructors.
   * All positions respect global padding if set.
   *
   * @example
   * ```tsx
   * // Named position presets
   * api.rect(api.canvas.pos.center, 100, 100);
   * api.circle(api.canvas.pos.topLeft, 50);
   * api.triangle(api.canvas.pos.bottomRight, 80);
   *
   * // Positions along edges
   * api.rect(api.canvas.pos.top(100), 50, 50);  // x=100, y=top
   * api.circle(api.canvas.pos.left(200), 30);   // x=left, y=200
   * ```
   */
  get pos() {
    const self = this;
    return {
      /**
       * Position at center of content area
       */
      get center(): Position {
        return Position.at(self.centerX, self.centerY);
      },

      /**
       * Position at top-left of content area
       */
      get topLeft(): Position {
        return Position.at(self.left, self.top);
      },

      /**
       * Position at top-right of content area
       */
      get topRight(): Position {
        return Position.at(self.right, self.top);
      },

      /**
       * Position at bottom-left of content area
       */
      get bottomLeft(): Position {
        return Position.at(self.left, self.bottom);
      },

      /**
       * Position at bottom-right of content area
       */
      get bottomRight(): Position {
        return Position.at(self.right, self.bottom);
      },

      /**
       * Position at top edge with specified x coordinate
       */
      top(x: number): Position {
        return Position.at(x, self.top);
      },

      /**
       * Position at bottom edge with specified x coordinate
       */
      bottom(x: number): Position {
        return Position.at(x, self.bottom);
      },

      /**
       * Position at left edge with specified y coordinate
       */
      left(y: number): Position {
        return Position.at(self.left, y);
      },

      /**
       * Position at right edge with specified y coordinate
       */
      right(y: number): Position {
        return Position.at(self.right, y);
      },

      /**
       * Position at center x with specified y coordinate
       */
      centerX(y: number): Position {
        return Position.at(self.centerX, y);
      },

      /**
       * Position at center y with specified x coordinate
       */
      centerY(x: number): Position {
        return Position.at(x, self.centerY);
      },
    };
  }

  // ========================================
  // Direct Dimension Access
  // ========================================

  /**
   * Canvas width in pixels (respects padding)
   */
  get width(): number {
    return this.dimensions.width - this._padding * 2;
  }

  /**
   * Canvas height in pixels (respects padding)
   */
  get height(): number {
    return this.dimensions.height - this._padding * 2;
  }

  /**
   * Raw canvas width in pixels (ignores padding)
   */
  get rawWidth(): number {
    return this.dimensions.width;
  }

  /**
   * Raw canvas height in pixels (ignores padding)
   */
  get rawHeight(): number {
    return this.dimensions.height;
  }

  // ========================================
  // Position Properties - Edges (with padding)
  // ========================================

  /**
   * Left edge of content area (respects global padding)
   * Set padding with setPadding() to automatically offset all positioning
   */
  get left(): number {
    return this._padding;
  }

  /**
   * Top edge of content area (respects global padding)
   * Set padding with setPadding() to automatically offset all positioning
   */
  get top(): number {
    return this._padding;
  }

  /**
   * Right edge of content area (respects global padding)
   * Set padding with setPadding() to automatically offset all positioning
   */
  get right(): number {
    return this.dimensions.width - this._padding;
  }

  /**
   * Bottom edge of content area (respects global padding)
   * Set padding with setPadding() to automatically offset all positioning
   */
  get bottom(): number {
    return this.dimensions.height - this._padding;
  }

  // ========================================
  // Position Properties - Raw Edges (no padding)
  // ========================================

  /**
   * Raw left edge of canvas (x = 0, ignores padding)
   */
  get rawLeft(): number {
    return 0;
  }

  /**
   * Raw top edge of canvas (y = 0, ignores padding)
   */
  get rawTop(): number {
    return 0;
  }

  /**
   * Raw right edge of canvas (x = width, ignores padding)
   */
  get rawRight(): number {
    return this.dimensions.width;
  }

  /**
   * Raw bottom edge of canvas (y = height, ignores padding)
   */
  get rawBottom(): number {
    return this.dimensions.height;
  }

  // ========================================
  // Position Properties - Center (with padding)
  // ========================================

  /**
   * Horizontal center of content area (respects global padding)
   */
  get centerX(): number {
    return this.dimensions.width / 2;
  }

  /**
   * Vertical center of content area (respects global padding)
   */
  get centerY(): number {
    return this.dimensions.height / 2;
  }

  // ========================================
  // Sizing Helpers
  // ========================================

  /**
   * Calculate percentage of content area width or height (respects padding)
   *
   * @param percentage - Percentage value (0-100)
   * @param dimension - Which dimension to use ('width' | 'height'). Defaults to 'width'
   * @returns Pixel value
   *
   * @example
   * ```tsx
   * // 50% of content area width (after padding)
   * api.rect(100, 100, canvas.percent(50), 200);
   *
   * // 30% of content area height (after padding)
   * api.rect(100, 100, 200, canvas.percent(30, 'height'));
   * ```
   */
  percent(percentage: number, dimension: "width" | "height" = "width"): number {
    const base = dimension === "width" ? this.width : this.height;
    return (base * percentage) / 100;
  }

  /**
   * Calculate fraction of content area dimensions (respects padding)
   *
   * @param numerator - Numerator of fraction
   * @param denominator - Denominator of fraction
   * @param dimension - Which dimension to use ('width' | 'height'). Defaults to 'width'
   * @returns Pixel value
   *
   * @example
   * ```tsx
   * // 1/3 of content area width (after padding)
   * api.rect(100, 100, canvas.fraction(1, 3), 200);
   *
   * // 2/5 of content area height (after padding)
   * api.rect(100, 100, 200, canvas.fraction(2, 5, 'height'));
   * ```
   */
  fraction(numerator: number, denominator: number, dimension: "width" | "height" = "width"): number {
    const base = dimension === "width" ? this.width : this.height;
    return (base * numerator) / denominator;
  }

  // ========================================
  // Spacing Helpers
  // ========================================

  /**
   * Create padding/inset from all edges
   *
   * @param amount - Padding amount in pixels
   * @returns Object with adjusted coordinates
   *
   * @example
   * ```tsx
   * const p = canvas.padding(50);
   * api.rect(p.left, p.top, 100, 100); // 50px from top-left
   * api.circle(p.right, p.bottom, 50); // 50px from bottom-right
   * ```
   */
  padding(amount: number) {
    return {
      left: amount,
      top: amount,
      right: this.dimensions.width - amount,
      bottom: this.dimensions.height - amount,
      centerX: this.dimensions.width / 2,
      centerY: this.dimensions.height / 2,
      width: this.dimensions.width - amount * 2,
      height: this.dimensions.height - amount * 2,
    };
  }

  /**
   * Alias for padding() - create margin from all edges
   *
   * @param amount - Margin amount in pixels
   * @returns Object with adjusted coordinates
   */
  margin(amount: number) {
    return this.padding(amount);
  }

  /**
   * Create inset with individual control per side (like CSS inset)
   *
   * @param top - Top inset in pixels
   * @param right - Right inset (defaults to top if omitted)
   * @param bottom - Bottom inset (defaults to top if omitted)
   * @param left - Left inset (defaults to right if omitted)
   * @returns Object with adjusted coordinates
   *
   * @example
   * ```tsx
   * // Same inset on all sides
   * const bounds = canvas.inset(20);
   *
   * // Vertical 20, horizontal 40
   * const bounds = canvas.inset(20, 40);
   *
   * // Individual sides
   * const bounds = canvas.inset(10, 20, 30, 40);
   * ```
   */
  inset(top: number, right?: number, bottom?: number, left?: number) {
    const r = right ?? top;
    const b = bottom ?? top;
    const l = left ?? right ?? top;

    return {
      left: l,
      top: top,
      right: this.dimensions.width - r,
      bottom: this.dimensions.height - b,
      centerX: this.dimensions.width / 2,
      centerY: this.dimensions.height / 2,
      width: this.dimensions.width - l - r,
      height: this.dimensions.height - top - b,
    };
  }

  // ========================================
  // Grid Helpers
  // ========================================

  /**
   * Divide canvas into a grid and get cell coordinates
   *
   * @param cols - Number of columns
   * @param rows - Number of rows
   * @returns Grid helper object
   *
   * @example
   * ```tsx
   * const grid = canvas.grid(3, 3);
   *
   * // Position shape in center cell (1, 1)
   * const center = grid.cell(1, 1);
   * api.rect(center.x, center.y, center.width, center.height);
   *
   * // Position in top-right cell (2, 0)
   * const topRight = grid.cell(2, 0);
   * ```
   */
  grid(cols: number, rows: number) {
    const cellWidth = this.dimensions.width / cols;
    const cellHeight = this.dimensions.height / rows;

    return {
      cellWidth,
      cellHeight,
      /**
       * Get coordinates for a specific grid cell
       * @param col - Column index (0-based)
       * @param row - Row index (0-based)
       */
      cell: (col: number, row: number) => ({
        x: col * cellWidth,
        y: row * cellHeight,
        centerX: col * cellWidth + cellWidth / 2,
        centerY: row * cellHeight + cellHeight / 2,
        width: cellWidth,
        height: cellHeight,
        left: col * cellWidth,
        top: row * cellHeight,
        right: (col + 1) * cellWidth,
        bottom: (row + 1) * cellHeight,
      }),
    };
  }

  // ========================================
  // Factory Method
  // ========================================

  /**
   * Create a new Canvas helper instance
   *
   * @param dimensions - Canvas dimensions object
   * @returns Canvas helper instance
   */
  static create(dimensions: CanvasDimension): Canvas {
    return new Canvas(dimensions);
  }
}

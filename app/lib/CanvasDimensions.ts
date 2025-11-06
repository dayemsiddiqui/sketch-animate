/**
 * Canvas Dimension Presets for Sketch Animate
 *
 * Provides pre-defined canvas dimensions optimized for various platforms and formats.
 * Users can use these presets with the spread operator or override with custom dimensions.
 *
 * @example
 * ```typescript
 * import { CanvasDimensions } from "~/lib/CanvasDimensions";
 *
 * // Use a preset with spread operator
 * <canvas ref={canvasRef} {...CanvasDimensions.instagramStory} />
 *
 * // Custom dimensions (always possible)
 * <canvas ref={canvasRef} width={500} height={800} />
 *
 * // Mix preset with other props
 * <canvas
 *   ref={canvasRef}
 *   {...CanvasDimensions.square}
 *   className="border rounded-lg"
 * />
 * ```
 */

export type CanvasDimension = {
  width: number;
  height: number;
};

export type CanvasDimensionCollection = {
  [presetName: string]: CanvasDimension;
};

/**
 * Pre-defined canvas dimensions for popular social media platforms and formats.
 * All dimensions are in pixels and match platform specifications.
 */
export const CanvasDimensions = {
  /**
   * Instagram Story format (9:16 aspect ratio)
   * - Dimensions: 1080 x 1920 pixels
   * - Full-screen vertical format
   */
  instagramStory: { width: 1080, height: 1920 },

  /**
   * Instagram Reel format (9:16 aspect ratio)
   * - Dimensions: 1080 x 1920 pixels
   * - Vertical short-form video
   */
  instagramReel: { width: 1080, height: 1920 },

  /**
   * Facebook Reel format (9:16 aspect ratio)
   * - Dimensions: 1080 x 1920 pixels
   * - Vertical short-form video
   */
  facebookReel: { width: 1080, height: 1920 },

  /**
   * YouTube Video format (16:9 aspect ratio)
   * - Dimensions: 1920 x 1080 pixels
   * - Standard widescreen landscape format
   */
  youtubeVideo: { width: 1920, height: 1080 },

  /**
   * YouTube Shorts format (9:16 aspect ratio)
   * - Dimensions: 1080 x 1920 pixels
   * - Vertical short-form video
   */
  youtubeShorts: { width: 1080, height: 1920 },

  /**
   * Square format (1:1 aspect ratio)
   * - Dimensions: 1080 x 1080 pixels
   * - Perfect for Instagram posts, profile pictures
   */
  square: { width: 1080, height: 1080 },

  /**
   * Portrait format (4:5 aspect ratio)
   * - Dimensions: 1080 x 1350 pixels
   * - Ideal for Instagram feed posts
   */
  portrait: { width: 1080, height: 1350 },

  /**
   * Landscape format (1.91:1 aspect ratio)
   * - Dimensions: 1200 x 628 pixels
   * - Common for Facebook/Twitter link previews
   */
  landscape: { width: 1200, height: 628 },

  /**
   * Small square format (1:1 aspect ratio)
   * - Dimensions: 400 x 400 pixels
   * - Good for demos, small widgets, or testing
   */
  smallSquare: { width: 400, height: 400 },

  /**
   * TikTok format (9:16 aspect ratio)
   * - Dimensions: 1080 x 1920 pixels
   * - Vertical short-form video
   */
  tiktok: { width: 1080, height: 1920 },

  /**
   * Twitter/X Post format (16:9 aspect ratio)
   * - Dimensions: 1200 x 675 pixels
   * - Landscape video format
   */
  twitter: { width: 1200, height: 675 },
} as const satisfies CanvasDimensionCollection;

/**
 * Creates a custom canvas dimension object
 *
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns A dimension object that can be spread onto a canvas element
 *
 * @example
 * ```typescript
 * const customDim = createDimensions(800, 600);
 * <canvas ref={canvasRef} {...customDim} />
 * ```
 */
export function createDimensions(width: number, height: number): CanvasDimension {
  return { width, height };
}

/**
 * Scales canvas dimensions by a factor while maintaining aspect ratio
 *
 * @param dimensions - The original dimensions to scale
 * @param factor - Scale factor (e.g., 0.5 for half size, 2 for double size)
 * @returns New dimension object with scaled values
 *
 * @example
 * ```typescript
 * // Create a half-size Instagram Story canvas
 * const scaled = scale(CanvasDimensions.instagramStory, 0.5);
 * <canvas ref={canvasRef} {...scaled} /> // 540 x 960
 * ```
 */
export function scale(dimensions: CanvasDimension, factor: number): CanvasDimension {
  return {
    width: Math.round(dimensions.width * factor),
    height: Math.round(dimensions.height * factor),
  };
}

/**
 * Calculates the aspect ratio of given dimensions
 *
 * @param dimensions - Canvas dimensions
 * @returns Aspect ratio as a number (width / height)
 *
 * @example
 * ```typescript
 * aspectRatio(CanvasDimensions.youtubeVideo) // Returns 1.777... (16:9)
 * aspectRatio(CanvasDimensions.square) // Returns 1 (1:1)
 * ```
 */
export function aspectRatio(dimensions: CanvasDimension): number {
  return dimensions.width / dimensions.height;
}

/**
 * Checks if dimensions are in portrait orientation
 *
 * @param dimensions - Canvas dimensions
 * @returns True if height > width
 */
export function isPortrait(dimensions: CanvasDimension): boolean {
  return dimensions.height > dimensions.width;
}

/**
 * Checks if dimensions are in landscape orientation
 *
 * @param dimensions - Canvas dimensions
 * @returns True if width > height
 */
export function isLandscape(dimensions: CanvasDimension): boolean {
  return dimensions.width > dimensions.height;
}

/**
 * Checks if dimensions are square
 *
 * @param dimensions - Canvas dimensions
 * @returns True if width === height
 */
export function isSquare(dimensions: CanvasDimension): boolean {
  return dimensions.width === dimensions.height;
}

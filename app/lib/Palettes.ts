/**
 * Color Palette System for Sketch Animate
 *
 * Provides pre-defined color palettes for easy color selection in animations.
 *
 * @example
 * ```typescript
 * import { Palettes } from "~/lib/Palettes";
 *
 * // Use colors directly from palettes
 * api.rect(80, 120, 100, 100, {
 *   stroke: Palettes.pastel.purple,
 *   fill: Palettes.summerVibes.coral
 * });
 *
 * // Or assign a palette to a variable
 * const colors = Palettes.retro;
 * api.circle(200, 200, 50, {
 *   stroke: colors.orange,
 *   fill: colors.yellow
 * });
 * ```
 */

export type ColorPalette = {
  [colorName: string]: string;
};

export type PaletteCollection = {
  [paletteName: string]: ColorPalette;
};

/**
 * Pre-defined color palettes for sketch animations.
 * Each palette contains named colors as RGB/RGBA strings.
 */
export const Palettes = {
  /**
   * Soft, light colors with high luminosity (3 colors)
   */
  pastel: {
    purple: "rgb(221, 214, 254)",
    pink: "rgb(252, 231, 243)",
    blue: "rgb(219, 234, 254)",
  },

  /**
   * Warm, nostalgic 80s/90s inspired colors (4 colors)
   */
  retro: {
    orange: "rgb(251, 146, 60)",
    yellow: "rgb(250, 204, 21)",
    teal: "rgb(20, 184, 166)",
    coral: "rgb(248, 113, 113)",
  },

  /**
   * Vibrant, saturated colors for maximum impact (5 colors)
   */
  bold: {
    red: "rgb(239, 68, 68)",
    orange: "rgb(249, 115, 22)",
    green: "rgb(34, 197, 94)",
    blue: "rgb(59, 130, 246)",
    purple: "rgb(168, 85, 247)",
  },

  /**
   * Summer-inspired warm and cheerful colors (4 colors)
   */
  summerVibes: {
    coral: "rgb(251, 146, 120)",
    yellow: "rgb(253, 224, 71)",
    turquoise: "rgb(94, 234, 212)",
    pink: "rgb(251, 207, 232)",
  },

  /**
   * Earth tones and natural colors (4 colors)
   */
  nature: {
    brown: "rgb(120, 113, 108)",
    moss: "rgb(132, 204, 22)",
    green: "rgb(34, 197, 94)",
    clay: "rgb(217, 119, 6)",
  },

  /**
   * Tailwind CSS inspired color palette (5 colors)
   */
  tailwind: {
    slate: "rgb(100, 116, 139)",
    blue: "rgb(59, 130, 246)",
    purple: "rgb(168, 85, 247)",
    pink: "rgb(236, 72, 153)",
    emerald: "rgb(16, 185, 129)",
  },

  /**
   * Monochrome grayscale palette (5 colors)
   */
  mono: {
    black: "rgb(0, 0, 0)",
    darkGray: "rgb(64, 64, 64)",
    gray: "rgb(115, 115, 115)",
    lightGray: "rgb(212, 212, 212)",
    white: "rgb(255, 255, 255)",
  },
} as const satisfies PaletteCollection;

/**
 * Helper function to parse RGB/RGBA color strings
 */
function parseRgb(color: string): { r: number; g: number; b: number; a: number } {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!rgbaMatch) {
    throw new Error(`Invalid color format: ${color}`);
  }
  return {
    r: parseInt(rgbaMatch[1]),
    g: parseInt(rgbaMatch[2]),
    b: parseInt(rgbaMatch[3]),
    a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
  };
}

/**
 * Lightens a color by a given amount (0-1)
 *
 * @param color - RGB or RGBA color string
 * @param amount - Amount to lighten (0-1), where 0.5 = 50% lighter
 *
 * @example
 * ```typescript
 * lighten(Palettes.bold.blue, 0.3) // 30% lighter blue
 * ```
 */
export function lighten(color: string, amount: number): string {
  const { r, g, b, a } = parseRgb(color);
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);
  return a < 1 ? `rgba(${newR}, ${newG}, ${newB}, ${a})` : `rgb(${newR}, ${newG}, ${newB})`;
}

/**
 * Darkens a color by a given amount (0-1)
 *
 * @param color - RGB or RGBA color string
 * @param amount - Amount to darken (0-1), where 0.5 = 50% darker
 *
 * @example
 * ```typescript
 * darken(Palettes.pastel.pink, 0.2) // 20% darker pink
 * ```
 */
export function darken(color: string, amount: number): string {
  const { r, g, b, a } = parseRgb(color);
  const newR = Math.round(r * (1 - amount));
  const newG = Math.round(g * (1 - amount));
  const newB = Math.round(b * (1 - amount));
  return a < 1 ? `rgba(${newR}, ${newG}, ${newB}, ${a})` : `rgb(${newR}, ${newG}, ${newB})`;
}

/**
 * Adds or changes the alpha (transparency) of a color
 *
 * @param color - RGB or RGBA color string
 * @param alpha - Alpha value (0-1), where 0 = fully transparent, 1 = fully opaque
 *
 * @example
 * ```typescript
 * withAlpha(Palettes.nature.green, 0.5) // 50% transparent green
 * ```
 */
export function withAlpha(color: string, alpha: number): string {
  const { r, g, b } = parseRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Creates a custom color palette
 *
 * @param colors - Object with color names as keys and RGB/RGBA strings as values
 * @returns A custom color palette
 *
 * @example
 * ```typescript
 * const myPalette = createPalette({
 *   primary: "rgb(100, 150, 200)",
 *   secondary: "rgb(200, 100, 150)",
 *   accent: "rgb(255, 200, 0)"
 * });
 *
 * api.rect(0, 0, 100, 100, { stroke: myPalette.primary });
 * ```
 */
export function createPalette(colors: ColorPalette): ColorPalette {
  return colors;
}

/**
 * Color utility functions for partner colors and theming
 */

/**
 * Vibrant, saturated colors inspired by Linear
 * Used for partner color selection
 */
export const VIBRANT_COLORS = [
  "#3B82F6", // Blue
  "#0EA5E9", // Sky Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#F97316", // Orange
  "#EF4444", // Red
  "#EC4899", // Pink
  "#A855F7", // Purple
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#D946EF", // Fuchsia
] as const;

export type VibrantColor = (typeof VIBRANT_COLORS)[number];

/**
 * Check if a string is a valid hex color
 */
export const isValidHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

/**
 * Get a random vibrant color
 */
export const getRandomVibrantColor = (): VibrantColor => {
  return VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
};

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
};

/**
 * Get contrasting text color (black or white) for a background color
 */
export const getContrastColor = (hexColor: string): "#000000" | "#FFFFFF" => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#FFFFFF";

  // Calculate luminance
  const luminance =
    (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Return black text for light backgrounds, white for dark
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

/**
 * Darken a hex color by a percentage (0-100)
 */
export const darkenColor = (hexColor: string, percent: number): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  const factor = 1 - percent / 100;
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  );
};

/**
 * Lighten a hex color by a percentage (0-100)
 */
export const lightenColor = (hexColor: string, percent: number): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  const factor = 1 + percent / 100;
  return rgbToHex(
    Math.min(255, Math.round(rgb.r * factor)),
    Math.min(255, Math.round(rgb.g * factor)),
    Math.min(255, Math.round(rgb.b * factor))
  );
};

/**
 * Get a semi-transparent version of a color (for backgrounds)
 */
export const colorWithOpacity = (hexColor: string, opacity: number): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Find the closest vibrant color to a given hex color
 */
export const findClosestVibrantColor = (
  hexColor: string
): VibrantColor => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return VIBRANT_COLORS[0];

  let closest: VibrantColor = VIBRANT_COLORS[0];
  let closestDistance = Infinity;

  for (const color of VIBRANT_COLORS) {
    const colorRgb = hexToRgb(color);
    if (!colorRgb) continue;

    // Calculate Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb.r - colorRgb.r, 2) +
      Math.pow(rgb.g - colorRgb.g, 2) +
      Math.pow(rgb.b - colorRgb.b, 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = color;
    }
  }

  return closest;
};

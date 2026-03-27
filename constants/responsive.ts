import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design dimensions (iPhone 14 Pro)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Scale a value based on screen width relative to base design.
 * Use for horizontal dimensions (padding, margins, widths).
 */
export function wp(size: number): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale a value based on screen height relative to base design.
 * Use for vertical dimensions (top/bottom spacing, heights).
 */
export function hp(size: number): number {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale font sizes with a moderate scaling factor.
 * Uses width-based scaling capped at 1.15x to prevent oversized text on tablets.
 */
export function fp(size: number): number {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.15);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Whether the device is a small screen (iPhone SE, etc.)
 */
export const isSmallScreen = SCREEN_WIDTH < 375;

/**
 * Whether the device is a large screen (iPad, tablet)
 */
export const isLargeScreen = SCREEN_WIDTH >= 768;

/**
 * Get the number of columns for grid layouts based on screen width.
 */
export function getGridColumns(minItemWidth: number = 160): number {
  return Math.max(2, Math.floor(SCREEN_WIDTH / minItemWidth));
}

export { SCREEN_WIDTH, SCREEN_HEIGHT };

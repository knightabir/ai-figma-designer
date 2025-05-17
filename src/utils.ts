import { EffectSpec } from './types';

/**
 * Convert hex color to RGB
 * @param hex Hex color string (e.g. "#4285F4" or "4285F4")
 * @returns RGB color object with r, g, b values between 0 and 1
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
}

/**
 * Create a paint object with the given color
 */
export function createPaint(color: string | RGB): SolidPaint {
  const rgb = typeof color === 'string' ? hexToRgb(color) : color;
  return {
    type: 'SOLID',
    color: rgb,
    visible: true,
    opacity: 1
  };
}

/**
 * Create an effect with the given spec
 */
export function createEffect(effectSpec: EffectSpec): Effect {
  return {
    type: effectSpec.type,
    color: hexToRgb(effectSpec.color),
    offset: effectSpec.offset,
    radius: effectSpec.blur,
    spread: effectSpec.spread || 0,
    visible: true,
    blendMode: "NORMAL"
  } as Effect;
}

/**
 * Clone an object using JSON serialization
 */
export function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

/**
 * Ensure color string starts with # and has valid RGB values
 */
export function ensureValidColor(color: string): string {
  if (!color.startsWith('#')) {
    return '#000000';
  }
  // Remove alpha channel if present
  return color.length > 7 ? color.substring(0, 7) : color;
}

/**
 * Clamp a number between min and max values
 */
export function clampNumber(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
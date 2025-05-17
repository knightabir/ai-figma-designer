import { EffectSpec } from './types';

/**
 * Convert hex color to RGB
 * @param hex Hex color string (e.g. "#4285F4" or "4285F4")
 * @returns RGB color object with r, g, b values between 0 and 1
 */
export function hexToRgb(hex: string) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
}

export function hexToRgba(hex: string): RGBA {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const a = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return { r, g, b, a };
}

/**
 * Clone an object using JSON serialization
 * @param val Object to clone
 * @returns Cloned object
 */
export function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

export function createEffect(effectSpec: EffectSpec): Effect {
  const color = hexToRgba(effectSpec.color);
  return {
    type: effectSpec.type,
    color,
    offset: effectSpec.offset,
    radius: effectSpec.blur,
    spread: effectSpec.spread || 0,
    visible: true,
    blendMode: "NORMAL"
  } as Effect;
}

export function ensureValidColor(color: string): RGBA {
  if (!color.startsWith('#')) {
    // Default to black if invalid color
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return hexToRgba(color);
}

export function clampNumber(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function createDefaultFill(color: string = '#000000'): Paint {
  return {
    type: 'SOLID',
    color: hexToRgba(color),
    visible: true,
    opacity: 1,
    blendMode: "NORMAL"
  } as Paint;
}

export function createDefaultStroke(color: string = '#000000', weight: number = 1): Paint {
  return {
    type: 'SOLID',
    color: hexToRgba(color),
    visible: true,
    opacity: 1,
    blendMode: "NORMAL"
  } as Paint;
}
/**
 * Color utilities for Figma plugin
 */

/**
 * Convert color to RGB object
 */
export function toRGB(color: RGB | string | undefined): RGB {
  if (!color) return { r: 0, g: 0, b: 0 };
  
  if (typeof color === 'string') {
    const hex = color.replace(/^#/, '');
    const fullHex = hex.length === 3 
      ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] 
      : hex;
    
    const r = parseInt(fullHex.substring(0, 2), 16) / 255;
    const g = parseInt(fullHex.substring(2, 4), 16) / 255;
    const b = parseInt(fullHex.substring(4, 6), 16) / 255;
    
    return {
      r: Math.max(0, Math.min(1, r || 0)),
      g: Math.max(0, Math.min(1, g || 0)),
      b: Math.max(0, Math.min(1, b || 0))
    };
  }
  
  return {
    r: Math.max(0, Math.min(1, color.r)),
    g: Math.max(0, Math.min(1, color.g)),
    b: Math.max(0, Math.min(1, color.b))
  };
}

/**
 * Convert hex color to RGB object (for backward compatibility)
 */
export function hexToRGBObject(color: string | RGB): RGB {
  return toRGB(color);
}

/**
 * Create a valid paint object
 */
export function createValidPaint(color: RGB | string | undefined): SolidPaint {
  return {
    type: "SOLID",
    color: toRGB(color),
    opacity: 1,
    visible: true
  };
}

/**
 * Get color from paint or fallback
 */
export function getPaintColor(paint: Paint | undefined | null, fallback: RGB): RGB {
  if (paint && paint.type === "SOLID") {
    return paint.color;
  }
  return fallback;
}

/**
 * RGB color tokens
 */
export const RGB_TOKENS = {
  primary: toRGB("#1A73F2"),
  secondary: toRGB("#999999"),
  background: toRGB("#FAFAFA"),
  text: toRGB("#1A1A1A"),
  border: toRGB("#CCCCCC")
};

/**
 * Component specification interface
 */
export interface ComponentSpec {
  name: string;
  layout: "VERTICAL" | "HORIZONTAL" | "NONE";
  background?: BackgroundSpec;
  elements: ElementSpec[];
}

/**
 * Background specification interface
 */
export interface BackgroundSpec {
  type: "rectangle";
  properties: {
    fill: string;
    opacity?: number;
    cornerRadius?: number;
    effect?: EffectSpec;
  };
}

/**
 * Effect specification interface
 */
export interface EffectSpec {
  type: "DROP_SHADOW";
  color: string;
  offset: { x: number; y: number };
  spread?: number;
  blur: number;
}

/**
 * Responsive properties interface
 */
export interface ResponsiveProps {
  mobile?: Partial<ElementProperties>;
  tablet?: Partial<ElementProperties>;
  desktop?: Partial<ElementProperties>;
}

/**
 * Element specification interface
 */
export interface ElementSpec {
  type: "button" | "text" | "rectangle" | "input" | "icon" | "image";
  name: string;
  properties: ElementProperties;
  responsive?: ResponsiveProps;
}

/**
 * Element properties interface
 */
export interface ElementProperties {
  // Common properties
  width?: number;
  height?: number;
  opacity?: number;
  cornerRadius?: number;
  fills?: Paint[];
  strokes?: Paint[];
  effects?: EffectSpec[];
  
  // Text-specific properties
  text?: string;
  characters?: string;
  fontSize?: number;
  fontName?: FontName;
  textColor?: string;
  textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT";
  textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
  fontWeight?: "regular" | "medium" | "bold";
  
  // Layout properties
  layoutAlign?: "STRETCH" | "INHERIT";
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  
  // Input properties
  placeholder?: string;
  
  // Icon/Image properties
  size?: number;
}

/**
 * UI configuration interface
 */
export interface UIConfig {
  width: number;
  height: number;
}

/**
 * Message types
 */
export type MessageType = 
  | { type: 'generate-component', apiKey: string, prompt: string }
  | { type: 'close' };
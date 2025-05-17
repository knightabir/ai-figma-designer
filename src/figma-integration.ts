import { ComponentSpec, ElementSpec } from "./types";
import { createEffect, clone } from "./utils";
import {
  RGB_TOKENS,
  toRGB,
  getPaintColor,
  hexToRGBObject,
} from "./color-utils";

// Extend ElementProperties to include iconName
import type { ElementProperties as ImportedElementProperties } from "./types";
interface ElementProperties extends ImportedElementProperties {
  iconName?: string;
}

/**
 * Default design tokens
 */
const DESIGN_TOKENS = {
  colors: RGB_TOKENS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
  },
};

// Icon definitions
const ICON_PATHS: { [key: string]: string } = {
  home: "M12 2L2 12H4V22H20V12H22L12 2ZM6 12V20H10V15H14V20H18V12L12 6L6 12Z",
  user: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z",
};

/**
 * Create a valid paint object
 */
function createValidPaint(color: RGB | string | undefined): SolidPaint {
  const rgbColor = color ? toRGB(color) : { r: 0, g: 0, b: 0 };
  return {
    type: "SOLID",
    color: rgbColor,
    opacity: 1,
    visible: true,
  };
}

/**
 * Check if paint is SolidPaint
 */
function isSolidPaint(paint: Paint): paint is SolidPaint {
  return paint.type === "SOLID";
}

/**
 * Convert specification fill to SolidPaint
 */
function convertSpecFillToPaint(fill: {
  type: "SOLID";
  color: string;
}): SolidPaint {
  return createValidPaint(fill.color);
}

/**
 * Create Figma nodes
 */
export async function createFigmaNodes(componentSpec: ComponentSpec) {
  const frame = figma.createFrame();
  frame.name = componentSpec.name;

  frame.layoutMode = componentSpec.layout || "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.paddingLeft = DESIGN_TOKENS.spacing.md;
  frame.paddingRight = DESIGN_TOKENS.spacing.md;
  frame.paddingTop = DESIGN_TOKENS.spacing.md;
  frame.paddingBottom = DESIGN_TOKENS.spacing.md;
  frame.itemSpacing = DESIGN_TOKENS.spacing.sm;
  frame.fills = [createValidPaint(DESIGN_TOKENS.colors.background)];

  for (const element of componentSpec.elements) {
    try {
      const node = await createElement(element);
      if (node) {
        frame.appendChild(node);
      }
    } catch (error: unknown) {
      figma.notify(
        `⚠️ Error creating element ${element.name}: ${(error as Error).message}`
      );
    }
  }

  figma.viewport.scrollAndZoomIntoView([frame]);
  return frame;
}

/**
 * Create individual element
 */
async function createElement(element: ElementSpec): Promise<SceneNode | null> {
  try {
    switch (element.type.toLowerCase()) {
      case "frame":
        return await createFrame(element);
      case "container":
        return await createContainer(element);
      case "button":
        return await createButton(element);
      case "text":
        return await createText(element);
      case "rectangle":
        return createRectangle(element);
      case "input":
        return await createInputField(element);
      case "icon":
        return await createIcon(element);
      case "image":
        return createImagePlaceholder(element);
      case "checkbox":
        return await createCheckbox(element);
      case "link":
        return await createLink(element);
      default:
        figma.notify(`⚠️ Unknown element type: ${element.type}`);
        return null;
    }
  } catch (error: unknown) {
    throw new Error(
      `Failed to create ${element.type}: ${(error as Error).message}`
    );
  }
}

/**
 * Create button
 */
async function createButton(element: ElementSpec): Promise<SceneNode> {
  const button = figma.createFrame();
  button.name = element.name;

  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.paddingLeft = DESIGN_TOKENS.spacing.md;
  button.paddingRight = DESIGN_TOKENS.spacing.md;
  button.paddingTop = DESIGN_TOKENS.spacing.sm;
  button.paddingBottom = DESIGN_TOKENS.spacing.sm;
  button.cornerRadius =
    element.properties?.cornerRadius || DESIGN_TOKENS.radius.medium;

  const fill = element.properties?.fills?.[0];
  button.fills = [
    fill
      ? convertSpecFillToPaint(fill)
      : createValidPaint(DESIGN_TOKENS.colors.primary),
  ];
  button.strokes = [createValidPaint(DESIGN_TOKENS.colors.border)];
  button.strokeWeight = 1;

  button.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 2 },
      radius: 4,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  if (element.properties) {
    if (element.properties.width)
      button.resize(element.properties.width, button.height);
    if (element.properties.height)
      button.resize(button.width, element.properties.height || 40);
  }

  if (element.properties?.text) {
    const text = figma.createText();
    await loadFonts();
    text.characters = element.properties.text;
    text.fontSize =
      element.properties.fontSize || DESIGN_TOKENS.fontSizes.medium;
    text.fills = [createValidPaint(element.properties.textColor || "#FFFFFF")];
    text.fontName = { family: "Inter", style: "Medium" };
    button.appendChild(text);
  }

  return button;
}

/**
 * Create text
 */
async function createText(element: ElementSpec): Promise<SceneNode> {
  const text = figma.createText();
  text.name = element.name;

  await loadFonts();

  if (element.properties) {
    if (element.properties.text) text.characters = element.properties.text;
    text.fontSize =
      element.properties.fontSize || DESIGN_TOKENS.fontSizes.medium;
    text.fills = [
      createValidPaint(
        element.properties.textColor || DESIGN_TOKENS.colors.text
      ),
    ];
    if (element.properties.width)
      text.resize(element.properties.width, text.height);

    const fontStyle =
      element.properties.fontWeight === "bold" ? "Bold" : "Regular";
    await figma.loadFontAsync({ family: "Inter", style: fontStyle });
    text.fontName = { family: "Inter", style: fontStyle };
  }

  return text;
}

/**
 * Create rectangle
 */
function createRectangle(element: ElementSpec): SceneNode {
  const rect = figma.createRectangle();
  rect.name = element.name;

  if (element.properties) {
    if (element.properties.width)
      rect.resize(element.properties.width, rect.height);
    if (element.properties.height)
      rect.resize(rect.width, element.properties.height);
    rect.cornerRadius =
      element.properties.cornerRadius || DESIGN_TOKENS.radius.medium;
    const fill = element.properties.fills?.[0];
    rect.fills = [
      fill
        ? convertSpecFillToPaint(fill)
        : createValidPaint(DESIGN_TOKENS.colors.background),
    ];
  }

  return rect;
}

/**
 * Create input field
 */
async function createInputField(element: ElementSpec): Promise<SceneNode> {
  const frame = figma.createFrame();
  frame.name = element.name;
  frame.layoutMode = "HORIZONTAL";
  frame.paddingLeft = DESIGN_TOKENS.spacing.sm;
  frame.paddingRight = DESIGN_TOKENS.spacing.sm;
  frame.paddingTop = DESIGN_TOKENS.spacing.xs;
  frame.paddingBottom = DESIGN_TOKENS.spacing.xs;

  frame.cornerRadius =
    element.properties?.cornerRadius || DESIGN_TOKENS.radius.small;
  frame.resize(
    element.properties?.width || 240,
    element.properties?.height || 40
  );
  frame.fills = [createValidPaint("#FFFFFF")];
  frame.strokes = [createValidPaint(DESIGN_TOKENS.colors.border)];
  frame.strokeWeight = 1;
  frame.effects = [
    {
      type: "INNER_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.05 },
      offset: { x: 0, y: 1 },
      radius: 2,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  if (element.properties?.placeholder) {
    const text = figma.createText();
    await loadFonts();
    text.characters = element.properties.placeholder;
    text.opacity = 0.5;
    text.fontSize = DESIGN_TOKENS.fontSizes.medium;
    text.fills = [createValidPaint(DESIGN_TOKENS.colors.text)];
    frame.appendChild(text);
  }

  return frame;
}

/**
 * Create icon
 */
async function createIcon(element: ElementSpec): Promise<SceneNode> {
  const icon = figma.createFrame();
  icon.name = element.name;
  const size = element.properties?.size || 24;
  icon.resize(size, size);
  icon.layoutMode = "NONE";

  const vector = figma.createVector();
  const iconName = element.properties?.iconName?.toLowerCase() || "home";
  vector.vectorPaths = [
    {
      windingRule: "NONZERO",
      data: ICON_PATHS[iconName] || ICON_PATHS.home,
    },
  ];

  vector.resize(size, size);
  const fill = element.properties?.fills?.[0];
  vector.fills = [
    fill
      ? convertSpecFillToPaint(fill)
      : createValidPaint(DESIGN_TOKENS.colors.text),
  ];

  icon.appendChild(vector);
  return icon;
}

/**
 * Create image placeholder
 */
function createImagePlaceholder(element: ElementSpec): SceneNode {
  const frame = figma.createFrame();
  frame.name = element.name;

  frame.resize(
    element.properties?.width || 200,
    element.properties?.height || 150
  );
  frame.fills = [createValidPaint(DESIGN_TOKENS.colors.background)];
  frame.cornerRadius = DESIGN_TOKENS.radius.medium;

  const icon = figma.createVector();
  icon.vectorPaths = [
    {
      windingRule: "NONZERO",
      data: "M4 3H20V21H4V3ZM6 5V19H18V5H6ZM16 7H8V9H16V7ZM16 11H8V13H16V11ZM16 15H8V17H16V15Z",
    },
  ];
  icon.resize(24, 24);
  icon.x = (frame.width - 24) / 2;
  icon.y = (frame.height - 24) / 2;
  icon.fills = [createValidPaint(DESIGN_TOKENS.colors.text)];
  icon.opacity = 0.3;

  frame.appendChild(icon);
  return frame;
}

/**
 * Load fonts
 */
export async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
  ]);
}

/**
 * Convert RGB to hex
 */
function rgbToHex(color: RGB): string {
  const r = Math.round(color.r * 255)
    .toString(16)
    .padStart(2, "0");
  const g = Math.round(color.g * 255)
    .toString(16)
    .padStart(2, "0");
  const b = Math.round(color.b * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
}

/**
 * Get color from paint
 */
function getColorFromPaint(paint: Paint | null | undefined): string {
  if (paint && isSolidPaint(paint)) {
    return rgbToHex(paint.color);
  }
  return "#000000";
}

/**
 * Validate fills
 */
function isValidFills(fills: any): fills is ReadonlyArray<Paint> | Paint[] {
  return Array.isArray(fills) && fills.length > 0 && isSolidPaint(fills[0]);
}

/**
 * Get first paint
 */
function getFirstPaint(
  fills: ReadonlyArray<Paint> | Paint[] | undefined | null
): Paint | null {
  if (!fills || !isValidFills(fills)) return null;
  return fills[0];
}

/**
 * Convert fills to hex
 */
function getFillColor(
  fills: ReadonlyArray<Paint> | Paint[] | undefined | null
): string {
  const paint = getFirstPaint(fills);
  if (paint && isSolidPaint(paint)) {
    return rgbToHex(paint.color);
  }
  return "#000000";
}

/**
 * Extract component spec
 */
export async function getComponentSpec(node: BaseNode): Promise<ComponentSpec> {
  if (node.type !== "FRAME" && node.type !== "COMPONENT") {
    throw new Error("Selected node must be a frame or component");
  }

  const frame = node as FrameNode;
  const spec: ComponentSpec = {
    name: frame.name,
    layout: frame.layoutMode || "VERTICAL",
    elements: [],
  };

  for (const child of frame.children) {
    const elementSpec = await extractElementSpec(child);
    if (elementSpec) {
      spec.elements.push(elementSpec);
    }
  }

  return spec;
}

/**
 * Extract element spec
 */
async function extractElementSpec(
  node: SceneNode
): Promise<ElementSpec | null> {
  const baseSpec: ElementSpec = {
    name: node.name,
    type: "rectangle",
    properties: {},
  };

  switch (node.type) {
    case "FRAME": {
      const frame = node as FrameNode;
      if (frame.name.toLowerCase().includes("button")) {
        const textChild = frame.findChild(
          (n) => n.type === "TEXT"
        ) as TextNode | null;
        const frameFills = Array.isArray(frame.fills) ? frame.fills : [];
        const textFills =
          textChild && Array.isArray(textChild.fills) ? textChild.fills : [];

        baseSpec.type = "button";
        baseSpec.properties = {
          text: textChild?.characters || "",
          width: frame.width,
          height: frame.height,
          cornerRadius:
            typeof frame.cornerRadius === "number"
              ? frame.cornerRadius
              : DESIGN_TOKENS.radius.medium,
          fills: frameFills.map((fill) => ({
            type: "SOLID",
            color: isSolidPaint(fill) ? rgbToHex(fill.color) : "#000000",
          })),
          textColor: getFillColor(textFills),
          fontSize:
            typeof textChild?.fontSize === "number"
              ? textChild.fontSize
              : DESIGN_TOKENS.fontSizes.medium,
        };
        return baseSpec;
      }
      break;
    }

    case "TEXT": {
      const text = node as TextNode;
      const textFills = Array.isArray(text.fills) ? text.fills : [];
      baseSpec.type = "text";
      baseSpec.properties = {
        text: text.characters,
        fontSize:
          typeof text.fontSize === "number"
            ? text.fontSize
            : DESIGN_TOKENS.fontSizes.medium,
        textColor: getFillColor(textFills),
        width: text.width,
        fontWeight:
          typeof text.fontName === "object" &&
          "style" in text.fontName &&
          typeof text.fontName.style === "string" &&
          text.fontName.style.toLowerCase().includes("bold")
            ? "bold"
            : "regular",
      };
      return baseSpec;
    }

    case "RECTANGLE": {
      const rect = node as RectangleNode;
      const rectFills = Array.isArray(rect.fills) ? rect.fills : [];
      baseSpec.type = "rectangle";
      baseSpec.properties = {
        width: rect.width,
        height: rect.height,
        cornerRadius:
          typeof rect.cornerRadius === "number"
            ? rect.cornerRadius
            : DESIGN_TOKENS.radius.medium,
        fills: rectFills.map((fill) => ({
          type: "SOLID",
          color: isSolidPaint(fill) ? rgbToHex(fill.color) : "#000000",
        })),
      };
      return baseSpec;
    }

    case "VECTOR": {
      baseSpec.type = "icon";
      baseSpec.properties = {
        size: Math.max(node.width, node.height),
        fills: Array.isArray(node.fills)
          ? node.fills.map((fill) => ({
              type: "SOLID",
              color: isSolidPaint(fill) ? rgbToHex(fill.color) : "#000000",
            }))
          : [],
        iconName: node.name.toLowerCase(),
      };
      return baseSpec;
    }
  }

  return null;
}

/**
 * Update Figma nodes
 */
export async function updateFigmaNodes(
  frame: FrameNode,
  componentSpec: ComponentSpec
): Promise<void> {
  frame.name = componentSpec.name;
  frame.layoutMode = componentSpec.layout || "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.fills = [createValidPaint(DESIGN_TOKENS.colors.background)];

  for (const child of [...frame.children]) {
    if (child.name !== "Background") {
      child.remove();
    }
  }

  for (const element of componentSpec.elements) {
    const node = await createElement(element);
    if (node) {
      frame.appendChild(node);
    }
  }

  frame.paddingLeft = DESIGN_TOKENS.spacing.md;
  frame.paddingRight = DESIGN_TOKENS.spacing.md;
  frame.paddingTop = DESIGN_TOKENS.spacing.md;
  frame.paddingBottom = DESIGN_TOKENS.spacing.md;
  frame.itemSpacing = DESIGN_TOKENS.spacing.sm;

  figma.viewport.scrollAndZoomIntoView([frame]);
}

/**
 * Apply responsive properties
 */
function applyResponsiveProperties(
  node: BaseNode & { [key: string]: any },
  baseProps: ElementProperties,
  responsiveProps: ElementProperties | null
) {
  const props = responsiveProps
    ? { ...baseProps, ...responsiveProps }
    : baseProps;

  Object.entries(props).forEach(([key, value]) => {
    if (key === "fills" && value !== undefined) {
      if (Array.isArray(value)) {
        node.fills = value.map((fill: any) =>
          convertSpecFillToPaint({
            type: "SOLID",
            color: typeof fill.color === "string" ? fill.color : "#000000",
          })
        );
      }
    } else if (node[key] !== undefined && value !== undefined) {
      node[key] = value;
    }
  });
}

/**
 * Create Figma component
 */
export async function createFigmaComponent(
  spec: ComponentSpec
): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = spec.name;
  frame.layoutMode = spec.layout || "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.paddingLeft = frame.paddingRight = DESIGN_TOKENS.spacing.md;
  frame.paddingTop = frame.paddingBottom = DESIGN_TOKENS.spacing.md;
  frame.itemSpacing = DESIGN_TOKENS.spacing.sm;
  frame.fills = [createValidPaint(DESIGN_TOKENS.colors.background)];

  if (spec.background) {
    const bg = figma.createRectangle();
    bg.name = "Background";
    const bgFill = spec.background.properties.fill;
    bg.fills = [createValidPaint(bgFill || DESIGN_TOKENS.colors.background)];
    bg.cornerRadius = spec.background.properties.cornerRadius || 0;

    if (spec.background.properties.effect) {
      bg.effects = [createEffect(spec.background.properties.effect)];
    }

    frame.appendChild(bg);
    bg.layoutPositioning = "ABSOLUTE";
    bg.resize(frame.width, frame.height);
  }

  for (const element of spec.elements) {
    const node = await createElementNode(element);
    if (node) {
      frame.appendChild(node);
      if ("layoutAlign" in node) {
        node.layoutAlign = "STRETCH";
      }
      applyResponsiveProperties(node, element.properties, null);

      if (element.responsive) {
        node.setPluginData("responsive", JSON.stringify(element.responsive));
      }
    }
  }

  return frame;
}

/**
 * Create element node
 */
async function createElementNode(
  element: ElementSpec
): Promise<SceneNode | null> {
  try {
    switch (element.type.toLowerCase()) {
      case "button": {
        const button = figma.createFrame();
        button.name = element.name;
        button.layoutMode = "HORIZONTAL";
        button.primaryAxisSizingMode = "AUTO";
        button.counterAxisSizingMode = "AUTO";
        const fill = element.properties.fills?.[0];
        button.fills = [
          fill
            ? convertSpecFillToPaint(fill)
            : createValidPaint(DESIGN_TOKENS.colors.primary),
        ];
        button.cornerRadius =
          element.properties.cornerRadius ?? DESIGN_TOKENS.radius.medium;
        button.paddingLeft = button.paddingRight = DESIGN_TOKENS.spacing.md;
        button.paddingTop = button.paddingBottom = DESIGN_TOKENS.spacing.sm;
        button.strokes = [createValidPaint(DESIGN_TOKENS.colors.border)];
        button.strokeWeight = 1;
        return button;
      }
      case "text": {
        const text = figma.createText();
        text.name = element.name;
        await loadFonts();
        text.fontName = element.properties.fontName || {
          family: "Inter",
          style: "Regular",
        };
        text.characters = element.properties.characters || "";
        text.fontSize =
          element.properties.fontSize || DESIGN_TOKENS.fontSizes.medium;
        text.fills = [
          createValidPaint(
            element.properties.textColor || DESIGN_TOKENS.colors.text
          ),
        ];
        return text;
      }
      case "rectangle": {
        const rect = figma.createRectangle();
        rect.name = element.name;
        const fill = element.properties.fills?.[0];
        rect.fills = [
          fill
            ? convertSpecFillToPaint(fill)
            : createValidPaint(DESIGN_TOKENS.colors.background),
        ];
        rect.cornerRadius =
          element.properties.cornerRadius || DESIGN_TOKENS.radius.medium;
        return rect;
      }
      case "input": {
        const input = figma.createFrame();
        input.name = element.name;
        input.layoutMode = "HORIZONTAL";
        input.fills = [createValidPaint("#FFFFFF")];
        input.strokes = [createValidPaint(DESIGN_TOKENS.colors.border)];
        input.strokeWeight = 1;
        input.cornerRadius = DESIGN_TOKENS.radius.small;
        input.paddingLeft = input.paddingRight = DESIGN_TOKENS.spacing.sm;
        input.paddingTop = input.paddingBottom = DESIGN_TOKENS.spacing.xs;
        return input;
      }
      case "icon": {
        const icon = figma.createFrame();
        icon.name = element.name;
        icon.layoutMode = "NONE";
        const size = element.properties?.size || 24;
        icon.resize(size, size);

        const vector = figma.createVector();
        const iconName = element.properties?.iconName?.toLowerCase() || "home";
        vector.vectorPaths = [
          {
            windingRule: "NONZERO",
            data: ICON_PATHS[iconName] || ICON_PATHS.home,
          },
        ];
        vector.resize(size, size);
        const fill = element.properties?.fills?.[0];
        vector.fills = [
          fill
            ? convertSpecFillToPaint(fill)
            : createValidPaint(DESIGN_TOKENS.colors.text),
        ];

        icon.appendChild(vector);
        return icon;
      }
      case "image": {
        const image = figma.createFrame();
        image.name = element.name;
        image.layoutMode = "NONE";
        image.fills = [createValidPaint(DESIGN_TOKENS.colors.background)];
        image.resize(
          element.properties?.width || 100,
          element.properties?.height || 100
        );
        image.cornerRadius = DESIGN_TOKENS.radius.medium;
        return image;
      }
      default:
        figma.notify(`⚠️ Unsupported element type: ${element.type}`);
        return null;
    }
  } catch (error: unknown) {
    figma.notify(
      `⚠️ Error creating element ${element.name}: ${(error as Error).message}`
    );
    return null;
  }
}

/**
 * Update Figma component
 */
export async function updateFigmaComponent(
  frame: FrameNode,
  componentSpec: ComponentSpec
): Promise<void> {
  frame.name = componentSpec.name;
  frame.layoutMode = componentSpec.layout || "VERTICAL";
  frame.fills = [createValidPaint(DESIGN_TOKENS.colors.background)];

  if (componentSpec.background) {
    let bg = frame.findChild(
      (n) => n.name === "Background"
    ) as RectangleNode | null;
    if (!bg) {
      bg = figma.createRectangle();
      bg.name = "Background";
      frame.appendChild(bg);
      bg.layoutPositioning = "ABSOLUTE";
    }

    const bgFill = componentSpec.background.properties.fill;
    bg.fills = [createValidPaint(bgFill || DESIGN_TOKENS.colors.background)];
    bg.cornerRadius = componentSpec.background.properties.cornerRadius || 0;
    if (componentSpec.background.properties.effect) {
      bg.effects = [createEffect(componentSpec.background.properties.effect)];
    }
    bg.resize(frame.width, frame.height);
  }

  const elementsToRemove = new Set(frame.children);
  for (const elementSpec of componentSpec.elements) {
    let node = frame.findChild((n) => n.name === elementSpec.name) as SceneNode;
    if (!node) {
      const newNode = await createElementNode(elementSpec);
      if (newNode) {
        frame.appendChild(newNode);
      }
    } else {
      elementsToRemove.delete(node);
      applyResponsiveProperties(node, elementSpec.properties, null);
      if (elementSpec.responsive) {
        node.setPluginData(
          "responsive",
          JSON.stringify(elementSpec.responsive)
        );
      }
    }
  }

  elementsToRemove.forEach((node) => {
    if (node.name !== "Background") {
      node.remove();
    }
  });
}

/**
 * Update component for breakpoint
 */
export async function updateComponentForBreakpoint(
  node: SceneNode,
  breakpoint: "mobile" | "tablet" | "desktop"
) {
  const responsiveData = node.getPluginData("responsive");
  if (responsiveData) {
    try {
      const responsive = JSON.parse(responsiveData);
      if (responsive[breakpoint]) {
        applyResponsiveProperties(node, {}, responsive[breakpoint]);
      }
    } catch (error: unknown) {
      figma.notify(
        `⚠️ Error applying responsive properties: ${(error as Error).message}`
      );
    }
  }

  if ("children" in node) {
    for (const child of node.children) {
      await updateComponentForBreakpoint(child, breakpoint);
    }
  }
}

/**
 * Create frame element
 */
async function createFrame(element: ElementSpec): Promise<SceneNode> {
  const frame = figma.createFrame();
  frame.name = element.name;

  if (element.properties) {
    if (element.properties.width)
      frame.resize(element.properties.width, frame.height);
    if (element.properties.height)
      frame.resize(frame.width, element.properties.height);

    if (element.properties.layoutMode) {
      frame.layoutMode = element.properties.layoutMode;
      frame.primaryAxisSizingMode = "AUTO";
      frame.counterAxisSizingMode = "AUTO";
    }

    if (element.properties.paddingLeft)
      frame.paddingLeft = element.properties.paddingLeft;
    if (element.properties.paddingRight)
      frame.paddingRight = element.properties.paddingRight;
    if (element.properties.paddingTop)
      frame.paddingTop = element.properties.paddingTop;
    if (element.properties.paddingBottom)
      frame.paddingBottom = element.properties.paddingBottom;

    if (element.properties.itemSpacing)
      frame.itemSpacing = element.properties.itemSpacing;

    if (element.properties.fills && element.properties.fills.length > 0) {
      frame.fills = element.properties.fills.map(convertSpecFillToPaint);
    }

    if (element.properties.effects) {
      frame.effects = element.properties.effects.map(
        (effect) =>
          ({
            type: "DROP_SHADOW",
            color: toRGB(effect.color),
            offset: effect.offset,
            radius: effect.blur,
            spread: effect.spread || 0,
            visible: true,
            blendMode: "NORMAL",
          } as Effect)
      );
    }
  }

  if (element.elements) {
    for (const childElement of element.elements) {
      const child = await createElement(childElement);
      if (child) {
        frame.appendChild(child);
      }
    }
  }

  return frame;
}

/**
 * Create container element
 */
async function createContainer(element: ElementSpec): Promise<SceneNode> {
  element.properties = {
    layoutMode: "VERTICAL",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    itemSpacing: 8,
    ...element.properties,
  };
  return createFrame(element);
}

/**
 * Create checkbox element
 */
async function createCheckbox(element: ElementSpec): Promise<SceneNode> {
  const container = figma.createFrame();
  container.name = element.name;
  container.layoutMode = "HORIZONTAL";
  container.itemSpacing = 8;
  container.paddingLeft = 0;
  container.paddingRight = 0;
  container.paddingTop = 0;
  container.paddingBottom = 0;

  const box = figma.createRectangle();
  box.name = "Checkbox Box";
  box.resize(20, 20);
  box.cornerRadius = 4;
  box.fills = [createValidPaint("#FFFFFF")];
  box.strokes = [createValidPaint("#E5E7EB")];
  box.strokeWeight = 1;
  container.appendChild(box);

  if (element.properties?.text) {
    const label = figma.createText();
    await loadFonts();
    label.characters = element.properties.text;
    label.fontSize = element.properties.fontSize || 14;
    label.fills = [createValidPaint(element.properties.textColor || "#374151")];
    container.appendChild(label);
  }

  return container;
}

/**
 * Create link element
 */
async function createLink(element: ElementSpec): Promise<SceneNode> {
  const text = figma.createText();
  text.name = element.name;

  await loadFonts();

  if (element.properties) {
    text.characters = element.properties.text || "";
    text.fontSize = element.properties.fontSize || 14;
    text.fills = [createValidPaint(element.properties.textColor || "#3366FF")];
    text.textDecoration = "UNDERLINE";

    if (element.properties.width)
      text.resize(element.properties.width, text.height);

    const fontStyle =
      element.properties.fontWeight === "bold"
        ? "Bold"
        : element.properties.fontWeight === "medium"
        ? "Medium"
        : "Regular";
    await figma.loadFontAsync({ family: "Inter", style: fontStyle });
    text.fontName = { family: "Inter", style: fontStyle };
  }

  return text;
}

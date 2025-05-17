import { ComponentSpec } from "./types";
import { withRetry } from "./error-handling";

/**
 * Generate UI component specification using AI
 * @param model The Gemini AI model
 * @param prompt User prompt describing the component
 * @returns Component specification or null if generation failed
 */
export async function generateUIComponent(
  model: any,
  prompt: string,
  generationConfig?: any
): Promise<ComponentSpec | null> {  
  const fullPrompt = `You are a professional Figma UI/UX designer specialized in creating comprehensive authentication pages and forms. Your task is to generate a detailed component specification that includes all necessary elements for a complete, production-ready design, following the structure and guidelines below.

For authentication pages, ensure the specification includes:
1. **Form Inputs**:
   - Proper layout (stacked vertically with labels above inputs)
   - Labels (14px, medium weight) and placeholder text
   - Validation states (normal, focus, error, success)
   - Focus effects (blue border, subtle shadow) and hover effects (light background change)
2. **Buttons**:
   - Clear hierarchy (primary for submit, secondary for alternatives)
   - Hover (lighter background), active (darker background), and loading states (spinner icon)
   - Full-width design, 48px height
3. **Social Authentication**:
   - Buttons for common providers (Google, Facebook, etc.) with provider-specific icons
   - Consistent spacing (16px between buttons)
   - Hover and active states
4. **Helper Elements**:
   - Links for password reset, signup, and terms (14px, primary color, underlined on hover)
   - Checkbox for "Remember me" with proper spacing
   - Error message area below inputs (red text, 14px)
   - Success message area (green text, 14px, with checkmark icon)

**Design Context**:
- Use a frame-based layout structure
- Default to desktop design (1920x1080px) unless specified
- Support responsive variants:
  - Mobile (320px - 767px): Stacked layout, full-width elements, 40px input/button height
  - Tablet (768px - 1023px): Slightly wider form (up to 600px), 44px input/button height
  - Desktop (1024px+): Two-panel layout, 48px input/button height
- Ensure accessibility (WCAG 2.1 AA contrast, clear focus indicators)

**Create a comprehensive design for**: ${prompt}

**Authentication Page Guidelines**:
1. **Frame Structure**:
   - Main frame: 1920x1080px (desktop)
   - Two-panel layout:
     - Left panel (content): 40% width (768px), white background (#FFFFFF)
     - Right panel (image/branding): 60% width (1152px), brand color or image background
   - Mobile: Single column, full-width content panel
   - Tablet: Centered content panel (600px max-width)

2. **Form Elements**:
   - Input fields: Full-width, 48px height, 16px padding, 8px corner radius
   - Buttons: Full-width, 48px height, 8px corner radius, primary color (#3366FF)
   - Social buttons: Full-width, 48px height, white background (#FFFFFF), provider-specific border colors
   - Links: Primary color (#3366FF), underlined on hover
   - Error states: Red border (#EF4444), error text below (14px, #EF4444)
   - Success states: Green border (#10B981), checkmark icon, success text (14px, #10B981)

3. **Typography**:
   - Headings: 32px (title), 16px (subtitle), bold/medium weight, #111827
   - Labels: 14px, medium weight, #374151
   - Input text: 16px, regular weight, #111827
   - Error messages: 14px, #EF4444
   - Links: 14px, #3366FF
   - Font family: Inter (Regular, Medium, Bold)

4. **Spacing**:
   - Form container: 64px padding all sides (desktop), 32px (mobile)
   - Between inputs: 24px vertical spacing
   - Between sections (e.g., form and social auth): 32px
   - Input padding: 16px horizontal, 12px vertical
   - Button groups: 16px vertical spacing
   - Checkbox and links: 16px vertical spacing

**Design Process** (Follow this step-by-step approach like a professional designer):
1. **Create Main Screen/Layout**:
   - Set artboard size (default 1920x1080px or user-specified)
   - Use 12-column grid (16px gutters, 64px margins)
   - Apply global background (#F3F4F6 or brand color)
   - Create two panels (content and image/branding) for desktop, single column for mobile
   - Position form container in content panel with proper padding

2. **Design Components**:
   - Add title and subtitle at top of form
   - Create form with inputs (email, password), labels, and error message areas
   - Add primary submit button and secondary links (password reset, signup)
   - Include "Remember me" checkbox
   - Add social auth buttons with icons
   - Include footer links (terms, privacy)
   - Position branding/image in right panel (desktop only)

3. **Style the Design**:
   - Apply color scheme:
     - Primary: #3366FF (buttons, links)
     - Secondary: #6B7280 (subtitle, placeholder)
     - Background: #F3F4F6 (page), #FFFFFF (form)
     - Error: #EF4444
     - Success: #10B981
   - Use Inter font family with modular scale (1.25 ratio)
   - Add shadows (0px 4px 16px rgba(0,0,0,0.1)) for panels/buttons
   - Include hover (lighten 10%), focus (blue outline), and active (darken 10%) states
   - Add validation states for inputs (error, success)

4. **Refine Responsive Behavior**:
   - Mobile:
     - Stack all elements vertically
     - Reduce font sizes (14px base)
     - Use 40px input/button height
     - Full-width form (32px padding)
   - Tablet:
     - Center form (600px max-width)
     - Use 44px input/button height
     - Maintain 16px spacing
   - Desktop:
     - Two-panel layout
     - 48px input/button height
     - 64px form padding
   - Ensure WCAG 2.1 AA contrast and keyboard accessibility

**Design Guidelines**:
1. **Typography**:
   - Use Inter font family (Regular, Medium, Bold)
   - Desktop: 16px base font size, 1.5 line height
   - Mobile: 14px base font size, 1.4 line height
   - Modular scale: 1.25 ratio
   - Max 3 font weights

2. **Colors**:
   - Default palette:
     - Primary: #3366FF
     - Secondary: #6B7280
     - Background: #F3F4F6
     - Form: #FFFFFF
     - Error: #EF4444
     - Success: #10B981
   - Use user-specified colors if provided
   - Ensure WCAG 2.1 AA contrast (4.5:1 for text)

3. **Spacing & Layout**:
   - Use 8px grid system
   - Spacing increments: 8, 16, 24, 32, 48, 64px
   - Form padding: 64px (desktop), 32px (mobile)
   - Component spacing: 16-32px
   - Section spacing: 64px vertical

4. **UI Elements**:
   - Buttons: Primary (#3366FF), Secondary (#FFFFFF with border), 8px radius
   - Inputs: 1px border (#E5E7EB), 8px radius, 16px padding
   - Checkbox: 20px square, #3366FF when checked
   - Icons: 24x24px, provider-specific colors
   - Links: #3366FF, underlined on hover

5. **Visual Refinements**:
   - Shadows: 0px 4px 16px rgba(0,0,0,0.1)
   - Borders: 1px, #E5E7EB (inputs), #3366FF (focus)
   - Rounded corners: 8px (inputs, buttons)
   - Negative space: Balanced, 16-32px between elements
   - Icons: Crisp, centered in buttons

**Example Auth Page Structure**:
{
  "name": "Login Page",
  "layout": "HORIZONTAL",
  "background": {
    "type": "rectangle",
    "properties": {
      "fill": "#F3F4F6",
      "cornerRadius": 0
    }
  },
  "elements": [
    {
      "type": "rectangle",
      "name": "Left Panel",
      "properties": {
        "width": 768,
        "height": 1080,
        "layoutMode": "VERTICAL",
        "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
        "paddingLeft": 64,
        "paddingRight": 64,
        "paddingTop": 64,
        "paddingBottom": 64,
        "itemSpacing": 24
      },
      "responsive": {
        "mobile": { "width": 320, "paddingLeft": 32, "paddingRight": 32, "paddingTop": 32, "paddingBottom": 32 },
        "tablet": { "width": 600, "paddingLeft": 48, "paddingRight": 48 }
      }
    },
    {
      "type": "rectangle",
      "name": "Right Panel",
      "properties": {
        "width": 1152,
        "height": 1080,
        "fills": [{ "type": "SOLID", "color": "#3366FF" }],
        "effects": [{
          "type": "DROP_SHADOW",
          "color": "#00000020",
          "offset": { "x": 0, "y": 4 },
          "blur": 16
        }]
      },
      "responsive": {
        "mobile": { "visible": false },
        "tablet": { "visible": false }
      }
    },
    {
      "type": "text",
      "name": "Title",
      "properties": {
        "text": "Welcome back",
        "fontSize": 32,
        "fontWeight": "bold",
        "textColor": "#111827"
      },
      "responsive": {
        "mobile": { "fontSize": 24 }
      }
    },
    {
      "type": "text",
      "name": "Subtitle",
      "properties": {
        "text": "Sign in to your account",
        "fontSize": 16,
        "fontWeight": "regular",
        "textColor": "#6B7280"
      },
      "responsive": {
        "mobile": { "fontSize": 14 }
      }
    },
    {
      "type": "text",
      "name": "Email Label",
      "properties": {
        "text": "Email address",
        "fontSize": 14,
        "fontWeight": "medium",
        "textColor": "#374151"
      }
    },
    {
      "type": "input",
      "name": "Email Input",
      "properties": {
        "placeholder": "Enter your email",
        "width": 384,
        "height": 48,
        "cornerRadius": 8,
        "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
        "strokes": [{ "type": "SOLID", "color": "#E5E7EB" }],
        "paddingLeft": 16,
        "paddingRight": 16
      },
      "responsive": {
        "mobile": { "width": 256, "height": 40 },
        "tablet": { "width": 320 }
      }
    },
    {
      "type": "text",
      "name": "Email Error",
      "properties": {
        "text": "Please enter a valid email",
        "fontSize": 14,
        "textColor": "#EF4444",
        "visible": false
      }
    },
    {
      "type": "text",
      "name": "Password Label",
      "properties": {
        "text": "Password",
        "fontSize": 14,
        "fontWeight": "medium",
        "textColor": "#374151"
      }
    },
    {
      "type": "input",
      "name": "Password Input",
      "properties": {
        "placeholder": "Enter your password",
        "width": 384,
        "height": 48,
        "cornerRadius": 8,
        "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
        "strokes": [{ "type": "SOLID", "color": "#E5E7EB" }],
        "paddingLeft": 16,
        "paddingRight": 16
      },
      "responsive": {
        "mobile": { "width": 256, "height": 40 },
        "tablet": { "width": 320 }
      }
    },
    {
      "type": "text",
      "name": "Password Error",
      "properties": {
        "text": "Password must be at least 8 characters",
        "fontSize": 14,
        "textColor": "#EF4444",
        "visible": false
      }
    },
    {
      "type": "button",
      "name": "Sign In Button",
      "properties": {
        "text": "Sign in",
        "width": 384,
        "height": 48,
        "cornerRadius": 8,
        "fills": [{ "type": "SOLID", "color": "#3366FF" }],
        "textColor": "#FFFFFF",
        "fontSize": 16,
        "fontWeight": "medium"
      },
      "responsive": {
        "mobile": { "width": 256, "height": 40 },
        "tablet": { "width": 320 }
      }
    },
    {
      "type": "rectangle",
      "name": "Checkbox Container",
      "properties": {
        "layoutMode": "HORIZONTAL",
        "itemSpacing": 8,
        "height": 20
      }
    },
    {
      "type": "rectangle",
      "name": "Remember Me Checkbox",
      "properties": {
        "width": 20,
        "height": 20,
        "cornerRadius": 4,
        "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
        "strokes": [{ "type": "SOLID", "color": "#E5E7EB" }]
      }
    },
    {
      "type": "text",
      "name": "Remember Me Label",
      "properties": {
        "text": "Remember me",
        "fontSize": 14,
        "textColor": "#374151"
      }
    },
    {
      "type": "text",
      "name": "Forgot Password Link",
      "properties": {
        "text": "Forgot password?",
        "fontSize": 14,
        "textColor": "#3366FF"
      }
    },
    {
      "type": "rectangle",
      "name": "Social Auth Container",
      "properties": {
        "layoutMode": "VERTICAL",
        "itemSpacing": 16,
        "width": 384
      },
      "responsive": {
        "mobile": { "width": 256 },
        "tablet": { "width": 320 }
      }
    },
    {
      "type": "button",
      "name": "Google Sign In",
      "properties": {
        "text": "Sign in with Google",
        "width": 384,
        "height": 48,
        "cornerRadius": 8,
        "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
        "strokes": [{ "type": "SOLID", "color": "#E5E7EB" }],
        "textColor": "#374151",
        "fontSize": 16,
        "iconName": "google"
      },
      "responsive": {
        "mobile": { "width": 256, "height": 40 },
        "tablet": { "width": 320 }
      }
    },
    {
      "type": "button",
      "name": "Facebook Sign In",
      "properties": {
        "text": "Sign in with Facebook",
        "width": 384,
        "height": 48,
        "cornerRadius": 8,
        "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
        "strokes": [{ "type": "SOLID", "color": "#E5E7EB" }],
        "textColor": "#374151",
        "fontSize": 16,
        "iconName": "facebook"
      },
      "responsive": {
        "mobile": { "width": 256, "height": 40 },
        "tablet": { "width": 320 }
      }
    },
    {
      "type": "text",
      "name": "Signup Link",
      "properties": {
        "text": "Don't have an account? Sign up",
        "fontSize": 14,
        "textColor": "#3366FF"
      }
    }
  ]
}

**Required JSON Format**:
{
  "name": string,
  "layout": "VERTICAL" | "HORIZONTAL" | "NONE",
  "background"?: {
    "type": "rectangle",
    "properties": {
      "fill": string,
      "opacity"?: number,
      "cornerRadius"?: number,
      "effect"?: {
        "type": "DROP_SHADOW",
        "color": string,
        "offset": { x: number, y: number },
        "blur": number
      }
    }
  },
  "elements": [
    {
      "type": string,
      "name": string,
      "properties": {
        "width"?: number,
        "height"?: number,
        "cornerRadius"?: number,
        "fills"?: Array<{
          "type": "SOLID",
          "color": string
        }>,
        "strokes"?: Array<{
          "type": "SOLID",
          "color": string
        }>,
        "paddingLeft"?: number,
        "paddingRight"?: number,
        "paddingTop"?: number,
        "paddingBottom"?: number,
        "itemSpacing"?: number,
        "layoutMode"?: "VERTICAL" | "HORIZONTAL" | "NONE",
        "text"?: string,
        "fontSize"?: number,
        "fontWeight"?: "regular" | "medium" | "bold",
        "textColor"?: string,
        "placeholder"?: string,
        "size"?: number,
        "iconName"?: string,
        "visible"?: boolean
      },
      "responsive"?: {
        "mobile"?: {},
        "tablet"?: {},
        "desktop"?: {}
      }
    }
  ]
}

**Supported Component Types**:
- navigation: Header, menu, footer
- hero: Banners, intro sections
- content: Text blocks, features
- card: Information containers
- form: Inputs, selections, submissions
- button: Interactive buttons
- media: Images, videos, galleries
- cta: Call-to-action sections
- testimonial: Quotes, reviews
- pricing: Pricing tables
- footer: Page footer elements

**Additional Instructions**:
- Always include all required elements for authentication pages (form inputs, buttons, social auth, helper elements).
- Provide responsive variants for mobile, tablet, and desktop with appropriate sizing and spacing.
- Use consistent naming (e.g., "Email Input", "Sign In Button") for clarity.
- Include icons for social auth buttons (e.g., "google", "facebook").
- Ensure error and success states are represented (even if hidden by default).
- Follow the example structure closely, adapting for the specific page type requested.
- If the prompt specifies a page type (e.g., login, signup), tailor the content (e.g., "Sign in" vs. "Sign up") while maintaining all required elements.

Provide the complete JSON specification with all necessary details for a professional designer to implement a production-ready design.`;

  try {
    const generateResult = await withRetry(async () => {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    });

    // Extract and validate JSON
    let componentSpec: ComponentSpec;
    try {
      if (typeof generateResult !== "string") {
        throw new Error("Invalid response type from AI model");
      }

      const jsonMatch = generateResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      componentSpec = JSON.parse(jsonMatch[0]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown parsing error";
      throw new Error(`Invalid JSON response: ${errorMessage}`);
    }

    // Validate component structure
    if (!validateComponentSpec(componentSpec)) {
      throw new Error("Generated component is missing required properties");
    }

    return componentSpec;
  } catch (error: any) {
    figma.notify(`⚠️ Generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Validate the component specification has all required properties
 */
function validateComponentSpec(spec: any): spec is ComponentSpec {
  // Basic structure validation
  if (!spec || typeof spec !== 'object') return false;
  if (typeof spec.name !== 'string' || spec.name.trim().length === 0) return false;
  if (!['VERTICAL', 'HORIZONTAL', 'NONE'].includes(spec.layout)) return false;
  if (!Array.isArray(spec.elements)) return false;

  // Background validation (if present)
  if (spec.background !== undefined) {
    if (!validateBackground(spec.background)) return false;
  }

  // Elements validation
  return spec.elements.every(validateElement);
}

/**
 * Validate an element has all required properties
 */
function validateElement(element: any): boolean {
  if (!element || typeof element !== 'object') return false;
  if (typeof element.name !== 'string' || element.name.trim().length === 0) return false;
  if (!isValidElementType(element.type)) return false;
  
  // Ensure properties object exists
  if (!element.properties || typeof element.properties !== 'object') return false;

  // Check for nested elements
  if (element.elements && Array.isArray(element.elements)) {
    if (!element.elements.every(validateElement)) return false;
  }

  // Validate element properties
  if (!validateElementProperties(element.type, element.properties)) return false;

  // Validate responsive properties if present
  if (element.responsive) {
    if (!validateResponsiveProps(element.responsive)) return false;
  }

  return true;
}

/**
 * Validate the background specification
 */
function validateBackground(background: any): boolean {
  if (!background || typeof background !== 'object') return false;
  if (background.type !== 'rectangle') return false;
  if (!background.properties || typeof background.properties !== 'object') return false;

  const props = background.properties;
  if (typeof props.fill !== 'string' || !props.fill.match(/^#[0-9A-Fa-f]{6}$/)) return false;

  if (props.opacity !== undefined && (typeof props.opacity !== 'number' || props.opacity < 0 || props.opacity > 1)) return false;
  if (props.cornerRadius !== undefined && (typeof props.cornerRadius !== 'number' || props.cornerRadius < 0)) return false;

  if (props.effect) {
    const effect = props.effect;
    if (effect.type !== 'DROP_SHADOW') return false;
    if (typeof effect.color !== 'string' || !effect.color.match(/^#[0-9A-Fa-f]{6,8}$/)) return false;
    if (!effect.offset || typeof effect.offset.x !== 'number' || typeof effect.offset.y !== 'number') return false;
    if (typeof effect.blur !== 'number' || effect.blur < 0) return false;
  }

  return true;
}

/**
 * Validate if the element type is supported
 */
function isValidElementType(type: string): boolean {
  return [
    'button', 
    'text', 
    'rectangle', 
    'input', 
    'icon', 
    'image',
    'frame',
    'container',
    'checkbox',
    'link'
  ].includes(type.toLowerCase());
}

/**
 * Validate element properties based on type
 */
function validateElementProperties(type: string, properties: any): boolean {
  if (!properties || typeof properties !== 'object') return false;

  // Validate common properties if present
  if (properties.width !== undefined && typeof properties.width !== 'number') return false;
  if (properties.height !== undefined && typeof properties.height !== 'number') return false;
  if (properties.opacity !== undefined && (typeof properties.opacity !== 'number' || properties.opacity < 0 || properties.opacity > 1)) return false;
  if (properties.cornerRadius !== undefined && typeof properties.cornerRadius !== 'number') return false;

  // Validate layout properties
  if (properties.layoutMode !== undefined && !['VERTICAL', 'HORIZONTAL', 'NONE'].includes(properties.layoutMode)) return false;
  if (properties.itemSpacing !== undefined && typeof properties.itemSpacing !== 'number') return false;
  if (properties.paddingLeft !== undefined && typeof properties.paddingLeft !== 'number') return false;
  if (properties.paddingRight !== undefined && typeof properties.paddingRight !== 'number') return false;
  if (properties.paddingTop !== undefined && typeof properties.paddingTop !== 'number') return false;
  if (properties.paddingBottom !== undefined && typeof properties.paddingBottom !== 'number') return false;

  // Validate fills if present
  if (properties.fills) {
    if (!Array.isArray(properties.fills)) return false;
    if (!properties.fills.every((fill: any) => 
      fill.type === 'SOLID' && typeof fill.color === 'string' && fill.color.match(/^#[0-9A-Fa-f]{6}$/))
    ) return false;
  }

  // Validate strokes if present
  if (properties.strokes) {
    if (!Array.isArray(properties.strokes)) return false;
    if (!properties.strokes.every((stroke: any) => 
      stroke.type === 'SOLID' && typeof stroke.color === 'string' && stroke.color.match(/^#[0-9A-Fa-f]{6}$/))
    ) return false;
  }

  // Validate effects if present
  if (properties.effects) {
    if (!Array.isArray(properties.effects)) return false;
    if (!properties.effects.every((effect: any) => 
      effect.type === 'DROP_SHADOW' && 
      typeof effect.color === 'string' && 
      effect.color.match(/^#[0-9A-Fa-f]{6,8}$/) &&
      effect.offset && 
      typeof effect.offset.x === 'number' && 
      typeof effect.offset.y === 'number' &&
      typeof effect.blur === 'number')
    ) return false;
  }

  // Type-specific validations
  switch (type.toLowerCase()) {
    case 'text':
    case 'button':
      if (properties.text !== undefined && typeof properties.text !== 'string') return false;
      if (properties.fontSize !== undefined && typeof properties.fontSize !== 'number') return false;
      if (properties.fontWeight !== undefined && !['regular', 'medium', 'bold'].includes(properties.fontWeight)) return false;
      if (properties.textColor !== undefined && (typeof properties.textColor !== 'string' || !properties.textColor.match(/^#[0-9A-Fa-f]{6}$/))) return false;
      break;

    case 'input':
      if (properties.placeholder !== undefined && typeof properties.placeholder !== 'string') return false;
      break;

    case 'icon':
      if (properties.size !== undefined && typeof properties.size !== 'number') return false;
      if (properties.iconName !== undefined && typeof properties.iconName !== 'string') return false;
      break;

    case 'frame':
    case 'container':
    case 'rectangle':
      // These types can have any of the common properties, so no additional validation needed
      break;

    case 'checkbox':
      if (properties.checked !== undefined && typeof properties.checked !== 'boolean') return false;
      break;

    case 'link':
      if (properties.text !== undefined && typeof properties.text !== 'string') return false;
      if (properties.href !== undefined && typeof properties.href !== 'string') return false;
      break;
  }

  return true;
}

/**
 * Validate responsive properties
 */
function validateResponsiveProps(responsive: any): boolean {
  if (!responsive || typeof responsive !== 'object') return false;

  if (responsive.mobile && typeof responsive.mobile !== 'object') return false;
  if (responsive.tablet && typeof responsive.tablet !== 'object') return false;

  return true;
}

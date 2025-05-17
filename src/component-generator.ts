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
  const fullPrompt = `You are a professional Figma UI/UX designer specialized in creating modern, production-ready components.

    Design Context:
    - Default to desktop design (min-width: 1024px)
    - If mobile is requested, create responsive variants for:
      * Mobile (320px - 767px)
      * Tablet (768px - 1023px)
      * Desktop (1024px+)

    Create a detailed component specification for: ${prompt}

    Design Process:
    1. First, design the background/container:
       - Consider the component's context and hierarchy
       - Use appropriate padding and margins
       - Apply proper elevation/shadow if needed
       - Use subtle gradients or textures if appropriate

Then, design the main component:
Follow visual hierarchy principles
Ensure proper contrast ratios (WCAG 2.1)
Use industry-standard spacing (8px grid)
Include hover/active states for interactive elements

Finally, add responsive behavior:
Define breakpoint-specific properties
Adjust spacing and typography for different screens
Maintain touch targets (min 44px) for mobile

Design Guidelines:

Typography:
Use system fonts or Google Fonts
Desktop: 16px base font size
Mobile: 14px base font size
Follow type scale ratios (1.2 - 1.25)

Colors:
Use Material Design tokens
Include dark mode variants
Maintain consistent contrast
Use accent colors sparingly

Spacing:
Base unit: 8px
Containers: 16px/24px padding
Elements: 8px/16px margins
Touch targets: 44px minimum

Interactions:
Hover states: 0.1 opacity change
Active states: 0.2 opacity change
Transitions: 200-300ms duration
Easing: cubic-bezier(0.4, 0, 0.2, 1)

Required JSON format:
{
"name": "Component Name",
"layout": "VERTICAL", // or HORIZONTAL, NONE
"background": {
 "type": "rectangle",
 "properties": {
   "fill": "
#FFFFFF",
   "opacity": 1,
   "cornerRadius": 8,
   "effect": {
     "type": "DROP_SHADOW",
     "color": "#00000020",
     "offset": { "x": 0, "y": 2 },
     "blur": 8
   }
 }
},
"elements": [
 {
   "type": "elementType",
   "name": "elementName",
   "properties": {
     // Element properties
   },
   "responsive": {
     "mobile": {
       // Mobile-specific overrides
     },
     "tablet": {
       // Tablet-specific overrides
     }
   }
 }
]
}

Supported element types:

button: Interactive buttons with states
text: Typography elements
rectangle: Shapes, backgrounds, dividers
input: Form input fields
icon: Vector icons (use Material Icons)
image: Image placeholders or frames

The response should only contain the JSON, no additional text or explanations.
`;

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
  return (
    spec &&
    typeof spec.name === "string" &&
    typeof spec.layout === "string" &&
    Array.isArray(spec.elements) &&
    spec.elements.every((element: any) => validateElement(element))
  );
}

/**
 * Validate an element has all required properties
 */
function validateElement(element: any): boolean {
  return (
    element &&
    typeof element.type === "string" &&
    typeof element.name === "string" &&
    element.properties &&
    typeof element.properties === "object"
  );
}

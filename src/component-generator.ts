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
  const fullPrompt = `You are a Figma component generator. 
    Create a detailed component specification for: ${prompt}
    
    Rules:
    1. Response must be valid JSON
    2. Use Material Design color tokens
    3. Follow modern UI/UX best practices
    4. Include proper spacing and layout
    5. Ensure accessibility compliance
    6. Use a consistent color scheme
    7. Use a clear naming scheme
    8. Use a consistent design language
    9. Use a consistent font and typography
    10. Use a consistent iconography style
    11. Use a consistent button style
    12. Use a consistent input field style
    13. Use a consistent card style
    14. Use a consistent modal style
    15. Use a consistent tooltip style
    16. Use a consistent dropdown style
    17. Use a consistent checkbox style
    18. Use a consistent radio button style
    19. Use a consistent switch style
    20. Use a consistent slider style
    21. Use a consistent progress bar style
    22. Use a consistent spinner style
    23. Use a consistent toast style
    24. User icons where appropriate
    25. Use a consistent color scheme
    26. Use a consistent font and typography
    27. Use realistic values for properties
    
    Required JSON format:
    {
      "name": "Component Name",
      "layout": "VERTICAL", // or HORIZONTAL, NONE
      "elements": [
        {
          "type": "button",
          "name": "Button Name",
          "properties": {
            "text": "Button Text",
            "width": 200,
            "height": 48,
            "cornerRadius": 8,
            "fill": "#4285F4",
            "textColor": "#FFFFFF",
            "fontSize": 16
          }
        }
      ]
    }

    Supported element types:
    - button: For interactive buttons with text
    - text: For labels, titles, paragraphs
    - rectangle: For simple shapes, backgrounds, dividers
    - input: For text input fields
    - icon: For simple vector icons
    - image: For image placeholders

    Make sure all properties are appropriate for the element type and follow Figma's API.
    
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
      if (typeof generateResult !== 'string') {
        throw new Error("Invalid response type from AI model");
      }

      const jsonMatch = generateResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      componentSpec = JSON.parse(jsonMatch[0]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
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
    spec.elements.every((element: any) =>
      validateElement(element)
    )
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

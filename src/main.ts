import { showUI } from "./ui-handlers";
import { validateAPIKey, sanitizeInput } from "./error-handling";
import { generateUIComponent } from "./component-generator";
import { createFigmaNodes, getComponentSpec, updateFigmaNodes } from "./figma-integration";
import { createAIConfig } from "./ai-config";

// Initialize UI with specified dimensions
showUI();

// Handle selection changes
figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;
  if (selection.length === 1 && (selection[0].type === "FRAME" || selection[0].type === "COMPONENT")) {
    figma.ui.postMessage({
      type: "selection-change",
      component: {
        id: selection[0].id,
        name: selection[0].name,
        type: selection[0].type
      }
    });
  } else {
    figma.ui.postMessage({
      type: "selection-change",
      component: null
    });
  }
});

// Message handler for communication with UI
figma.ui.onmessage = async (msg) => {  if (msg.type === 'update-component') {
    try {
      // Initialize AI configuration
      const aiConfig = createAIConfig();
      
      // Get the component to update
      const component = figma.getNodeById(msg.componentId);
      if (!component) {
        throw new Error("Selected component not found");
      }
      
      // Get current component structure
      const currentSpec = await getComponentSpec(component);
      
      // Generate updated component specification
      const cleanPrompt = sanitizeInput(msg.prompt);
      const updatedSpec = await generateUIComponent(
        aiConfig.model,
        `Update this component: ${JSON.stringify(currentSpec)}\n\nRequested changes: ${cleanPrompt}`,
        aiConfig.generationConfig
      );
      
      if (updatedSpec) {
        // Update the existing component
        await updateFigmaNodes(component as FrameNode, updatedSpec);
        figma.notify("✅ Component updated successfully!");
        figma.ui.postMessage({ type: 'generation-complete' });
      }
    } catch (error: any) {
      figma.notify(`❌ Error: ${error.message}`, { error: true });
      figma.ui.postMessage({ type: 'error', message: error.message });
    }
  } else if (msg.type === 'generate-component') {
    try {
      // Initialize AI configuration with fixed API key
      const aiConfig = createAIConfig();
      figma.notify(`API key is: ${msg.apiKey}`);
      figma.notify(`AI model initialized: ${aiConfig.model}`);
      
      // Sanitize input
      const cleanPrompt = sanitizeInput(msg.prompt);
      
      // Show loading indicator
      figma.notify("🔄 Generating component...");
        // Show loading indicator
      figma.notify("🔄 Generating component...");

      // Generate component specification using AI
      const componentSpec = await generateUIComponent(
        aiConfig.model,
        cleanPrompt,
        aiConfig.generationConfig
      );
        if (componentSpec) {
        // Create Figma nodes from the specification
        await createFigmaNodes(componentSpec);
        figma.notify("✅ Component generated successfully!");
        // Send completion message to UI
        figma.ui.postMessage({ type: 'generation-complete' });
      }
    } catch (error: any) {
      figma.notify(`❌ Error: ${error.message}`, { error: true });
      // Send error message to UI
      figma.ui.postMessage({ type: 'error', message: error.message });
    } finally {
      // Always ensure UI is notified to re-enable the button
      figma.ui.postMessage({ type: 'generation-complete' });
    }
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
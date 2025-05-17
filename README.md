# Figma Component AI

An intelligent Figma plugin that generates professional UI components from natural language descriptions. Powered by AI, it creates well-structured, accessible, and consistent components following Material Design principles.

## Features

- 🎨 Generate Figma components using natural language descriptions
- 🔄 Consistent design system adherence with Material Design tokens
- 📏 Proper spacing and layout handling
- ♿ Built-in accessibility compliance
- 🎯 Support for common UI elements:
  - Buttons
  - Text elements
  - Input fields
  - Icons
  - Rectangles/shapes
  - Image placeholders

## Installation

1. Open Figma
2. Go to Menu > Plugins > Development > Import plugin from manifest...
3. Select the `manifest.json` file from this repository

## Usage

1. Select where you want to insert the component in your Figma file
2. Run the plugin from the Plugins menu
3. Enter a description of the component you want to create
4. Click "Generate" and watch as your component is created!

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Figma desktop app

### Setup

```powershell
# Clone the repository
git clone https://github.com/knightabir/ai-figma-designer.git

# Navigate to the project directory
cd figma-component-ai

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Development Commands

- `npm run build`: Build the plugin
- `npm run watch`: Watch for changes and rebuild
- `npm run lint`: Run linting
- `npm run test`: Run tests

## Configuration

The plugin uses Material Design tokens and follows modern UI/UX best practices. You can customize the generation rules in `src/component-generator.ts`.

## Technical Details

- Built with TypeScript
- Uses Figma Plugin API
- Implements Google's Gemini AI for component generation
- Follows Material Design principles
- Includes robust error handling and retries

## Project Structure

```
├── src/
│   ├── ai-config.ts         # AI configuration
│   ├── color-utils.ts       # Color handling utilities
│   ├── component-generator.ts# Main component generation logic
│   ├── error-handling.ts    # Error handling utilities
│   ├── figma-integration.ts # Figma API integration
│   ├── main.ts             # Plugin entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── ui-handlers.ts      # UI event handlers
│   ├── ui.html            # Plugin UI
│   └── utils.ts           # General utilities
├── manifest.json          # Figma plugin manifest
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── webpack.config.js     # Webpack configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Figma Plugin API
- Material Design System
- Google's Gemini AI

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/figma-component-ai](https://github.com/yourusername/figma-component-ai)

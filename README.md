# VIS Genius

<div align="center">
  <h3>AI-Powered Visual Identity System Generator</h3>
  <p>Automate your brand asset creation with advanced AI design intelligence</p>
</div>

---

## Overview

VIS Genius is an automated Visual Identity System (VIS) generator that transforms a single logo into a comprehensive brand identity system. Powered by Google Gemini 2.5 Flash AI, it generates professional-grade brand assets including logo standards, color systems, typography guides, and real-world mockups.

## Features

### Automated VIS Generation

Upload your logo and watch as VIS Genius generates **45+ high-fidelity brand assets** in two phases:

- **Phase 1 - Basic System (30+ Variations)**: Logo layouts, color palettes, typography specimens, graphic patterns, and material textures
- **Phase 2 - Application Scenarios (16+ Mockups)**: Business cards, letterheads, mobile apps, merchandise, signage, and more

### Interactive Design Chat

- **Natural Language Interface**: Chat with VIS Genius to generate custom assets
- **Smart Action Detection**: The AI understands design intent and suggests appropriate actions
- **Edit Mode**: Select any generated image and request modifications

### Batch Processing

- **4x Parallel Generation**: Concurrent AI threads for maximum efficiency
- **Smart Batching**: Processes assets in optimized batches to balance speed and quality

### Multiple Aspect Ratios

Supports `1:1`, `3:4`, `4:3`, `9:16`, and `16:9` aspect ratios for diverse output formats.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | UI Framework |
| **Vite** | 6.2.0 | Build Tool |
| **TypeScript** | 5.8.2 | Type Safety |
| **Google GenAI** | 1.33.0 | AI SDK |
| **Lucide React** | 0.561.0 | Icons |

### AI Models

- **Gemini 2.5 Flash Image**: High-quality image generation with logo integration
- **Gemini 2.5 Flash**: Design analysis and creative prompt generation

---

## Installation

### Prerequisites

- Node.js 18+ installed
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

### Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:xiaoxihexiaoyu/VIS.git
   cd VIS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**

   Create a `.env.local` file in the project root:
   ```bash
   API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

---

## Usage Guide

### 1. Upload Your Logo

Start by uploading your brand logo. The app supports PNG, JPG, and other common image formats.

### 2. Automatic Generation

Once uploaded, VIS Genius automatically generates:

- **Logo Standards**: Grid constructions, clear space guides, lockups, scalability tests
- **Color Systems**: Primary/secondary palettes, semantic colors, gradients
- **Typography**: Font specimens, pairing guides, letterform details
- **Graphic Assets**: Patterns, supergraphics, iconography sets
- **Applications**: Business cards, mobile apps, merchandise, signage

### 3. Interactive Design

Use the chat interface to:
- **Generate new assets**: "Show me a coffee cup design"
- **Modify existing**: Select an image and say "Make it gold"
- **Get inspired**: Click the sparkles icon for random creative concepts

### 4. Download Assets

Click any generated image to view it in full size and download.

---

## Project Structure

```
vis-genius/
├── components/
│   ├── ActionCard.tsx      # Action confirmation UI
│   ├── Button.tsx          # Reusable button component
│   ├── ImageGrid.tsx       # Asset gallery grid
│   ├── ImageViewer.tsx     # Full-screen image modal
│   └── UploadArea.tsx      # Logo upload interface
├── services/
│   └── geminiService.ts    # AI API integration
├── App.tsx                 # Main application logic
├── types.ts                # TypeScript definitions & VIS categories
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

---

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## VIS Categories Reference

### Basic System Elements

| Category | Types Included |
|----------|----------------|
| **Logo Standards** | Technical Grid, Clear Space, Horizontal/Vertical Lockups, Symbol/Wordmark, Mono/Reverse Versions |
| **Color Systems** | Primary Palette, Secondary Palette, Semantic Colors, Gradients, Color Weighting |
| **Typography** | Primary/Secondary Typefaces, Pairing Guide, Baseline Grid, Letterform Details |
| **Graphic Assets** | Geometric Patterns, Supergraphics, Fluid Shapes, Iconography Sets, Illustrations |
| **Standards** | UI Kit, App Icons, Material Textures, Metal Fabrication, Glass Etching |

### Application Mockups

| Domain | Examples |
|--------|----------|
| **Corporate** | Business Cards, Letterheads, ID Badges, Notebooks, Presentations |
| **Digital** | Mobile Apps, Landing Pages, Social Media Feeds |
| **Merchandise** | T-Shirts, Tote Bags, Coffee Cups, Packaging |
| **Signage** | Office Signs, Billboards, Vehicle Wraps, Storefronts |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | Yes | Google Gemini API Key |

---

## License

This project is open source and available under the MIT License.

---

## Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Google Gemini](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)

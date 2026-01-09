export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  timestamp: number;
  type: 'initial' | 'modification' | 'upload';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  relatedImageId?: string; // If the message resulted in an image or referred to one
}

export type ActionType = 'GENERATE' | 'MODIFY' | 'RANDOM';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface DesignAction {
  type: ActionType;
  label: string;
  description: string;
  searchQuery: string; // The distilled topic for the generator (e.g., "coffee cup" or "make it blue")
}

export interface DesignAnalysis {
  reply: string; // The conversational response
  suggestedAction: DesignAction | null; // The action to prompt the user for, if any
}

export interface VisCategory {
  name: string;
  promptSuffix: string;
  aspectRatio?: AspectRatio;
}

export const BASIC_VI_CATEGORIES: VisCategory[] = [
  // 1. LOGO STANDARDS & LAYOUTS
  { name: 'Technical Grid', promptSuffix: 'technical logo grid construction, blueprint style, geometric analysis, construction lines, fibonacci spiral, engineering drawing, black and white', aspectRatio: '1:1' },
  { name: 'Clear Space Guide', promptSuffix: 'logo safe zone diagram, exclusion area defined by "x" height, minimal technical guide, dimension lines, spacing rules', aspectRatio: '1:1' },
  { name: 'Horizontal Lockup', promptSuffix: 'logo horizontal layout standard, text beside icon, clean presentation on white, official corporate usage', aspectRatio: '16:9' },
  { name: 'Vertical Lockup', promptSuffix: 'logo vertical layout standard, icon above text, centered alignment, modern swiss typography', aspectRatio: '3:4' },
  { name: 'Square Container', promptSuffix: 'logo centered in a square container, balanced white space, social media profile picture style', aspectRatio: '1:1' },
  { name: 'Logo Symbol Only', promptSuffix: 'isolated brand mark symbol, large scale, favicon style, abstract icon focus, no text', aspectRatio: '1:1' },
  { name: 'Wordmark Isolation', promptSuffix: 'logotype text isolated, typography focus, letterform analysis, no symbol, clean presentation', aspectRatio: '16:9' },
  { name: 'Small Scale Test', promptSuffix: 'logo scalability test sheet, shown at 16px 32px 64px, legibility check, minimalist grid', aspectRatio: '4:3' },
  { name: 'Mono Ink Version', promptSuffix: 'solid black logo on white paper, 100% black, high contrast stamp effect, professional print standard', aspectRatio: '1:1' },
  { name: 'Reverse Negative', promptSuffix: 'solid white logo on deep black background, reverse contrast, dark mode aesthetic, high impact', aspectRatio: '1:1' },

  // 2. COLOR SYSTEMS
  { name: 'Primary Palette', promptSuffix: 'brand primary color palette, large swatches, pantone codes, cmyk rgb values, minimalist layout, luxury feel', aspectRatio: '4:3' },
  { name: 'Secondary Palette', promptSuffix: 'complementary secondary color palette, accent colors, harmonic color scheme, modern design swatches', aspectRatio: '4:3' },
  { name: 'Semantic Colors', promptSuffix: 'functional color system for UI, success green, error red, warning amber, info blue, cohesive with brand', aspectRatio: '16:9' },
  { name: 'Gradient System', promptSuffix: 'brand color gradient mesh, smooth transition, modern blur, mesh gradient background, vibrant', aspectRatio: '16:9' },
  { name: 'Color Weighting', promptSuffix: 'visual weight infographic, 60-30-10 color rule diagram, brand color application guide', aspectRatio: '1:1' },

  // 3. TYPOGRAPHY SPECIMENS
  { name: 'Primary Typeface', promptSuffix: 'primary brand font family specimen poster, "Aa" large glyph, full alphabet set, style matching the uploaded logo aesthetic', aspectRatio: '3:4' },
  { name: 'Secondary Typeface', promptSuffix: 'secondary typeface specimen, body copy text block, legible serif or sans, matching the brand personality', aspectRatio: '3:4' },
  { name: 'Type Pairing', promptSuffix: 'typography pairing guide, primary headline with secondary body text, hierarchy example, clean layout', aspectRatio: '4:3' },
  { name: 'Typography Grid', promptSuffix: 'baseline grid diagram, vertical rhythm in typography, technical spacing guide, modern layout', aspectRatio: '3:4' },
  { name: 'Letterform Detail', promptSuffix: 'macro shot of a single character from the logo font, ink bleed or digital precision, font character analysis', aspectRatio: '1:1' },

  // 4. GRAPHIC ASSETS & VISUAL DNA
  { name: 'Geometric Pattern', promptSuffix: 'seamless brand pattern, repeating geometric shapes derived from logo DNA, wallpaper texture, wrapping paper', aspectRatio: '1:1' },
  { name: 'Abstract Supergraphic', promptSuffix: 'large scale abstract supergraphics, cropped logo elements, dynamic background composition, wall art', aspectRatio: '16:9' },
  { name: 'Fluid Brand Shapes', promptSuffix: 'organic abstract shapes for brand background, fluid design, cohesive color palette', aspectRatio: '16:9' },
  { name: 'Iconography Set', promptSuffix: 'custom 12-icon UI set, consistent line weight, minimalist vector style, cohesive brand language', aspectRatio: '4:3' },
  { name: 'Brand Illustration', promptSuffix: 'corporate illustration style guide, flat vector art, abstract conceptual scene, brand colors', aspectRatio: '4:3' },

  // 5. DIGITAL & TEXTURAL STANDARDS
  { name: 'Digital UI Kit', promptSuffix: 'modern UI design system, buttons, input fields, cards, brand colors applied, figma-style preview', aspectRatio: '16:9' },
  { name: 'App Icon System', promptSuffix: 'app icon design guidelines, ios and android rounded square container, logo adaptation', aspectRatio: '1:1' },
  { name: 'Material Texture', promptSuffix: 'logo embossed on premium textured paper, macro shot, tactile feel, luxury branding', aspectRatio: '1:1' },
  { name: 'Metal Fabrication', promptSuffix: '3D laser-cut metal logo signage, brushed steel texture, industrial architectural style', aspectRatio: '16:9' },
  { name: 'Glass Etching', promptSuffix: 'logo etched on frosted glass, office divider context, soft lighting, professional', aspectRatio: '4:3' }
];

export const VIS_CATEGORIES: VisCategory[] = [
  // Corporate
  { name: 'Business Card', promptSuffix: 'high quality professional business card mockup, minimalist modern design, front and back', aspectRatio: '16:9' },
  { name: 'Letterhead', promptSuffix: 'clean corporate letterhead and envelope mockup on a desk, elegant paper texture', aspectRatio: '3:4' },
  { name: 'ID Badge', promptSuffix: 'corporate id badge lanyard mockup, professional look, hanging', aspectRatio: '3:4' },
  { name: 'Notebook', promptSuffix: 'hardcover notebook mockup with logo embossed, black leather texture', aspectRatio: '3:4' },
  { name: 'Presentation Slide', promptSuffix: 'powerpoint presentation slide deck mockup, clean layout, branded master slide', aspectRatio: '16:9' },
  
  // Digital
  { name: 'Mobile App', promptSuffix: 'modern iphone mockups showing a login screen with logo, clean ui, clay render', aspectRatio: '9:16' },
  { name: 'Landing Page', promptSuffix: 'macbook pro laptop mockup, displaying a clean corporate landing page with logo', aspectRatio: '16:9' },
  { name: 'Social Media Feed', promptSuffix: 'instagram grid layout mockup, cohesive brand aesthetic, phone screen', aspectRatio: '1:1' },
  
  // Merch
  { name: 'T-Shirt', promptSuffix: 'black cotton t-shirt mockup with logo on chest, realistic fabric, fashion shoot', aspectRatio: '3:4' },
  { name: 'Tote Bag', promptSuffix: 'canvas tote bag mockup, eco-friendly vibe, screen printed logo', aspectRatio: '3:4' },
  { name: 'Coffee Cup', promptSuffix: 'disposable paper coffee cup mockup, cafe setting, steam', aspectRatio: '1:1' },
  { name: 'Packaging Box', promptSuffix: 'minimalist shipping box mockup, packaging tape with logo pattern', aspectRatio: '4:3' },
  
  // Signage
  { name: 'Office Sign', promptSuffix: '3D outdoor office signage mockup, modern glass building, day time', aspectRatio: '4:3' },
  { name: 'Billboard', promptSuffix: 'large outdoor billboard mockup, city street context, high impact', aspectRatio: '16:9' },
  { name: 'Vehicle Wrap', promptSuffix: 'delivery van wrap mockup, side view, clean branding, white van', aspectRatio: '16:9' },
  { name: 'Storefront', promptSuffix: 'boutique storefront signage, backlit, evening lighting, glowing logo', aspectRatio: '4:3' }
];
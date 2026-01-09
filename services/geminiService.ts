import { GoogleGenAI, Type } from "@google/genai";
import { DesignAnalysis } from "../types";

// Image Model: "nano banana 1" -> gemini-2.5-flash-image
const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
// Text Model for Prompt Engineering: gemini-2.5-flash
const TEXT_MODEL_NAME = 'gemini-2.5-flash';

let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is missing");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

/**
 * Analyzes the user's message to provide a conversational reply AND a structured action.
 */
export const analyzeDesignRequest = async (
  userMessage: string, 
  hasLogo: boolean, 
  hasSelectedImage: boolean
): Promise<DesignAnalysis> => {
  const client = getAI();

  const systemInstruction = `You are a Senior Art Director and Brand Strategist.
Your goal is to chat with the user about their brand and suggest Visual Identity System (VIS) assets to generate.

CONTEXT:
- Logo Uploaded: ${hasLogo}
- Specific Image Selected for Edit: ${hasSelectedImage}

INSTRUCTIONS:
1. RESPONSE: Provide a helpful, professional, and concise response to the user's input. Offer design advice or clarify their request.
2. ACTION DETECTION: Determine if the user wants to perform an action (Create new assets, Modify existing, or Random inspiration).
   - If they ask to "create", "generate", "show me", or name an object (e.g. "coffee cup"), set action type to 'GENERATE'.
   - If they want to "change", "tweak", "make it blue", "remove background" (and an image is selected), set action type to 'MODIFY'.
   - If they say "random", "surprise me", set action type to 'RANDOM'.
   - If they are just saying hello or asking a question, set action to null.
3. OUTPUT: You MUST return a JSON object.

SCHEMA:
{
  "reply": "string (conversational response)",
  "suggestedAction": {
    "type": "GENERATE" | "MODIFY" | "RANDOM",
    "label": "Short Action Name (e.g. 'Generate Billboard')",
    "description": "Short description of what will happen.",
    "searchQuery": "The distilled subject for generation (e.g. 'Modern Billboard') or the edit instruction."
  } (or null)
}`;

  try {
    const response = await client.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: {
        parts: [{ text: userMessage }]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedAction: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                searchQuery: { type: Type.STRING }
              },
              nullable: true
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from analysis");
    return JSON.parse(jsonText) as DesignAnalysis;

  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      reply: "I'm having trouble analyzing that request. Shall we try generating some standard assets?",
      suggestedAction: null
    };
  }
};

/**
 * Uses Gemini 2.5 Flash to generate creative image prompts based on user input.
 * Parses intent for quantity (e.g. "5 images") and subject.
 */
export const generateCreativePrompts = async (userDescription: string): Promise<string[]> => {
  const client = getAI();
  
  // Ensure we have a valid prompt string to avoid "contents is not specified" errors
  const validPrompt = userDescription && userDescription.trim().length > 0 ? userDescription : "Brand Identity Assets";

  const systemInstruction = `You are an expert Creative Director. 
Generate a list of high-quality, photorealistic image generation prompts for brand assets based on the input: "${validPrompt}".

INSTRUCTIONS:
1. Analyze input for QUANTITY (default 3, max 5).
2. Generate diverse prompts if input is generic.
3. Ensure each prompt mentions "logo applied" or "branding visible".
4. OUTPUT: Return ONLY a JSON array of strings.`;

  try {
    const response = await client.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: {
        parts: [{ text: validPrompt }]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [validPrompt, validPrompt, validPrompt];

    return JSON.parse(jsonText) as string[];
  } catch (error) {
    console.error("Prompt Generation Error:", error);
    return [
      `${validPrompt}, photorealistic, professional photography, branding visible`,
      `${validPrompt}, cinematic lighting, close up, logo applied`,
      `${validPrompt}, studio shot, high resolution, minimalist design`
    ];
  }
};

/**
 * Generates an image based on a prompt and an optional reference image (e.g., logo or previous design).
 * Allows specifying an aspect ratio (default 1:1).
 */
export const generateVisImage = async (
  prompt: string,
  referenceImageBase64?: string,
  aspectRatio: string = '1:1'
): Promise<string> => {
  const client = getAI();

  const parts: any[] = [];

  // Add reference image if exists (Logo or Previous Image to modify)
  if (referenceImageBase64) {
    // Strip prefix if present (e.g., "data:image/png;base64,")
    const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png', // Assuming PNG/JPEG, the API handles standard image types
      },
    });
  }

  // Add the text prompt
  parts.push({
    text: prompt,
  });

  try {
    const response = await client.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, // 1:1, 3:4, 4:3, 9:16, 16:9
        }
      }
    });

    // Iterate parts to find the image
    const contentParts = response.candidates?.[0]?.content?.parts;
    if (!contentParts) {
      throw new Error("No content generated");
    }

    for (const part of contentParts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
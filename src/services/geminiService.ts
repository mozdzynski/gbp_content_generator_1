import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GBPPostProposal {
  title: string;
  reasoning: string;
}

export interface GBPPostContent {
  title: string;
  body: string;
  callToAction: string;
}

export const generatePostTitles = async (url: string, serviceOrProduct?: string): Promise<GBPPostProposal[]> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  const serviceContext = serviceOrProduct ? `Focus on the service/product: "${serviceOrProduct}".` : "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the content of the website ${url} and propose 5 engaging titles for Google Business Profile (GBP) posts. 
      The business is located in Kowale. ${serviceContext} Each title should be relevant to the business, catchy, and optimized for local SEO. 
      Provide a brief reasoning for each title. Use Polish language for titles and reasoning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["title", "reasoning"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to generate titles", e);
    throw e;
  }
};

export const generatePostContent = async (url: string, title: string, serviceOrProduct?: string): Promise<GBPPostContent> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  const serviceContext = serviceOrProduct ? `Focus on the service/product: "${serviceOrProduct}".` : "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the website ${url}, generate a full Google Business Profile post for the title: "${title}".
      The business is located in Kowale. ${serviceContext} The post should include:
      1. An engaging body text (150-300 characters).
      2. A clear Call to Action (CTA) like "Zadzwoń teraz", "Dowiedz się więcej", or "Zarezerwuj".
      Keep the tone professional yet approachable. Use Polish language.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING },
            callToAction: { type: Type.STRING },
          },
          required: ["title", "body", "callToAction"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to generate content", e);
    throw e;
  }
};

export const generatePostImage = async (prompt: string, customPrompt?: string): Promise<string> => {
  const finalPrompt = customPrompt || prompt;
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: `A hyper-realistic, professional commercial photograph for a Google Business Profile. 
          The image should be high-quality, well-lit, and adquate to this content: ${finalPrompt}. 
          Avoid text in the image. Style: Modern, clean, professional.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};

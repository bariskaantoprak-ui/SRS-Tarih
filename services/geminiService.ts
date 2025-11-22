import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHistoryCards = async () => {
  throw new Error("AI features are disabled.");
};

export const generateDeepThinkingCards = async () => {
  throw new Error("AI features are disabled.");
};

export const verifyCardWithGoogle = async () => {
  return "AI features are disabled.";
};

export const editHistoryImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error("Görsel oluşturulamadı.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getRelatedStudyTopics = async () => {
  return [];
};
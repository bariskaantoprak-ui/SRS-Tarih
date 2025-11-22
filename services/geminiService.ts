import { GoogleGenAI, Type } from "@google/genai";
import { createNewCard } from "./srsAlgorithm";
import { Flashcard, ExamType } from "../types";

// NOTE: In a real production app, you would never expose the key like this in client code unless it's a personal tool.
// The prompt assumes the key is in process.env.API_KEY
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

// 1. STANDARD GENERATION (Gemini 2.5 Flash)
export const generateHistoryCards = async (
  topic: string, 
  examType: ExamType, 
  count: number = 5
): Promise<Flashcard[]> => {
  
  if (!apiKey) throw new Error("API Key eksik.");

  const prompt = `
    Sen ${examType} (Tarih) alanında uzman bir soru hazırlayıcısın.
    Konu: "${topic}".
    Görevin: Bu konuyla ilgili en kritik bilgileri içeren ${count} adet flashcard hazırla.
    
    ÇOK ÖNEMLİ KURALLAR (SRS UYUMLULUĞU İÇİN):
    1. Cevaplar ASLA uzun cümle olmamalıdır.
    2. Cevaplar "Tek Kelime" veya "En fazla 3 kelimelik kısa bir öbek" olmalıdır.
    3. Sorular "Nokta atışı" bilgi sormalıdır.
    4. Çıktıyı sadece JSON formatında ver.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              tag: { type: Type.STRING }
            },
            required: ["question", "answer", "tag"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI boş yanıt döndürdü.");
    const rawCards = JSON.parse(jsonText) as Array<{question: string, answer: string, tag: string}>;
    return rawCards.map(rc => createNewCard(rc.question, rc.answer, rc.tag));

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

// 2. DEEP THINKING MODE (Gemini 3 Pro)
export const generateDeepThinkingCards = async (
  topic: string,
  count: number = 3
): Promise<Flashcard[]> => {
  if (!apiKey) throw new Error("API Key eksik.");

  // Thinking Budget set to Max (32k) for complex reasoning on history causality
  const prompt = `
    Konu: ${topic}.
    Bu konu hakkında derinlemesine tarihsel analiz gerektiren, ancak cevabı net olan üst düzey (ÖABT/Akademik) ${count} adet soru hazırla.
    Düşünme sürecini kullanarak olaylar arasındaki neden-sonuç ilişkilerini, kronolojik tuzakları ve detay bilgileri analiz et.
    Sonuç olarak sadece JSON döndür.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // MAX Thinking budget
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              tag: { type: Type.STRING }
            },
            required: ["question", "answer", "tag"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Thinking Mode yanıt vermedi.");
    const rawCards = JSON.parse(jsonText) as Array<{question: string, answer: string, tag: string}>;
    return rawCards.map(rc => createNewCard(rc.question, rc.answer, rc.tag));

  } catch (error) {
    console.error("Thinking Mode Error:", error);
    throw error;
  }
};

// 3. GOOGLE SEARCH GROUNDING (Gemini 2.5 Flash)
export const verifyCardWithGoogle = async (question: string, answer: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key eksik.");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Bu tarih sorusu ve cevabının doğruluğunu Google Arama sonuçlarını kullanarak teyit et ve kısa bir ek bilgi ver. Soru: ${question}, Cevap: ${answer}`,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
      },
    });

    // Extract grounding metadata if needed, but here we just return the text which includes cited info
    const text = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    let resultText = text || "Bilgi bulunamadı.";
    
    if (chunks && chunks.length > 0) {
        const sources = chunks
          .filter((c: any) => c.web?.uri)
          .map((c: any) => `\n- [Kaynak](${c.web.uri})`)
          .join('');
        resultText += "\n\nKaynaklar:" + sources;
    }

    return resultText;
  } catch (error) {
    console.error("Search Error:", error);
    return "Doğrulama sırasında hata oluştu.";
  }
};

// 4. IMAGE EDITING (Gemini 2.5 Flash Image - Nano Banana)
export const editHistoryImage = async (base64Image: string, instruction: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key eksik.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/png', 
            },
          },
          {
            text: instruction, // e.g., "Add a retro sepia filter", "Remove the text"
          },
        ],
      },
    });

    // Iterate to find image part
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error("Görsel oluşturulamadı.");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};
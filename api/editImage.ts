import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { prompt, base64Image, mimeType } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType } },
          { text: prompt }
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.status(200).json({
          image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        });
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

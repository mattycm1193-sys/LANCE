import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { prompt, systemInstruction } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

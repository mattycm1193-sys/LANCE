import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, systemInstruction, model } = req.body;

    // Initialize inside the handler to ensure env variables are read at runtime
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const response = await ai.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

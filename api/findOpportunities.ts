import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { niche } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find current high-demand monetization opportunities and revenue trends for a freelancer in the ${niche} niche. Focus on high-conversion services and emerging platforms.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

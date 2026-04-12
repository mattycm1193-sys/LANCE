import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { systemInstruction, model = "gemini-3-flash-preview", message, history = [] } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    // We will use generateContent and pass the history manually.
    // The history should be in the format that the GenAI SDK expects for multi-turn conversations.
    // Contents structure: [{role: 'user', parts: [{text: '...'}]}, {role: 'model', parts: [{text: '...'}]}]

    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

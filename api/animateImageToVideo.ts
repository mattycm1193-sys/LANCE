import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { base64Image, mimeType, prompt, aspectRatio = "16:9" } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio,
      },
    });

    let result = operation;
    while (!result.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      result = await ai.operations.getVideosOperation({ operation: result });
    }

    if (result.response?.generatedVideos?.[0]?.video?.uri) {
      return res.status(200).json({ videoUri: result.response.generatedVideos[0].video.uri });
    }
    throw new Error("Video generation failed");
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

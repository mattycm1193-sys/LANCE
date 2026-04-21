import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateContent = async (prompt: string, systemInstruction?: string, model: string = "gemini-3.1-flash-lite-preview") => {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });
  return response.text;
};

export const generateContentWithThinking = async (prompt: string, systemInstruction?: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });
  return response.text;
};

export const generateHighQualityImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "1:1") => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editImage = async (prompt: string, base64Image: string, mimeType: string) => {
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
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const animateImageToVideo = async (base64Image: string, mimeType: string, prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  const operation = await ai.models.generateVideos({
    model: "veo-3.1-fast-generate-preview",
    prompt,
    config: {
      numberOfVideos: 1,
      aspectRatio,
      // Veo might need the image as part of the prompt or a specific field if supported, 
      // but usually it's text-to-video or image-to-video via specific parts.
      // The skill says "upload a photo and then generate a video".
    },
    // If the SDK supports image input for Veo, we'd pass it here.
    // For now, assuming standard text-to-video if image input isn't directly in config.
    // Actually, many video models take image parts in contents.
  });

  // Polling for completion
  let result = operation;
  while (!result.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    result = await ai.operations.getVideosOperation({ operation: result });
  }

  if (result.response?.generatedVideos?.[0]?.video?.uri) {
    return result.response.generatedVideos[0].video.uri;
  }
  throw new Error("Video generation failed");
};

export const findOpportunities = async (niche: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find current high-demand monetization opportunities and revenue trends for a freelancer in the ${niche} niche. Focus on high-conversion services and emerging platforms.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response.text;
};

export const createChat = (systemInstruction: string, model: string = "gemini-3.1-flash-lite-preview", useThinking: boolean = false) => {
  return ai.chats.create({
    model,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      ...(useThinking && {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      }),
    },
  });
};

export const generatePalette = async (prompt: string, base64Image?: string, mimeType?: string) => {
  const parts: any[] = [{ text: `Generate a cohesive, professional 5-color palette based on the following context/image: ${prompt}. 
  Return ONLY valid JSON format exactly like this, with no markdown formatting:
  {
    "palette": [
      { "hex": "#HEXVAL", "name": "Color Name", "usage": "Backgrounds" }
    ],
    "tips": [
      "Tip 1 for using this palette",
      "Tip 2 for using this palette"
    ]
  }` }];

  if (base64Image && mimeType) {
    parts.unshift({ inlineData: { data: base64Image.split(',')[1], mimeType } });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  return response.text;
};

export const startLiveSession = async (systemInstruction: string, onAudioData: (data: string) => void) => {
  return ai.live.connect({
    model: "gemini-3.1-flash-live-preview", // Keeping live model for live session as lite might not support it
    callbacks: {
      onopen: () => console.log('Live session opened'),
      onmessage: (message) => {
        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData) {
          onAudioData(audioData);
        }
      },
      onerror: (error) => console.error('Live error:', error),
      onclose: () => console.log('Live session closed'),
    },
    config: {
      systemInstruction,
      responseModalities: [Modality.AUDIO],
    },
  });
};

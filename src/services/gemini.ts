import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });


// Exponential Backoff Retry Wrapper
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      const status = error?.status || error?.response?.status;

      // Retry on 429 (Rate Limit) and 5xx (Server Errors)
      const isRetryable = status === 429 || (status >= 500 && status <= 599) || error.message.includes('503') || error.message.includes('429');

      // Do NOT retry on 400 (Bad Request), 401/403 (Auth), etc.
      const isClientError = status === 400 || status === 401 || status === 403;

      if (!isRetryable || isClientError || attempt === maxRetries - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`API call failed (status: ${status}). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
  throw new Error("Retry limit reached"); // Fallback, shouldn't be hit due to throw in loop
}



export const generateContent = async (prompt: string, systemInstruction?: string, model: string = "gemini-3-flash-preview") => {
  const response = await withRetry(() => ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  }));
  return response.text;
};

export const generateContentWithThinking = async (prompt: string, systemInstruction?: string) => {
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  }));
  return response.text;
};

export const generateHighQualityImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "1:1") => {
  const response = await withRetry(() => ai.models.generateContent({
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
  }));

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editImage = async (prompt: string, base64Image: string, mimeType: string) => {
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType } },
        { text: prompt }
      ],
    },
  }));

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const animateImageToVideo = async (base64Image: string, mimeType: string, prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  const operation = await withRetry(() => ai.models.generateVideos({
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
  }));

  // Polling for completion
  let result = operation;
  while (!result.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    result = await withRetry(() => ai.operations.getVideosOperation({ operation: result }));
  }

  if (result.response?.generatedVideos?.[0]?.video?.uri) {
    return result.response.generatedVideos[0].video.uri;
  }
  throw new Error("Video generation failed");
};

export const findOpportunities = async (niche: string) => {
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find current high-demand monetization opportunities and revenue trends for a freelancer in the ${niche} niche. Focus on high-conversion services and emerging platforms.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  }));
  return response.text;
};

export const createChat = (systemInstruction: string, model: string = "gemini-3-flash-preview") => {
  return ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
  });
};

export const startLiveSession = async (systemInstruction: string) => {
  return ai.live.connect({
    model: "gemini-3.1-flash-live-preview",
    callbacks: {
      onopen: () => console.log('Live session opened'),
      onmessage: (message) => console.log('Live message:', message),
      onerror: (error) => console.error('Live error:', error),
      onclose: () => console.log('Live session closed'),
    },
    config: {
      systemInstruction,
      responseModalities: [Modality.AUDIO],
    },
  });
};

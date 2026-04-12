// Exponential Backoff Retry Wrapper (Ported from main)
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
      const isRetryable = status === 429 || (status >= 500 && status <= 599) || error?.message?.includes('503') || error?.message?.includes('429');

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
  throw new Error("Retry limit reached");
}

// Helper function to apply retry logic to secure backend fetch calls
async function fetchWithRetry(url: string, body: any) {
  return withRetry(async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      // Attach the status to the error so withRetry can read it
      const error: any = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    return await response.json();
  });
}

export const generateContent = async (prompt: string, systemInstruction?: string, model: string = "gemini-3-flash-preview") => {
  const data = await fetchWithRetry('/api/generateContent', { prompt, systemInstruction, model });
  return data.text;
};

export const generateContentWithThinking = async (prompt: string, systemInstruction?: string) => {
  const data = await fetchWithRetry('/api/generateContentWithThinking', { prompt, systemInstruction });
  return data.text;
};

export const generateHighQualityImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "1:1") => {
  const data = await fetchWithRetry('/api/generateHighQualityImage', { prompt, size, aspectRatio });
  return data.image;
};

export const editImage = async (prompt: string, base64Image: string, mimeType: string) => {
  const data = await fetchWithRetry('/api/editImage', { prompt, base64Image, mimeType });
  return data.image;
};

export const animateImageToVideo = async (base64Image: string, mimeType: string, prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  const data = await fetchWithRetry('/api/animateImageToVideo', { base64Image, mimeType, prompt, aspectRatio });
  return data.videoUri;
};

export const findOpportunities = async (niche: string) => {
  const data = await fetchWithRetry('/api/findOpportunities', { niche });
  return data.text;
};

export const createChat = (systemInstruction: string, model: string = "gemini-3-flash-preview") => {
  let history: { role: string; text: string }[] = [];

  return {
    sendMessage: async (message: string) => {
      // We also wrap the chat messages in the retry logic for resilience
      const data = await fetchWithRetry('/api/createChat', { systemInstruction, model, message, history });

      history.push({ role: 'user', text: message });
      history.push({ role: 'model', text: data.text });

      return { text: data.text };
    }
  };
};

export const startLiveSession = async (systemInstruction: string) => {
  console.warn("Live sessions via WebRTC/WebSockets are not fully proxy-able in serverless without a specific WebSocket backend setup. Returning a mocked error.");
  throw new Error("Live sessions are currently disabled due to security restrictions.");
};
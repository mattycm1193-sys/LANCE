export const generateContent = async (prompt: string, systemInstruction?: string, model: string = "gemini-3-flash-preview") => {
  const response = await fetch('/api/generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction, model })
  });
  if (!response.ok) throw new Error("Failed to generate content");
  const data = await response.json();
  return data.text;
};

export const generateContentWithThinking = async (prompt: string, systemInstruction?: string) => {
  const response = await fetch('/api/generateContentWithThinking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction })
  });
  if (!response.ok) throw new Error("Failed to generate content");
  const data = await response.json();
  return data.text;
};

export const generateHighQualityImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "1:1") => {
  const response = await fetch('/api/generateHighQualityImage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, size, aspectRatio })
  });
  if (!response.ok) throw new Error("Failed to generate image");
  const data = await response.json();
  return data.image;
};

export const editImage = async (prompt: string, base64Image: string, mimeType: string) => {
  const response = await fetch('/api/editImage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, base64Image, mimeType })
  });
  if (!response.ok) throw new Error("Failed to edit image");
  const data = await response.json();
  return data.image;
};

export const animateImageToVideo = async (base64Image: string, mimeType: string, prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  const response = await fetch('/api/animateImageToVideo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType, prompt, aspectRatio })
  });
  if (!response.ok) throw new Error("Failed to animate image");
  const data = await response.json();
  return data.videoUri;
};

export const findOpportunities = async (niche: string) => {
  const response = await fetch('/api/findOpportunities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ niche })
  });
  if (!response.ok) throw new Error("Failed to find opportunities");
  const data = await response.json();
  return data.text;
};

// Modifying createChat to return an object with a sendMessage function
// to somewhat match the GenAI SDK interface, but managing history manually.
export const createChat = (systemInstruction: string, model: string = "gemini-3-flash-preview") => {
  let history: { role: string; text: string }[] = [];

  return {
    sendMessage: async (message: string) => {
      const response = await fetch('/api/createChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction, model, message, history })
      });
      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      // Update history
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

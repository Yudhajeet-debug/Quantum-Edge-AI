import { GoogleGenAI, Chat, Modality, Type, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { AspectRatio, VideoAspectRatio } from '../types';

// IMPORTANT: This is a placeholder for the API key.
// In a real-world scenario, this should be handled securely.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found. Please set it in your environment variables.");
}

const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

// --- Investment Assistant ---
export const getFinancialAdvice = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  user: { name: string; gender: string } | null
): Promise<GenerateContentResponse> => {
  const ai = getAI();
  const userName = user?.name || 'the user';
  const systemInstruction = `You are an AI Investment Assistant. The user's name is ${userName}. Address them by their name when it feels natural and appropriate. You are an AI and not a certified financial advisor. Keep your tone professional but friendly.`;

  const chat = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }],
      systemInstruction,
    },
    history,
  });
  const response = await chat.sendMessage({ message });
  return response;
};


// --- Escape Suggester ---
export const getTravelSuggestion = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  location: { latitude: number; longitude: number } | null,
  user: { name: string; gender: string } | null
): Promise<GenerateContentResponse> => {
  const ai = getAI();
  const userName = user?.name || 'the user';
  const systemInstruction = `You are a friendly and enthusiastic travel assistant named the Escape Suggester. The user's name is ${userName}. Address them by name sometimes.`;
  
  const config: any = {
    tools: [{ googleMaps: {} }, { googleSearch: {} }],
    systemInstruction,
  };
  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: location,
      },
    };
  }
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config,
    history,
  });
  
  const response = await chat.sendMessage({ message });
  return response;
};

// --- Image Generation ---
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio,
    },
  });

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// --- Image Editing ---
export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: imageBase64, mimeType } },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part?.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated.");
};

// --- Video Generation ---
export const generateVideo = async (prompt: string | null, imageBase64: string, mimeType: string, aspectRatio: VideoAspectRatio) => {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this image beautifully.',
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed or returned no link.");
    }
    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

// --- Creative Writer ---
export const generateCreativeText = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: audioBase64, mimeType } },
                { text: "Transcribe the audio." },
            ],
        },
    });
    return response.text;
};

// --- Song Writer ---
export const generateSong = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert AI songwriter. Your task is to write lyrics for a short, uplifting song based on the user's prompt. The song must have a clear and conventional structure: Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus. Ensure the lyrics are creative, coherent, and fit an uplifting tone. Use markdown for formatting, clearly labeling each section (e.g., **Verse 1**). Prompt: "${prompt}"`,
        config: {
            thinkingConfig: { thinkingBudget: 0 },
        },
    });
    return response.text;
};

export const textToSpeech = async (text: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Perform the following lyrics as a clear, melodic, a capella vocal track. Invent a suitable melody and rhythm that matches the emotional tone of the lyrics. The performance should sound like a studio-recorded vocal performance. Do not add any instrumental accompaniment. Here are the lyrics: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS failed to generate audio.");
    return base64Audio;
};
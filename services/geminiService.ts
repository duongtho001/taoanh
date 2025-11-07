import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { FashionFormData, UploadedImage } from "../types";
import { apiKeyManager } from "./apiKeyManager";

const imageGenerationModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-pro';

async function executeWithRetry<T>(
    apiCall: (ai: GoogleGenAI) => Promise<T>
): Promise<T> {
    // Prioritize environment variable
    const envApiKey = process.env.API_KEY;
    if (envApiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey: envApiKey });
            return await apiCall(ai);
        } catch (error) {
            console.error("API Key from environment variable failed.", error);
            throw new Error("API Key được cung cấp qua biến môi trường không hợp lệ hoặc đã hết hạn.");
        }
    }

    // Fallback to user-provided keys from localStorage
    const keys = apiKeyManager.getKeys();
    if (keys.length === 0) {
        throw new Error("Không tìm thấy API Key. Vui lòng thêm key trong phần Cài đặt hoặc thiết lập biến môi trường API_KEY.");
    }

    const startIndex = apiKeyManager.getCurrentIndex();
    for (let i = 0; i < keys.length; i++) {
        const keyIndex = (startIndex + i) % keys.length;
        const key = keys[keyIndex];
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            const result = await apiCall(ai);
            apiKeyManager.setCurrentIndex(keyIndex); // Success! Save the working key index.
            return result;
        } catch (error) {
            console.warn(`API Key at index ${keyIndex} failed. Trying next key.`, error);
            if (i === keys.length - 1) { // Last key failed
                throw new Error("Tất cả các API Key bạn cung cấp đều không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong phần Cài đặt.");
            }
        }
    }
    // This should not be reached, but as a fallback:
    throw new Error("Không thể thực hiện yêu cầu với các API Key đã cung cấp.");
}

// Helper to handle image response
const extractBase64Image = (response: GenerateContentResponse): string => {
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image data found in response");
};

export const getBackgroundSuggestions = async (fashionType: string): Promise<string[]> => {
  return executeWithRetry(async (ai) => {
    try {
      const prompt = `Provide 5 creative and concise background suggestions (under 10 words each) for a "${fashionType}" photoshoot. Return the result as a JSON array of strings. For example: ["Cosmic nebula", "Gothic library", "Neon-lit alley"]`;
      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error getting background suggestions:", error);
      throw new Error("Failed to get AI suggestions. Please try again.");
    }
  });
};

export const getBackgroundSuggestionsFromImage = async (image: UploadedImage): Promise<string[]> => {
  return executeWithRetry(async (ai) => {
    try {
      const prompt = `Analyze the subject, clothing, and overall mood of the person in this image. Based on your analysis, provide 5 creative and concise background suggestions (under 10 words each) that would complement the subject well. Return the result as a JSON array of strings.`;
      const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
      const textPart = { text: prompt };
      const response = await ai.models.generateContent({
        model: textModel,
        contents: { parts: [textPart, imagePart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error getting background suggestions from image:", error);
      throw new Error("Failed to get AI suggestions from the image. Please try again.");
    }
  });
};

export const getPoseSuggestions = async (): Promise<string[]> => {
  return executeWithRetry(async (ai) => {
    try {
      const prompt = `Provide 5 creative and concise pose descriptions (under 10 words each) suitable for a fashion photoshoot. Return the result as a JSON array of strings.`;
      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Error getting pose suggestions:", error);
      throw new Error("Failed to get AI suggestions for poses. Please try again.");
    }
  });
};

export const generateFashionImage = async (image: UploadedImage, formData: FashionFormData): Promise<string[]> => {
  const promises = Array(formData.numVariations).fill(0).map(() => executeWithRetry(async (ai) => {
    const prompt = `Generate a new image based on the provided photo. The subject should be wearing "${formData.fashionType}" style clothing. The background should be "${formData.backgroundStyle}". Maintain the subject's general appearance and pose from the original image. The final image must have a ${formData.aspectRatio} aspect ratio.`;
    const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    });
    return extractBase64Image(response);
  }));
  return Promise.all(promises);
};

export const upscaleImage = async (base64Image: string): Promise<string> => {
  return executeWithRetry(async (ai) => {
    const prompt = "Upscale this image to a higher resolution, like 8K. Enhance fine details, textures, and clarity while preserving the original composition and style.";
    const imagePart = { inlineData: { data: base64Image, mimeType: 'image/png' } };
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    });
    return extractBase64Image(response);
  });
};

export const changeBackgroundImage = async (image: UploadedImage, backgroundPrompt: string, aspectRatio: string): Promise<string> => {
  return executeWithRetry(async (ai) => {
    const prompt = `Carefully segment the main subject from the background in the provided image. Then, replace the original background with a new one described as: "${backgroundPrompt}". Ensure the lighting on the subject matches the new background for a realistic composition. The final composition must have a ${aspectRatio} aspect ratio.`;
    const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    });
    return extractBase64Image(response);
  });
};

export const transferPose = async (subjectImage: UploadedImage, posePrompt: string, numVariations: number, aspectRatio: string): Promise<string[]> => {
  const promises = Array(numVariations).fill(0).map((_, index) => executeWithRetry(async (ai) => {
    let specificPrompt = `Analyze the person in the provided image. Your task is to generate a new image where this person is in a completely new, professional fashion pose. You must retain the person's exact appearance, clothing, and the original background. Only the pose should change. The final image must have a ${aspectRatio} aspect ratio.`;
    if (posePrompt.trim()) {
        specificPrompt += ` The new pose should be inspired by: "${posePrompt}". For this specific variation (${index + 1} of ${numVariations}), interpret that concept in a completely unique way. Make it distinct from any other poses.`;
    } else {
        specificPrompt += ` Generate a unique, creative, and aesthetically pleasing fashion pose. This is variation ${index + 1} of ${numVariations}, so ensure it is dramatically different from any other potential poses you might generate. Try a completely different angle, body position, or mood.`;
    }
    const subjectImagePart = { inlineData: { data: subjectImage.data, mimeType: subjectImage.mimeType } };
    const textPart = { text: specificPrompt };
    const response = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: { parts: [textPart, subjectImagePart] },
      config: { responseModalities: [Modality.IMAGE] },
    });
    return extractBase64Image(response);
  }));
  return Promise.all(promises);
};

export const changeExpression = async (image: UploadedImage, expressionPrompt: string, aspectRatio: string): Promise<string> => {
  return executeWithRetry(async (ai) => {
    const prompt = `Carefully analyze the person in the provided image. Your task is to subtly change their facial expression to be '${expressionPrompt}'. It is crucial that you only alter the facial features related to the expression. Do not change the person's identity, hair, clothing, head position, or the background. The final image must have a ${aspectRatio} aspect ratio.`;
    const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    });
    return extractBase64Image(response);
  });
};

const GEMINI_BILLING_API_KEY = process.env.GEMINI_BILLING_API_KEY;

export const callBillingAPI = async (endpoint: string, data: any) => {
    const response = await fetch(`https://api.gemini.com/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_BILLING_API_KEY}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Billing API error: ${response.statusText}`);
    }

    return response.json();
};
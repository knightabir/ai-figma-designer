import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCCd5XvH5ys8y5P-GbmwDVzgX9sQXUENZI";

export const createAIConfig = () => {
  const genAI = new GoogleGenerativeAI(API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  return {
    model,
    chatSession,
    generationConfig,
  };
};

'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type BioTone = 'Chill' | 'Witty' | 'Romantic';

export async function generateBioAction(currentBio: string, tone: BioTone): Promise<string> {
  // Graceful fallback if no key is set
  if (!process.env.GEMINI_API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[Mock AI Result] A ${tone} version of: ${currentBio || "I like vibes"}`;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Context: You are a witty dating profile assistant for the Indian market app 'WYTH'.
    Task: Rewrite the following bio to have a "${tone}" tone.
    Constraints: Max 2 sentences. No hashtags. Do not use quotes.
    Current Draft: "${currentBio || "I enjoy travel and food"}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("AI Error:", error);
    return "AI is busy right now. Try again later.";
  }
}
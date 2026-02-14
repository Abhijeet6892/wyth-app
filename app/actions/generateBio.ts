"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export type BioTone = "Chill" | "Witty" | "Romantic";

export async function generateBioAction(rawBio: string, tone: BioTone) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key not configured");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Rewrite this dating bio in a ${tone.toLowerCase()} tone (under 100 words): "${rawBio}"`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/^["'\`]+|["'\`]+$/g, '').trim();
    
    return text;
  } catch (error: any) {
    console.error("Bio error:", error);
    throw new Error(error.message || "AI service error");
  }
}
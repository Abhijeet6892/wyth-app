'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type BioTone = 'Chill' | 'Witty' | 'Romantic';

export async function generateBioAction(currentBio: string, tone: BioTone): Promise<string> {
  // Graceful fallback if no key is set
  if (!process.env.GEMINI_API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[Mock AI Result] A ${tone} rewrite of: ${currentBio || "I like vibes"}`;
  }

  // Safety check for short input
  if (!currentBio || currentBio.length < 5) {
      return "Tell me a little more about yourself first, and I'll polish it!";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let vibeInstruction = "";
  if (tone === 'Chill') {
      vibeInstruction = "You are a laid-back, genuine friend. Keep it low-key, authentic, and easygoing. Use lowercase styling if it fits. No try-hard energy.";
  } else if (tone === 'Witty') {
      vibeInstruction = "You are clever and playful. Add a smart observation or a light tease. Keep it sharp but not arrogant.";
  } else if (tone === 'Romantic') {
      vibeInstruction = "You are sincere and looking for a real connection. Focus on shared dreams and warmth. Use inviting language.";
  }

  const prompt = `
    Role: Expert Dating Profile Ghostwriter.
    Goal: Rewrite the user's draft bio to sound more "${tone}" and attractive.
    
    User's Draft: "${currentBio}"
    
    Strict Constraints:
    1. LENGTH: Keep it roughly the same length as the draft (2-3 sentences). Do NOT shorten it to 5 words.
    2. VOCABULARY: Use simple, conversational English. NO complex words like 'aficionado', 'sapiosexual', 'wanderlust'.
    3. SUBSTANCE: Keep the specific facts (hobbies, jobs) the user mentioned. Do not invent facts.
    4. TONE: Apply the following vibe: ${vibeInstruction}
    
    Output: Just the new bio text. No quotes.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("AI Error:", error);
    return "AI is taking a break. Try again later.";
  }
}
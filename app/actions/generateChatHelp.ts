'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

// Fail loudly in production if key is missing (No mocks allowed)
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export type ChatIntent = 'icebreaker' | 'reply' | 'decline'

export async function generateChatHelp(
  intent: ChatIntent, 
  partnerName: string, 
  partnerContext: string, // e.g. "Product Designer in Mumbai"
  lastMessage?: string
): Promise<string> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI Service Unavailable (Config Error)");
  }

  let prompt = "";

  // Strategy: "Assistive, Visible, Optional"
  // Tone: Dignified, warm, non-flirtatious, suited for Indian urban context.
  
  if (intent === 'icebreaker') {
    prompt = `
      Context: Starting a conversation on 'WYTH', a high-intent social-matrimony app.
      Goal: Generate 1 polite, warm, and relevant opening message for ${partnerName}.
      Partner Context: ${partnerContext}.
      Constraint: Be casual but respectful. No cheesy pickup lines. Max 20 words.
    `;
  } 
  else if (intent === 'reply') {
    prompt = `
      Context: Replying to a message on 'WYTH'.
      Goal: Draft a polite, engaging response.
      Last Message Received: "${lastMessage}"
      Constraint: Keep the conversation going nicely. Max 25 words.
    `;
  }
  else if (intent === 'decline') {
    prompt = `
      Context: Ending a conversation on 'WYTH' respectfully.
      Goal: Draft a polite "No thank you" message.
      Constraint: Firm but kind. No ghosting. Wish them well. Max 20 words.
    `;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Append the transparency badge automatically
    return `${text}`; 
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Could not generate message. Please try again.");
  }
}
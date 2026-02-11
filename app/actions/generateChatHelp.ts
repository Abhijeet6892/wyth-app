'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type ChatIntent = 'icebreaker' | 'reply' | 'decline';
export type ChatTone = 'Chill' | 'Witty' | 'Romantic'; // New Type

export async function generateChatHelp(
  intent: ChatIntent, 
  partnerName: string, 
  partnerContext: string, // e.g. "Product Designer in Mumbai, likes Hiking"
  lastMessage: string = "",
  tone: ChatTone = 'Chill' // Default to Chill
): Promise<string> {
  
  if (!process.env.GEMINI_API_KEY) {
    return "[Mock AI] Hey, nice to meet you!";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let toneInstruction = "";
  if (tone === 'Chill') toneInstruction = "Casual, friendly, low-pressure. Like a text to a friend. Use simple words.";
  if (tone === 'Witty') toneInstruction = "Playful, clever, maybe a light tease. Shows intelligence but keep it kind.";
  if (tone === 'Romantic') toneInstruction = "Warm, sincere, complimentary. Shows genuine interest and intent.";

  let prompt = "";

  // 1. ICEBREAKER (Starting Chat)
  if (intent === 'icebreaker') {
    prompt = `
      Context: Starting a conversation on 'WYTH', a high-intent dating app.
      Goal: Write ONE opening message to ${partnerName}.
      Tone: ${toneInstruction}
      Partner Info: ${partnerContext}
      Constraints:
      - Max 20 words.
      - Ask a specific question related to their info.
      - No cheesy pickup lines.
      - Natural phrasing (no 'Greetings', 'Salutations').
    `;
  } 
  
  // 2. REPLY (Continuing Chat)
  else if (intent === 'reply') {
    prompt = `
      Context: Replying to a message on 'WYTH'.
      Goal: Draft a response that keeps the conversation flowing.
      Tone: ${toneInstruction}
      Last Message Received: "${lastMessage}"
      Constraints:
      - Max 25 words.
      - Be relevant to the last message.
      - End with a question or hook if possible.
    `;
  } 
  
  // 3. DECLINE (Ending Chat)
  else if (intent === 'decline') {
    prompt = `
      Context: Ending a conversation on 'WYTH' respectfully.
      Goal: Write a polite "No thank you" message to end things.
      Tone: ${toneInstruction} (Note: Even for Witty/Romantic, keep this clear and firm).
      Constraints:
      - Firm boundaries but dignified.
      - No ghosting. Wish them well.
      - Max 20 words.
    `;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Remove quotes if the AI adds them
    text = text.replace(/^"|"$/g, '');
    
    return text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Could not generate message. Please try again.";
  }
}
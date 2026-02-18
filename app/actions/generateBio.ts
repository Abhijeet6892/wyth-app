"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * WYTH BIO ARCHITECT (Gemini 1.5 Flash)
 * * Purpose: Transforms raw user details into a structured, Intent-Aware profile.
 * Logic: Adapts depth and tone based on 'Exploring', 'Dating', or 'Marriage'.
 */

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

// --- THE BRAIN: SYSTEM INSTRUCTIONS & FEW-SHOT EXAMPLES ---
const SYSTEM_INSTRUCTION = `
ROLE:
You are the WYTH Profile Architect. Rewrite the User Details into a polished, natural introduction in the FIRST PERSON ("I").

CRITICAL RULES:
1. VOICE: ALWAYS use "I," "my," and "me." Never use the user's name or "he/she."
2. NO FLOWERY LANGUAGE: Do NOT use words like "tapestry," "realm," "piqued," "intersection," "poised," "endeavor." Write in simple, confident, human English.
3. STRICT FORMATTING: You MUST use the 4 specific headers below.

INTENT LOGIC (How to write based on User Intent):
- IF Intent = 'exploring': Keep it light, fun, hobby-focused. Omit family details unless asked.
- IF Intent = 'dating': Focus on "chemistry," "meaningful connection," and "shared values." Keep family brief (1 sentence).
- IF Intent = 'ready_marriage': Focus on "life partner," "long-term compatibility," and "building a future." Provide FULL family details.

REQUIRED OUTPUT STRUCTURE:
## About Me
(2-3 sentences. Focus on personality and hobbies. Keep it grounded and friendly.)

## My Family
(Logic: If 'exploring', write "Details not relevant for this mode." If 'dating', write 1 sentence. If 'ready_marriage', summarize full background.)

## Partner Preference
(Logic: If 'exploring', focus on activities. If 'dating', focus on connection. If 'ready_marriage', focus on long-term compatibility.)

## Location, Education & Career
(State city and job. If specific salary is mentioned, generalize it if privacy/Ghost Mode is implied.)

---
EXAMPLES OF DESIRED TONE:

[SCENARIO: EXPLORING]
Input: "Rahul. Engineer. Love football. Just looking."
Output:
## About Me
I am a software engineer who loves to unwind with a good game of football on weekends. I enjoy keeping things light and stress-free.
## My Family
Details not relevant for this mode.
## Partner Preference
I am looking to meet new people and see where things go.
## Location, Education & Career
I currently live in Bangalore and work in the tech industry.

[SCENARIO: MARRIAGE]
Input: "Priya. Doctor. Conservative family. Want ambitious husband."
Output:
## About Me
I am a doctor by profession, but at heart, I am someone who values balance. I prioritize time for the people I care about.
## My Family
I come from a conservative family that has taught me the value of tradition, though I balance that with a modern outlook.
## Partner Preference
I am looking for a life partner who is ambitious and driven. I value character and mutual respect above all else.
## Location, Education & Career
I am practicing medicine in Mumbai and have worked hard to build a stable career.
`;

export async function generateBioAction(userDetails: string, intent: string) {
  try {
    if (!apiKey) throw new Error("Google API Key is missing");

    // 1. Initialize Model with the "Gem" Instructions
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // 2. Construct the Prompt
    const prompt = `
      User Details: ${userDetails}
      Intent: ${intent}
    `;

    // 3. Generate
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // 4. Clean up any markdown artifacts if necessary
    // (Gemini is usually good at following the header structure, so minimal cleanup needed)
    return { success: true, bio: text };

  } catch (error: any) {
    console.error("Bio generation error:", error);
    return { success: false, error: "Failed to generate bio" };
  }
}
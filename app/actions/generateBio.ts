"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export type BioTone = "Grounded" | "Thoughtful" | "Warm";

/**
 * WYTH BIO GENERATOR
 * 
 * Philosophy:
 * - High-intent, not swipe culture
 * - Emotionally mature, not cringe
 * - Dignified, not desperate
 * - Personal, not template
 */

// Parse keywords into structured data
function parseKeywords(input: string): {
  profession?: string;
  city?: string;
  hobbies: string[];
  family?: string;
  intent?: string;
} {
  const lower = input.toLowerCase();
  
  // Extract profession (common patterns)
  const professions = ['engineer', 'doctor', 'consultant', 'designer', 'architect', 'lawyer', 'teacher', 'analyst', 'manager', 'developer', 'entrepreneur'];
  const profession = professions.find(p => lower.includes(p));
  
  // Extract city (Indian cities)
  const cities = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'hyderabad', 'pune', 'kolkata', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kochi', 'goa'];
  const city = cities.find(c => lower.includes(c));
  
  // Extract hobbies
  const hobbyPatterns = ['hiking', 'travel', 'reading', 'music', 'photography', 'cooking', 'fitness', 'yoga', 'art', 'cinema', 'theatre', 'sports', 'cricket', 'chess'];
  const hobbies = hobbyPatterns.filter(h => lower.includes(h));
  
  // Detect family mention
  const hasFamily = lower.includes('family') || lower.includes('parents') || lower.includes('siblings');
  
  // Detect intent
  const hasMarriage = lower.includes('marriage') || lower.includes('settle') || lower.includes('serious') || lower.includes('long-term') || lower.includes('committed');
  
  return {
    profession: profession ? profession.charAt(0).toUpperCase() + profession.slice(1) : undefined,
    city: city ? city.charAt(0).toUpperCase() + city.slice(1) : undefined,
    hobbies: hobbies.map(h => h.charAt(0).toUpperCase() + h.slice(1)),
    family: hasFamily ? 'family-oriented' : undefined,
    intent: hasMarriage ? 'ready for marriage' : 'looking for something meaningful'
  };
}

export async function generateBioAction(rawInput: string, tone: BioTone = "Grounded"): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    // Parse keywords into structure
    const parsed = parseKeywords(rawInput);
    
    // If parsing failed completely, work with raw input
    const hasStructure = parsed.profession || parsed.city || parsed.hobbies.length > 0;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // WYTH-SPECIFIC PREMIUM PROMPT
    const prompt = `You are writing a profile bio for WYTH — a premium, high-intent social platform where people look for genuine, long-term connections leading to marriage.

WYTH VOICE PRINCIPLES:
• Emotionally mature, not playful
• Calm confidence, not desperate
• Personal depth, not generic
• Dignified intent, not cringe
• Self-aware, not boastful

${hasStructure ? `USER PROFILE DATA:
${parsed.profession ? `Profession: ${parsed.profession}` : ''}
${parsed.city ? `Location: ${parsed.city}` : ''}
${parsed.hobbies.length > 0 ? `Interests: ${parsed.hobbies.join(', ')}` : ''}
${parsed.family ? `Values family` : ''}
${parsed.intent ? `Intent: ${parsed.intent}` : ''}` : `RAW INPUT: "${rawInput}"`}

TONE: ${tone === "Grounded" ? "Calm, steady, grounded. Confident but not showy." : tone === "Thoughtful" ? "Reflective, introspective, thoughtful. Shows depth." : "Warm, kind, genuine. Shows emotional availability."}

STRUCTURE (3 short paragraphs):
Paragraph 1: Career + Location
- Introduce profession and city naturally
- Connect work to values/approach to life
- Example: "I'm an engineer based in Mumbai, someone who finds balance between building things professionally and building meaningful relationships personally."

Paragraph 2: Lifestyle + Hobbies + Family  
- Mention how you spend time
- Include hobbies naturally (don't list)
- Reference family warmly but not dependently
- Example: "Weekends usually mean hiking trails, planning the next travel escape, or spending time with my family — my parents and my younger brother keep life grounded and joyful."

Paragraph 3: Intent + Outlook
- State relationship readiness clearly but not desperately
- Example: "At this stage, I'm genuinely ready for marriage and looking for something steady, respectful, and long-term."

CRITICAL RULES:
✅ Write in FIRST PERSON ("I'm" not "He is")
✅ Keep total under 450 characters
✅ Use em dashes (—) not hyphens for pauses
✅ Natural flow, not bullet points
✅ Specific details, not generic traits
✅ Show, don't tell personality

❌ NEVER use these phrases:
- "Fun-loving" / "Adventure seeker"
- "Looking for my better half"
- "Family is everything"
- "Traditional values"
- "Work hard, play hard"
- "Love to laugh"
- "Easy-going"
- "Go with the flow"
- Any emojis
- Any exclamation marks in excess

❌ AVOID:
- Matrimony website resume tone
- LinkedIn corporate speak
- Over-romantic poetry
- Generic adjectives (amazing, awesome, incredible)
- Clichés about travel, food, music

OUTPUT:
Write the bio as one flowing text (no labels, no headers, no quotes). Just the three paragraphs separated by line breaks.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up any AI artifacts
    text = text
      .replace(/^["'`]+|["'`]+$/g, '') // Remove quotes
      .replace(/^Bio:?\s*/i, '') // Remove "Bio:" prefix
      .replace(/^Here's.*?:\s*/i, '') // Remove "Here's your bio:"
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\n{3,}/g, '\n\n') // Max 2 line breaks
      .trim();
    
    return text;
    
  } catch (error: any) {
    console.error("Bio generation error:", error);
    throw new Error(error.message || "Failed to generate bio");
  }
}

/**
 * Generate all 3 tone variations
 */
export async function generateBioOptions(rawInput: string): Promise<{
  grounded: string;
  thoughtful: string;
  warm: string;
} | null> {
  try {
    const [grounded, thoughtful, warm] = await Promise.all([
      generateBioAction(rawInput, "Grounded"),
      generateBioAction(rawInput, "Thoughtful"),
      generateBioAction(rawInput, "Warm"),
    ]);

    return { grounded, thoughtful, warm };
  } catch (error) {
    console.error("Bio options error:", error);
    return null;
  }
}
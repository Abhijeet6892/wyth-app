"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export type ChatMode = 
  | "start_connection"    // Opening a new conversation
  | "deepen_connection"   // Moving from casual to intentional
  | "end_connection";     // Graceful, dignified closure

/** UI intent; map to ChatMode when calling generateChatHelp. */
export type ChatIntent = "icebreaker" | "reply" | "decline";

export type ChatTone = "Grounded" | "Thoughtful" | "Warm";

/**
 * WYTH CHAT HELPER
 * 
 * Philosophy:
 * - Dignified, not desperate
 * - Respectful, not flirty
 * - Specific, not generic
 * - Mature, not playful
 */

interface ProfileContext {
  name: string;
  bio?: string;
  profession?: string;
  city?: string;
  interests?: string[];
  lastMessage?: string; // For replies
}

export async function generateChatHelp(
  mode: ChatMode,
  partnerProfile: ProfileContext,
  tone: ChatTone = "Grounded"
): Promise<{
  primary: string;
  alternatives: string[];
}> {
  
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    // Graceful fallback for development
    return {
      primary: "I came across your profile and really appreciated what you shared. Would love to connect.",
      alternatives: [
        "Hi, your profile resonated with me. I'd like to get to know you better.",
        "I noticed we share some similar values. Would you be open to a conversation?"
      ]
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build context from profile
  const contextParts: string[] = [];
  if (partnerProfile.profession) contextParts.push(`Works as ${partnerProfile.profession}`);
  if (partnerProfile.city) contextParts.push(`Based in ${partnerProfile.city}`);
  if (partnerProfile.interests && partnerProfile.interests.length > 0) {
    contextParts.push(`Interested in ${partnerProfile.interests.join(', ')}`);
  }
  if (partnerProfile.bio) {
    contextParts.push(`Bio mentions: "${partnerProfile.bio.substring(0, 100)}..."`);
  }
  
  const contextString = contextParts.join(' • ');

  // Tone instructions
  const toneInstruction = 
    tone === "Grounded" ? "Calm, steady, mature. Shows quiet confidence." :
    tone === "Thoughtful" ? "Reflective, intentional, shows depth of thinking." :
    "Warm, kind, shows emotional availability without being intense.";

  let systemPrompt = "";

  // MODE 1: Starting Connection
  if (mode === "start_connection") {
    systemPrompt = `You are helping a user start a respectful, high-intent conversation on WYTH — a premium platform where people look for genuine marriage-minded connections.

PARTNER'S PROFILE:
Name: ${partnerProfile.name}
${contextString}

TONE: ${toneInstruction}

YOUR TASK:
Write ONE opening message that shows:
1. You read their profile (reference something specific)
2. Genuine interest (not generic greeting)
3. Respect and maturity (not flirty or intense)
4. Opens natural conversation (ends with thoughtful question)

WYTH MESSAGE PRINCIPLES:
✅ Reference something specific from their profile
✅ Show you invested time in reading
✅ Ask about their experience, not interviewing them
✅ Natural, conversational flow
✅ Under 3 lines (WhatsApp style)

❌ NEVER:
- Generic greetings ("Hey!", "Hi there!")
- Compliments on appearance
- Pickup lines or wordplay
- Emojis
- Exclamation marks
- "Nice profile" / "Interesting bio"
- Questions about "what they're looking for"

GOOD EXAMPLE:
"I came across your profile and really appreciated how you spoke about balancing travel with family time. That resonated with me.

I'm based in Mumbai as well — do you have a favorite place you've visited recently?"

BAD EXAMPLES:
"Hey! Nice profile 😊"
"Hi beautiful"
"What are you looking for?"
"Your profile caught my attention!"

OUTPUT FORMAT:
Generate 3 variations. Each should:
- Be 2-3 lines max
- Reference their profile specifically
- End with a natural question
- Feel like it was written by a thoughtful person, not AI

Return as:
1. [First message]

2. [Second message]

3. [Third message]

Do not add labels, quotes, or preamble. Just the three numbered messages.`;
  }

  // MODE 2: Deepen Connection
  else if (mode === "deepen_connection") {
    systemPrompt = `You are helping a user deepen an ongoing conversation on WYTH — moving from casual chat to more intentional discussion about partnership.

PARTNER'S NAME: ${partnerProfile.name}
CONTEXT: They've been chatting for a while. Conversation is good. User wants to go deeper.
${partnerProfile.lastMessage ? `LAST MESSAGE: "${partnerProfile.lastMessage}"` : ''}

TONE: ${toneInstruction}

YOUR TASK:
Write ONE message that:
1. Acknowledges the quality of conversation so far
2. Gently shifts to more intentional topics
3. Shows interest in understanding their vision of partnership
4. Maintains respect and maturity (not intense or pushy)

WYTH DEEPENING PRINCIPLES:
✅ Appreciate the conversation quality
✅ Express desire to understand them better
✅ Ask about values, partnership vision, life outlook
✅ Show emotional intelligence
✅ Keep it 3-4 lines

❌ NEVER:
- "What are you looking for?" (too direct)
- "Are you serious about marriage?" (too transactional)
- Love/relationship poetry
- Premature declarations of interest
- Pressure or urgency

GOOD EXAMPLE:
"I've really appreciated how open our conversations have been. I'd like to understand what partnership means to you long-term."

BAD EXAMPLES:
"So are you serious about this?"
"What exactly are you looking for?"
"I think we have a real connection here"

OUTPUT FORMAT:
Generate 3 variations, each 3-4 lines. Return as:
1. [First message]

2. [Second message]

3. [Third message]`;
  }

  // MODE 3: End Connection
  else if (mode === "end_connection") {
    systemPrompt = `You are helping a user respectfully end a conversation on WYTH.

CONTEXT: 
- They've been chatting with ${partnerProfile.name}
- User realizes it's not the right match
- Wants to end with dignity, not ghosting

TONE: ${toneInstruction} (but adjusted for closure — kind, clear, honest)

YOUR TASK:
Write ONE closing message that:
1. Appreciates the conversation
2. States clearly but kindly it's not the right fit
3. Takes responsibility (not blaming them)
4. Wishes them genuinely well
5. Provides clean closure

WYTH CLOSURE PRINCIPLES:
✅ Acknowledge the positive (be genuine)
✅ Be clear about ending (no ambiguity)
✅ No blame or criticism
✅ Show maturity and self-awareness
✅ Keep it 3-4 lines
✅ Final, not "maybe later"

❌ NEVER:
- "It's not you, it's me" (cliché)
- Give false hope or "maybe someday"
- Over-explain or justify
- Blame them or list incompatibilities
- Generic breakup lines
- Apologize excessively

GOOD EXAMPLE:
"I've genuinely enjoyed our conversations over the past few days.

After giving it some thought, I feel we may be looking for slightly different things long-term. I wanted to be honest rather than let it drift.

I truly wish you the best moving forward."

BAD EXAMPLES:
"I don't think this will work"
"You're not my type"
"Sorry but..."
"Maybe we can be friends?"

OUTPUT FORMAT:
Generate 3 variations. Each should be 3-4 lines of dignified closure. Return as:
1. [First message]

2. [Second message]

3. [Third message]`;
  }

  try {
    const result = await model.generateContent(systemPrompt);
    const response = result.response.text().trim();

    // Parse the 3 variations
    const variations = response
      .split(/\n\d+\.\s+/) // Split on "1. ", "2. ", "3. "
      .filter(msg => msg.trim().length > 0)
      .map(msg => 
        msg
          .replace(/^\d+\.\s*/, '') // Remove any remaining numbers
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/\n{3,}/g, '\n\n') // Clean up line breaks
          .trim()
      )
      .filter(msg => msg.length > 10); // Filter out artifacts

    if (variations.length < 1) {
      throw new Error("Failed to generate messages");
    }

    return {
      primary: variations[0],
      alternatives: variations.slice(1, 3) // Return up to 2 alternatives
    };

  } catch (error: any) {
    console.error("Chat help error:", error);
    throw new Error("Failed to generate message. Please try again.");
  }
}

/**
 * Quick helper for common use case: starting a conversation
 */
export async function generateOpener(
  partnerProfile: ProfileContext,
  tone: ChatTone = "Grounded"
): Promise<string> {
  const result = await generateChatHelp("start_connection", partnerProfile, tone);
  return result.primary;
}

/**
 * Quick helper for ending gracefully
 */
export async function generateClosing(
  partnerName: string,
  tone: ChatTone = "Grounded"
): Promise<string> {
  const result = await generateChatHelp("end_connection", { name: partnerName }, tone);
  return result.primary;
}
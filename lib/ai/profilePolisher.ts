// WYTH AI Helper (Mock Adapter)
// This file isolates the "AI" logic so it can be swapped for a real API later.

export type BioTone = 'Chill' | 'Witty' | 'Romantic'

/**
 * Simulates an AI call to polish a user's bio.
 * @param text - The user's current draft bio
 * @param tone - The desired tone of voice
 * @returns A Promise resolving to the polished string
 */
export async function polishBioMock(text: string, tone: BioTone): Promise<string> {
  // 1. Simulate network latency (1.5s) to mimic a real LLM call
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 2. Mock Logic: Return specific responses based on tone
  const responses: Record<string, string> = {
    'Chill': "Just a laid-back soul looking for good vibes and great coffee. ☕️✨",
    'Witty': "Professional overthinker and part-time traveler. Swipe right if you can handle bad puns.",
    'Romantic': "Believer in old-school romance and building a life filled with laughter and love."
  }

  return responses[tone] || text
}
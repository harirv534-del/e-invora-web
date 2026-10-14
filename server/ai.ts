import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { AiDraftContent } from '../src/types/index.ts';

// Server-side Gemini AI Client with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface GenerateDraftParams {
  bookingReference: string;
  customerName: string;
  celebrantNames: string;
  eventCategory: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  preferredLanguage: string;
  designNotes?: string;
  additionalRequirements?: string;
  templateName?: string;
}

export async function generateInvitationDraft(
  params: GenerateDraftParams
): Promise<{ success: boolean; model: string; draft?: AiDraftContent; error?: string }> {
  if (!ai || !apiKey) {
    return {
      success: false,
      model: 'none',
      error: 'GEMINI_API_KEY is not configured in server environment.',
    };
  }

  const prompt = `
You are the senior editorial copywriter at E-INVORA, a luxury bespoke digital invitation studio whose tagline is "Every Celebration Deserves a Beautiful Invitation."

Compose an authentic, heartfelt, culturally respectful, and exquisitely crafted invitation suite for the following celebration:

Event Category: ${params.eventCategory}
Template Style: ${params.templateName || 'Bespoke Luxury'}
Celebrants / Couple: ${params.celebrantNames}
Booked By: ${params.customerName}
Date: ${params.eventDate}
Timing: ${params.eventTime}
Venue: ${params.venueName}, ${params.venueAddress}
Language Tone: ${params.preferredLanguage || 'English'}
Client Design Notes: ${params.designNotes || 'Classic elegance, regal aesthetics'}
Additional Special Notes: ${params.additionalRequirements || 'None'}

Craft the following distinct elements:
1. Title: The primary header (e.g. "The Wedding Celebration of Aditya & Meera" or "Anand Karaj of Simran & Gurpreet").
2. Subtitle: Elegant invocation or welcoming phrase (e.g. "With the blessings of our revered elders, we cordially invite you...").
3. Formal Invitation Text: A poetic, graceful 3-4 sentence formal invitation text honoring both the families and the sacred milestone.
4. Welcome Poem / Auspicious Shloka Translation / Blessing: A short 2-4 line stanza reflecting the spirit of the occasion.
5. Schedule Summary: Clear, graceful instructions for guests regarding rituals or banquet timing.
6. Dress Code Note: Thoughtful guidance for guests' celebration attire.
7. RSVP Message: Warm note encouraging guests to confirm their auspicious presence.
8. Special Note: Guidance on blessings, gifts, or directions.
`;

  // First try gemini-3.1-pro-preview with ThinkingLevel.HIGH as mandated by feature specification
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Celebration header' },
            subtitle: { type: Type.STRING, description: 'Warm invocation' },
            formalInvitationText: { type: Type.STRING, description: 'Formal invitation copy' },
            welcomePoem: { type: Type.STRING, description: 'Auspicious poetic blessing or verse' },
            scheduleSummary: { type: Type.STRING, description: 'Graceful schedule summary' },
            dressCodeNote: { type: Type.STRING, description: 'Attire guidance' },
            rsvpMessage: { type: Type.STRING, description: 'Warm RSVP guidance' },
            specialNote: { type: Type.STRING, description: 'Blessings or gifts note' },
          },
          required: ['title', 'subtitle', 'formalInvitationText', 'welcomePoem', 'scheduleSummary'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from gemini-3.1-pro-preview');
    }

    const parsed = JSON.parse(text) as AiDraftContent;
    return {
      success: true,
      model: 'gemini-3.1-pro-preview (high-thinking)',
      draft: parsed,
    };
  } catch (err: any) {
    console.warn('Gemini 3.1 Pro Preview attempt failed or unavailable, trying gemini-3.8-flash fallback:', err?.message || err);

    // Fallback to gemini-3.8-flash
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              formalInvitationText: { type: Type.STRING },
              welcomePoem: { type: Type.STRING },
              scheduleSummary: { type: Type.STRING },
              dressCodeNote: { type: Type.STRING },
              rsvpMessage: { type: Type.STRING },
              specialNote: { type: Type.STRING },
            },
            required: ['title', 'subtitle', 'formalInvitationText', 'welcomePoem', 'scheduleSummary'],
          },
        },
      });

      const fallbackText = fallbackResponse.text;
      if (!fallbackText) {
        throw new Error('Empty response received from gemini-3.8-flash');
      }

      const parsedFallback = JSON.parse(fallbackText) as AiDraftContent;
      return {
        success: true,
        model: 'gemini-3.8-flash',
        draft: parsedFallback,
      };
    } catch (fallbackErr: any) {
      console.error('All Gemini AI generation attempts failed:', fallbackErr);
      return {
        success: false,
        model: 'gemini-3.1-pro-preview / gemini-3.8-flash',
        error: fallbackErr?.message || 'Failed to generate invitation draft.',
      };
    }
  }
}


import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, JournalEntry } from '../types';

// Ensure the API key is available. In a real app, this would be handled more securely.
if (!process.env.API_KEY) {
  console.warn(
    "API_KEY environment variable not set. Using a placeholder key. AI features will not work."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "NO_API_KEY" });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overallSentiment: {
      type: Type.STRING,
      description: "The overall sentiment of the text. Can be 'Positive', 'Negative', 'Neutral', or 'Mixed'.",
      enum: ['Positive', 'Negative', 'Neutral', 'Mixed'],
    },
    emotions: {
      type: Type.ARRAY,
      description: "A list of detected emotions and their scores from 0 to 100.",
      items: {
        type: Type.OBJECT,
        properties: {
          emotion: {
            type: Type.STRING,
            description: "The name of the emotion (e.g., Joy, Sadness, Anger, Anxiety)."
          },
          score: {
            type: Type.INTEGER,
            description: "A score from 0 to 100 representing the intensity of the emotion."
          },
        },
        required: ["emotion", "score"],
      },
    },
    summary: {
      type: Type.STRING,
      description: "A short, compassionate, one or two-sentence summary of the user's emotional state based on the journal entry."
    },
    keywords: {
        type: Type.ARRAY,
        description: "A list of 3-5 main keywords or topics from the text.",
        items: {
            type: Type.STRING
        }
    }
  },
  required: ["overallSentiment", "emotions", "summary", "keywords"],
};

export const analyzeJournalEntry = async (text: string): Promise<AnalysisResult> => {
    if (!process.env.API_KEY) {
        console.log("No API Key, returning mock data for analysis");
        return {
            overallSentiment: 'Neutral',
            emotions: [{ emotion: 'Contemplative', score: 70 }],
            summary: "This is a placeholder analysis as the API key is missing. The entry seems reflective.",
            keywords: ["placeholder", "analysis"],
        };
    }
    
    try {
        const prompt = `
            Analyze the following journal entry as a compassionate mental health assistant.
            Provide a detailed analysis of the user's emotional state.
            
            Journal Entry:
            "${text}"
            
            Return the analysis in the specified JSON format.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing journal entry with Gemini API:", error);
        throw new Error("Failed to get AI analysis. Please try again later.");
    }
};

export const analyzeTriggers = async (entries: JournalEntry[]): Promise<{ positive: string[], negative: string[] }> => {
    if (!process.env.API_KEY) {
        console.log("No API Key, returning mock data for triggers");
        return {
            positive: ["family time", "weekends", "new project"],
            negative: ["work deadlines", "mondays", "commute"],
        };
    }

    try {
        const entriesText = entries.slice(0, 20).map(e => `Date: ${e.date}, Mood: ${e.mood}, Text: ${e.text}`).join('\n---\n');
        const prompt = `
            As a mental health data analyst, analyze the following journal entries. Identify recurring keywords or themes that are strongly correlated with positive moods (Awesome, Good) and negative moods (Bad, Terrible).
            Do not include generic words like 'feel', 'good', 'bad', 'day'. Focus on specific triggers or topics.
            
            Journal Entries:
            ${entriesText}

            Return the analysis in the specified JSON format.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        positive: {
                            type: Type.ARRAY,
                            description: "A list of 3-5 keywords or short themes associated with positive moods.",
                            items: { type: Type.STRING }
                        },
                        negative: {
                            type: Type.ARRAY,
                            description: "A list of 3-5 keywords or short themes associated with negative moods.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["positive", "negative"]
                },
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error analyzing triggers with Gemini API:", error);
        throw new Error("Failed to get AI trigger analysis.");
    }
};

export const getSelfCareRecommendations = async (entries: JournalEntry[]): Promise<string[]> => {
    if (!process.env.API_KEY) {
        console.log("No API Key, returning mock recommendations");
        return [
            "You often feel good after mentioning 'walks'. Consider scheduling a short walk this week.",
            "It seems your mood is lower on Mondays. Preparing for the week on Sunday might help ease the transition.",
            "Celebrate your recent positive streak! Treat yourself to something you enjoy."
        ];
    }
    
    try {
        const entriesText = entries.slice(0, 10).map(e => `Date: ${e.date}, Mood: ${e.mood}, Summary: ${e.analysis?.summary || e.text.substring(0,50)}`).join('\n---\n');
        const prompt = `
            Act as a compassionate wellness coach. Based on the user's recent journal entries, provide 2-3 simple, actionable, and personalized self-care recommendations.
            Frame your suggestions gently and encouragingly.
            
            Recent Entries:
            ${entriesText}

            Return the recommendations in the specified JSON format.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: {
                            type: Type.ARRAY,
                            description: "A list of 2-3 personalized self-care recommendation strings.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["recommendations"]
                },
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString).recommendations;

    } catch (error) {
        console.error("Error getting self-care recommendations with Gemini API:", error);
        throw new Error("Failed to get AI recommendations.");
    }
};

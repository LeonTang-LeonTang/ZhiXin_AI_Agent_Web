import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../hooks/useLocalization";

interface ComicPanelScript {
  narrative: string;
  image_prompt: string;
}

export interface ComicPanelData {
    narrative: string;
    imageUrl: string;
}

export interface MindMapNode {
    title: string;
    children?: MindMapNode[];
}

export interface FlashcardData {
    term: string;
    definition: string;
}

export interface QuoteData {
    text: string;
    author: string;
}

export interface GuidanceContent {
    id: string;
    quote: QuoteData;
    gentleAdvice: string;
    furtherReading: string[];
    comicPanels: ComicPanelData[];
    flashcards: FlashcardData[];
    mindMap: MindMapNode;
    characterImage?: string;
    characterFileName?: string;
    likes: number;
    dislikes: number;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        quote: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                author: { type: Type.STRING },
            },
            required: ['text', 'author'],
        },
        gentle_advice: { type: Type.STRING },
        further_reading: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        comic_script: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    narrative: { type: Type.STRING },
                    image_prompt: { type: Type.STRING },
                },
                required: ['narrative', 'image_prompt'],
            },
        },
        flashcards: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
            },
        },
        mind_map: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                children: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            children: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING }
                                    },
                                    required: ['title']
                                }
                            }
                        },
                        required: ['title']
                    }
                }
            },
            required: ['title']
        }
    },
    required: ['quote', 'gentle_advice', 'further_reading', 'comic_script', 'flashcards', 'mind_map'],
};

export const getCharacterDescription = async (base64Image: string, mimeType: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is missing.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    };
    const textPart = {
        text: "Describe this character in a consistent, reusable style for an AI artist. Focus on key visual features like hair, clothes, and species/style. Make it concise. Example: 'A young boy with short brown hair, wearing a white shirt, a blue vest, and black shorts.'"
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    return response.text.trim();
}


export const generateGuidance = async (
    userInput: string,
    language: Language,
    characterDesc?: string
): Promise<Omit<GuidanceContent, 'id'|'likes'|'dislikes'|'characterImage'|'characterFileName'>> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const languageName = language === 'zh' ? 'Chinese' : 'English';
        const characterInstruction = characterDesc 
            ? `The protagonist of the comic is: ${characterDesc}. Ensure this character is the hero of the story.`
            : `The comic needs a protagonist. Invent a friendly and relatable character (human or anthropomorphic animal) to be the hero of the story.`;

        const prompt = `You are Soul Mate, a caring, empathetic AI companion. Your goal is to provide comfort and gentle, constructive advice based on principles from cognitive behavioral therapy (CBT), mindfulness, and positive psychology.
You are NOT a licensed therapist. DO NOT provide medical advice. Instead, offer supportive perspectives and coping strategies.
The user is feeling: "${userInput}".
The target language for the output is ${languageName}.
The output must be a single JSON object adhering to the provided schema.

### Field-Specific Instructions ###
- **quote**: Find an inspiring quote about resilience, hope, or self-compassion, relevant to the user's feelings.
- **gentle_advice**: In multiple paragraphs (use '\\n\\n'), provide gentle advice. Acknowledge the user's feelings. If applicable, identify potential cognitive distortions (e.g., catastrophizing, black-and-white thinking) and suggest helpful reframing techniques or small, actionable mindfulness/grounding exercises. Embed markdown links to authoritative web pages (e.g., Wikipedia, NAMI, APA) for key terms. The URL MUST be a full, valid URL.
- **further_reading**: A list of 3-5 helpful books, articles, or online resources in a standard citation format.
- **comic_script**: This is CRITICAL. Create an uplifting 6-panel comic story that illustrates the core message of the advice.
    - ${characterInstruction}
    - The story must create a narrative of hope and empowerment. It should show the character experiencing a struggle similar to the user's, then actively applying a coping strategy from the 'gentle_advice', and finally finding a path towards resolution or peace. Show, don't just tell, this transformation.
    - Each "image_prompt" MUST begin with 'wholesome, cute, minimalist vector art of...'. Describe the scene and the character's actions/emotions.
    - Each "narrative" must be a comforting and descriptive caption of 2-3 sentences to provide more context and emotional depth to the panel.
- **flashcards**: Create flashcards for key psychological terms from the advice. Keep definitions concise and use markdown bold ('**term**') for critical keywords.
- **mind_map**: Create a mind map with the user's core feeling as the root, branching into contributing thoughts, gentle advice, and positive actions.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedResponse = JSON.parse(jsonStr);
        const { gentle_advice, comic_script, quote, further_reading, flashcards, mind_map } = parsedResponse;

        if (!gentle_advice || !comic_script || !quote || !further_reading || !flashcards || !mind_map) {
            throw new Error("Invalid response structure from the text model.");
        }

        const comicPanels: ComicPanelData[] = [];
        for (const panel of comic_script) {
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: panel.image_prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
                throw new Error(`Image generation failed for prompt: ${panel.image_prompt}`);
            }
            const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            
            comicPanels.push({
                narrative: panel.narrative,
                imageUrl: imageUrl,
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return { 
            quote,
            gentleAdvice: gentle_advice,
            furtherReading: further_reading,
            comicPanels,
            flashcards,
            mindMap: mind_map,
        };

    } catch (error) {
        console.error("Error generating guidance:", error);
        if (error instanceof Error) {
            if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
                throw new Error("Our servers are busy sending out warm hugs! Please wait a moment and try again.");
            }
            if (error.message.includes("JSON")) {
                 throw new Error(`Failed to generate guidance: The AI returned an invalid data structure. Please try again.`);
            }
            throw new Error(`Failed to generate guidance: ${error.message}`);
        }
        throw new Error("An unknown error occurred during guidance generation.");
    }
};

import { GoogleGenAI, Type } from "@google/genai";
import { BestFrameResponse } from '../types';

const getAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API key is not provided");
    }
    return new GoogleGenAI({ apiKey });
};

export const getChatbotResponse = async (csvData: string, userQuery: string, apiKey: string): Promise<string> => {
  try {
    const ai = getAiClient(apiKey);
    const prompt = `
      You are an expert data analyst. Your task is to answer a question based on the provided CSV data.
      Carefully analyze the data to find the answer.

      **IMPORTANT GUIDELINES FOR ANALYSIS:**
      - Exclude the following entities from your analysis and final answer:
        - Cricket organizations (e.g., ICC, BCCI).
        - Non-sponsoring product names and taglines (e.g., 5G).
        - Country names (e.g., INDIA, AUSTRALIA).
        - Tournament names (e.g., WORLD CUP, ASIA CUP).
        - Player names (e.g., VIRAT, BABAR).
      - Your focus should be on commercial brands and sponsors present in the data.

      Your response must be only the final answer to the user's question, without any of your reasoning, steps, or analysis process. Be direct and concise.

      Here is the CSV data (the first row is the header):
      ---
      ${csvData}
      ---

      Here is the user's question:
      ---
      "${userQuery}"
      ---

      Final Answer:
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    if (error instanceof Error) {
        return `Sorry, I encountered an error: ${error.message}. Please check your API key and the data format.`;
    }
    return "Sorry, I encountered an unknown error while processing your request.";
  }
};

const bestFrameSchema = {
    type: Type.OBJECT,
    properties: {
        frameNumber: { type: Type.NUMBER, description: "The single best frame number for the brand's exposure." },
        reasoning: { type: Type.STRING, description: "A detailed explanation of why this frame was chosen, referencing the specific criteria." }
    },
    required: ['frameNumber', 'reasoning']
};

export const findBestFrame = async (csvData: string, brandName: string, apiKey: string): Promise<BestFrameResponse | null> => {
  try {
    const ai = getAiClient(apiKey);
    const prompt = `
        You are an expert sports marketing analyst. Your task is to find the single best frame from the provided CSV data that represents the most valuable brand exposure for a specific brand.

        Analyze the data based on these four criteria in order of importance:
        1.  **'c_li' (Relative Coverage):** This measures the relative area of the logo compared to the total frame area. Higher values are better. This is the most important factor.
        2.  **'ad_categories' (Ad Location):** This describes where the logo appears (e.g., "Jersey", "Boundary Rope", "On-screen graphics"). Prime locations like jerseys or prominent on-screen graphics are more valuable.
        3.  **'Ad_details' (Ad Context):** This provides more specific details about the ad's location.
        4.  **'General Description' (Action Context):** This describes the action happening in the frame. Frames with exciting action (e.g., "a boundary is hit", "a wicket is taken", "player celebration") are more valuable than neutral moments.

        **Your Goal:**
        Identify the single frame_no that provides the optimal combination of these factors for the brand: "${brandName}".

        **CSV Data:**
        ---
        ${csvData}
        ---

        Analyze the entire dataset for instances of "${brandName}" and select the single best frame. Provide the frame number and a detailed justification for your choice, explaining how it excels across the given criteria.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: bestFrameSchema,
        }
    });

    const jsonText = response.text;
    return JSON.parse(jsonText) as BestFrameResponse;
  } catch (error) {
    console.error("Error finding best frame:", error);
    return null;
  }
};

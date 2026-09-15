import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

console.log(
  "Gemini API key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO",
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.5-flash-lite";

export async function generateHint(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,

    contents: prompt,

    config: {
      systemInstruction: `
You are an expert LeetCode mentor.

Give the user exactly ONE concise hint.

Rules:
- Do not provide the complete solution.
- Do not provide code.
- Do not reveal the final answer.
- Do not explain your reasoning.
- Return only the hint itself.
`,
      temperature: 0.2,
      maxOutputTokens: 200,
    },
  });

  return response.text?.trim() || "";
}
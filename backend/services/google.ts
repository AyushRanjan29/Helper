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
      maxOutputTokens: 800,
    },
  });

  return response.text?.trim() || "";
}

export async function generateChatResponse(
  problem: {
    title: string;
    difficulty: string;
    description: string;
    examples: string[];
    constraints: string[];
  },
  question: string,
): Promise<string> {
  const prompt = `
You are helping a user solve a LeetCode problem.

CURRENT PROBLEM:

Title:
${problem.title}

Difficulty:
${problem.difficulty}

Description:
${problem.description}

Examples:
${problem.examples.join("\n\n")}

Constraints:
${problem.constraints.join("\n")}


USER QUESTION:
${question}


INSTRUCTIONS:
- You are an expert LeetCode mentor.

Guidelines:

- If the user asks for a hint, give only a hint.
- If the user asks for an explanation, explain step by step.
- If the user asks for the solution, provide:
  1. Intuition
  2. Approach
  3. Algorithm
  4. Time & Space Complexity
  5. Well-formatted C++ code
  6. Dry run on one example.
  
- Use Markdown formatting.
- Use headings, bullet points, numbered lists and fenced code blocks.
- Use the current problem as context.
- Do not assume the user is asking for a hint unless they specifically ask for one.
- If they ask for a hint, give a hint without giving the complete solution.
- If they ask for an explanation, explain the concept clearly.
- If they ask for code, you may provide code.
- Keep the response focused on the current problem.
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 1500,
    },
  });

  return response.text?.trim() || "";
}

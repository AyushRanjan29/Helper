import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
  language: string,
  code: string,
  messages: ChatMessage[],
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


CONVERSATION:
${messages
  .map(
    (message) =>
      `${message.role === "user" ? "User" : "Helper"}: ${message.content}`,
  )
  .join("\n\n")}


INSTRUCTIONS:
- Answer the user's latest question directly.
- Use the current problem and conversation history as context.
- Maintain continuity with previous messages.
- Do not unnecessarily repeat previous explanations.

INTENT HANDLING:

1. HINT
If the user asks for a hint:
- Give only a useful hint.
- Do not give the complete solution.
- Do not provide code unless explicitly requested.

2. EXPLANATION
If the user asks to explain the problem, idea, approach, or concept:
- Explain the intuition first.
- Then explain the approach step by step.
- Keep it focused on the current problem.

3. SOLUTION
If the user asks for the solution:
- Give the intuition.
- Give the approach.
- Give the algorithm.
- Give time and space complexity.
- Give complete working code in the user's selected programming language.

4. COMPLEXITY
If the user asks about complexity:
- State time complexity.
- State space complexity.
- Briefly explain why.

5. DRY RUN
If the user asks for a dry run or walkthrough:
- Use the provided example when possible.
- Show the important steps clearly.
- Show how variables/data structures change.

6. DEBUG
If the user asks why their solution is wrong, crashes, or gets TLE:
- Identify the likely issue.
- Explain why it happens.
- Suggest the correction.

7. OPTIMIZE
If the user asks to optimize:
- Explain the current bottleneck.
- Give the improved approach.
- Compare the complexity.

8. CODE
If the user explicitly asks for code:
- Provide code in the current programming language.
- Do not switch languages.

CURRENT PROGRAMMING LANGUAGE:
${language}

CURRENT USER CODE:
${code}

- Do not answer a different intent from the one the user requested.
- Do not provide a full solution when the user asks only for a hint.
- Do not provide code when the user asks only for an explanation.
- Use concise responses for simple questions.
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

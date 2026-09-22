export interface ProblemData {
    title: string;
    difficulty: string;
    description: string;
    examples: string[];
    constraints: string[];
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}
import type { ProblemData } from "../shared/types";

const API_URL = "http://localhost:5000/api";

export async function getHint(problem: ProblemData): Promise<string> {
    const response = await fetch(`${API_URL}/ai/hint`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(problem),
    });

    if (!response.ok) {
    const data = await response.json();

    throw new Error(
        data.message || "Failed to generate hint"
    );
    }

    const data = await response.json();

    if (!data.success) {
    throw new Error(data.message || "Failed to generate hint");
    }

    return data.hint;
}

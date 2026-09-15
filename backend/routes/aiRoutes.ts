import { Router } from "express";
import { generateHint } from "../services/google";

const router = Router();

router.post("/hint", async (req, res) => {
    try {
    const {
        title,
        difficulty,
        description,
        examples,
        constraints,
    } = req.body;

    const prompt = `
Help me solve this LeetCode problem.

Title:
${title}

Difficulty:
${difficulty}

Description:
${description}

Examples:
${examples.join("\n\n")}

Constraints:
${constraints.join("\n")}

Give me ONE useful hint.

Rules:
- Do NOT provide the complete solution.
- Do NOT provide complete code.
- Do NOT directly reveal the final answer.
- Do NOT explain the entire algorithm.
- Help me identify the next important idea.
- Keep the hint concise.
- Assume I want to solve the problem myself.
`;

    const hint = await generateHint(prompt);

    res.json({
        success: true,
        hint,
    });
    } catch (error) {
    console.error("AI hint error:", error);

    const errorMessage =
    error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("503")) {
    return res.status(503).json({
        success: false,
        message:
        "GEMINI is currently busy. Please try again in a few seconds.",
    });
    }
    return res.status(500).json({
        success: false,
        message: "Failed to generate hint.",
    });
    }
});

export default router;
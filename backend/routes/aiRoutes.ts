import { Router } from "express";
import { generateHint, generateChatResponse } from "../services/google";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { problem, question } = req.body;

    if (!problem) {
      return res.status(400).json({
        success: false,
        message: "Problem data is required.",
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    const answer = await generateChatResponse(problem, question.trim());

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate AI response.",
    });
  }
});

export default router;

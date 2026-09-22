import { Router } from "express";
import { generateHint, generateChatResponse } from "../services/google";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { problem, messages, language, code } = req.body;
    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Programming language is required.",
      });
    }

    if (!problem) {
      return res.status(400).json({
        success: false,
        message: "Problem data is required.",
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Conversation messages are required.",
      });
    }

    const answer = await generateChatResponse(problem, language, code, messages);

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

import express from "express";
import cors from "cors";
import "dotenv/config";

import aiRoutes from "./routes/aiRoutes";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "Helper backend is running",
    });
});

app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
    console.log(`Helper backend running on port ${PORT}`);
});
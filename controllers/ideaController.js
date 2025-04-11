import {
    parseWithGemini,
    analyzeWithGemini,
    estimateWithGemini,
    estimateFeasibilityWithGemini,
} from "../services/geminiService.js";
import { getCompetitorData } from "../services/scraperService.js";
import { createChatSession } from "../services/chatService.js";
import IdeaAnalysis from "../models/IdeaAnalysis.js";

export const analyzeIdea = async (req, res) => {
    try {
        const { idea, teamSize = 3, hourlyRate = 30 } = req.body;

        if (!idea) {
            return res.status(400).json({ error: "Idea is required." });
        }

        // 1. Parse idea
        const parsedIdea = await parseWithGemini(idea);

        // 2. Get raw competitor data
        const rawCompetitors = await getCompetitorData(idea);

        // 3. Analyze competitors
        const cleanedCompetitors = await analyzeWithGemini(
            idea,
            rawCompetitors,
            parsedIdea.features
        );

        // 4. Estimate time & cost
        const estimation = await estimateWithGemini(idea, teamSize, hourlyRate);

        // 5. Assess feasibility
        const feasibility = await estimateFeasibilityWithGemini(
            idea,
            rawCompetitors,
            parsedIdea.features
        );

        // 6. Save full analysis (optional, for historical records)
        await IdeaAnalysis.create({
            idea,
            parsedIdea,
            competitors: cleanedCompetitors,
            estimation,
            feasibility,
        });

        // 7. Create chat session with full context
        const chatSession = await createChatSession({
            idea,
            parsedIdea,
            competitors: cleanedCompetitors,
            estimation,
        });

        res.json({
            parsedIdea,
            cleanedCompetitors,
            estimation,
            feasibility,
            chatSessionId: chatSession._id,
        });

    } catch (err) {
        console.error("Error analyzing idea:", err);
        res.status(500).json({ error: "Something went wrong. Try again later." });
    }
};

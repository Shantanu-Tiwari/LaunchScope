import {
    parseWithGemini,
    estimateWithGemini,
    analyzeWithGemini,
    estimateFeasibilityWithGemini,
} from "../services/geminiService.js";
import { getCompetitorData } from "../services/scraperService.js";

export const analyzeIdea = async (req, res) => {
    try {
        const { idea, teamSize, hourlyRate } = req.body;

        if (!idea || !teamSize || !hourlyRate) {
            return res.status(400).json({ error: 'Idea, team size, and hourly rate are required.' });
        }

        // Step 1: Parse the idea
        const parsedIdea = await parseWithGemini(idea);

        // Step 2: Fetch competitor data
        const competitorQuery = parsedIdea.category || idea;
        const scrapedCompetitors = await getCompetitorData(competitorQuery, parsedIdea.features);

        // Step 3: Analyze and clean competitors using Gemini
        const cleanedCompetitors = await analyzeWithGemini(idea, scrapedCompetitors, parsedIdea.features);

        // Step 4: Estimate cost/time
        const estimation = await estimateWithGemini(idea, teamSize, hourlyRate);

        // Step 5: Estimate feasibility
        const feasibility = await estimateFeasibilityWithGemini(idea, cleanedCompetitors, parsedIdea.features);
        const isFeasible = feasibility.feasibilityScore >= 60;

        // Step 6: Respond with full analysis
        res.status(200).json({
            parsedIdea,
            competitors: cleanedCompetitors,
            estimation,
            feasibility: {
                ...feasibility,
                isFeasible,
            },
        });
    } catch (error) {
        console.error('Analyze Idea Error:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

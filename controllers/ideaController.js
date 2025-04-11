import { parseWithGemini, estimateWithGemini } from "../services/geminiService.js";
import { getCompetitorData } from "../services/scraperService.js";

export const analyzeIdea = async (req, res) => {
    try {
        const { idea, teamSize, hourlyRate } = req.body;

        if (!idea || !teamSize || !hourlyRate) {
            return res.status(400).json({ error: 'Idea, team size, and hourly rate are required.' });
        }

        const parsedIdea = await parseWithGemini(idea);

        const competitorQuery = parsedIdea.category || idea;
        const competitors = await getCompetitorData(competitorQuery);

        const estimation = await estimateWithGemini(idea, teamSize, hourlyRate);

        res.status(200).json({
            parsedIdea,
            competitors,
            estimation
        });
    } catch (error) {
        console.error('Analyze Idea Error:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

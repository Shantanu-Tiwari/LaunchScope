import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/apiKeys.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const parseWithGemini = async (idea) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You're a SaaS business analyst. Given the following startup idea, extract:
- Main category (1-2 words)
- Key features (as an array)
- Target audience (as an array)

Respond only in raw JSON like:
{
  "category": "Project Management",
  "features": ["AI Task Suggestions", "Slack Integration"],
  "audience": ["Remote Teams"]
}

Idea: "${idea}"
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
        return JSON.parse(response);
    } catch (err) {
        console.error("Failed to parse Gemini response:", response);
        return {
            category: null,
            features: [],
            audience: []
        };
    }
};


export const analyzeWithGemini = async (idea, competitors, features = []) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-pro' });

    const formattedData = competitors.map((comp, index) => {
        return `${index + 1}. ${comp.title}\nSnippet: ${comp.snippet}\nLink: ${comp.link}\nSource: ${comp.source}`;
    }).join("\n\n");

    const prompt = `
You're an expert SaaS market analyst. Given the following startup idea and a list of competitor data scraped from the web, analyze the competitors and return a cleaned summary.

Startup Idea:
"${idea}"

Target Features: ${features.length ? features.join(', ') : "Not specified"}

Competitor Data:
${formattedData}

Return a cleaned JSON array with the most relevant competitors and the following format:

[
  {
    "name": "Competitor Name",
    "summary": "1-2 sentence overview of what it does",
    "link": "https://...",
    "relevanceScore": 0-100,
    "highlightedFeatures": ["feature1", "feature2"]
  }
]
Respond ONLY with the raw JSON array.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
        return JSON.parse(response);
    } catch (err) {
        console.error("Failed to parse Gemini competitor response:", response);
        return [];
    }
};

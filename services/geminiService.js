import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/apiKeys.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const cleanJsonResponse = (response) => {
    return response.replace(/```json|```/g, "").trim();
};

// 1. Parse Startup Idea
export const parseWithGemini = async (idea) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        const cleaned = cleanJsonResponse(response);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Failed to parse Gemini response:", response);
        return {
            category: null,
            features: [],
            audience: [],
        };
    }
};

// 2. Analyze Competitors
export const analyzeWithGemini = async (idea, competitors, features = []) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

Return a JSON array with the most relevant competitors and the following format:

[
  {
    "name": "Competitor Name",
    "summary": "1-2 sentence overview of what it does",
    "link": "https://...",
    "highlightedFeatures": ["feature1", "feature2"]
  }
]

Respond ONLY with the raw JSON array.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
        const cleaned = cleanJsonResponse(response);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Failed to parse Gemini competitor response:", response);
        return [];
    }
};

// 3. Estimate Time & Cost
export const estimateWithGemini = async (idea, teamSize, hourlyRate) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are a SaaS architect and project estimator.

Given the following idea, estimate:
- Time required to build (in weeks)
- Cost (in USD)
- Assumptions made

Use the provided team size and hourly rate:
- Team Size: ${teamSize}
- Hourly Rate: $${hourlyRate}/hr

SaaS Idea:
"${idea}"

Respond in JSON format with:
{
  "estimatedTime": number (weeks),
  "estimatedCost": number (USD),
  "assumptions": [string]
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
        const cleaned = cleanJsonResponse(response);
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Failed to parse Gemini estimate response:", response);
        return {
            estimatedTime: null,
            estimatedCost: null,
            assumptions: [],
        };
    }
};

// 4. Market Feasibility
export const estimateFeasibilityWithGemini = async (idea, competitors = [], features = []) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const formattedData = competitors.map((comp, index) => {
        return `${index + 1}. ${comp.title}\nSnippet: ${comp.snippet}\nLink: ${comp.link}\nSource: ${comp.source}`;
    }).join("\n\n");

    const prompt = `
You're a seasoned SaaS strategist and VC advisor. Assess the following idea's feasibility and market potential.

Startup Idea:
"${idea}"

Key Features: ${features.length ? features.join(', ') : "Not specified"}

Competitor Landscape:
${formattedData || "No relevant competitors found."}

Return a JSON object like:
{
  "feasibilityScore": 0-100,
  "marketDemand": "High" | "Moderate" | "Low",
  "successPotential": "High" | "Moderate" | "Low",
  "summary": "Brief analysis about technical feasibility, demand, timing, and competition."
}

Respond only in raw JSON.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
        const cleaned = cleanJsonResponse(response);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Failed to parse Gemini feasibility response:", response);
        return {
            feasibilityScore: null,
            marketDemand: null,
            successPotential: null,
            summary: "Could not evaluate feasibility due to a parsing error."
        };
    }
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/apiKeys.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const cleanJsonResponse = (response) => {
    // Removes ```json or ``` from the beginning and end
    return response.replace(/```json|```/g, "").trim();
};

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

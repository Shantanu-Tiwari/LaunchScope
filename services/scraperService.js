import axios from 'axios';
import { SERPAPI_KEY } from "../config/apiKeys.js";
import { analyzeWithGemini } from "../utils/gemini.js"; // You'll implement this

const SEARCH_SITES = [
    'site:producthunt.com',
    'site:g2.com',
    'site:capterra.com',
    'site:slant.co',
    'site:alternativeto.net'
];

const REJECT_PATTERNS = ['blog', 'news', 'discussion', 'reddit.com/r/', '/forum/', '/question/'];

export const getCompetitorData = async (query, ideaFeatures = []) => {
    const allResults = [];
    const extraKeywords = ['tools', 'platforms', 'SaaS', 'alternatives', 'competitors'];

    for (const site of SEARCH_SITES) {
        for (const keyword of extraKeywords) {
            const searchQuery = `${query} ${keyword} ${site}`;
            const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${SERPAPI_KEY}`;

            try {
                const { data } = await axios.get(url);

                if (data.organic_results?.length) {
                    data.organic_results.forEach(result => {
                        const title = result.title || '';
                        const snippet = result.snippet || '';
                        const link = result.link;

                        if (REJECT_PATTERNS.some(p => link.includes(p))) return;

                        const tags = detectTags(`${title} ${snippet}`);
                        const matchScore = calculateMatchScore(tags, ideaFeatures);

                        allResults.push({
                            title,
                            snippet,
                            link,
                            tags,
                            matchScore,
                            source: site.replace('site:', '')
                        });
                    });
                }
            } catch (error) {
                console.error(`Error querying ${site}:`, error.message);
                if (error.response) {
                    console.error('Error details:', error.response.data);
                }
            }
        }
    }

    const uniqueResults = Object.values(allResults.reduce((acc, result) => {
        const key = result.link.toLowerCase();
        if (!acc[key]) acc[key] = result;
        return acc;
    }, {}));

    uniqueResults.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Found ${uniqueResults.length} filtered, high-relevance competitor results`);

    // Now send to Gemini for analysis
    const geminiInput = uniqueResults.map(r => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
        source: r.source
    }));

    const geminiResponse = await analyzeWithGemini(query, geminiInput, ideaFeatures);
    return geminiResponse;
};

const detectTags = (text) => {
    const tagSet = ['AI', 'content generation', 'analytics', 'automation', 'social media', 'branding', 'marketing', 'copywriting', 'tool', 'SaaS', 'platform'];
    return tagSet.filter(tag => text.toLowerCase().includes(tag.toLowerCase()));
};

const calculateMatchScore = (tags, features) => {
    if (!features.length) return 0;
    const matches = tags.filter(tag => features.map(f => f.toLowerCase()).includes(tag.toLowerCase()));
    return Math.round((matches.length / features.length) * 100);
};

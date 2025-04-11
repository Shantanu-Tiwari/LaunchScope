import { chatWithGemini } from "../services/geminiService.js";
import {
    createChatSession,
    getChatSessionById,
    saveChatToDB,
} from "../services/chatService.js";

// Initialize a new chat session
export const initiateChat = async (req, res) => {
    try {
        const { idea, parsedIdea, competitors, estimation } = req.body;

        if (!idea || !parsedIdea || !competitors || !estimation) {
            return res.status(400).json({
                error: "All fields (idea, parsedIdea, competitors, estimation) are required.",
            });
        }

        const chatSession = await createChatSession({
            idea,
            parsedIdea,
            competitors,
            estimation,
        });

        return res.status(201).json({
            message: "Chat session initiated successfully.",
            chatSessionId: chatSession._id,
        });
    } catch (error) {
        console.error("[Initiate Chat Error]:", error);
        return res.status(500).json({
            error: "Failed to start chat session. Please try again later.",
        });
    }
};

// Continue an existing chat session
export const continueChat = async (req, res) => {
    try {
        const { chatSessionId, message } = req.body;

        if (!chatSessionId || !message) {
            return res.status(400).json({
                error: "chatSessionId and message are required.",
            });
        }

        const chatSession = await getChatSessionById(chatSessionId);

        if (!chatSession) {
            return res.status(404).json({ error: "Chat session not found." });
        }

        await saveChatToDB(chatSessionId, "user", message);

        const chatHistory = [
            ...chatSession.chatHistory,
            { role: "user", content: message },
        ];

        const geminiResponse = await chatWithGemini(
            {
                idea: chatSession.idea,
                parsedIdea: chatSession.parsedIdea,
                competitors: chatSession.competitors,
                estimation: chatSession.estimation,
                chatHistory,
            },
            message
        );

        await saveChatToDB(chatSessionId, "gemini", geminiResponse);

        return res.status(200).json({
            message: geminiResponse,
            chatSessionId: chatSession._id,
        });
    } catch (error) {
        console.error("[Continue Chat Error]:", error);
        return res.status(500).json({
            error: "Failed to continue chat session. Please try again later.",
        });
    }
};

// Resume an existing chat session and return all data
export const resumeChatFromAnalysis = async (req, res) => {
    try {
        const { chatSessionId } = req.body;

        if (!chatSessionId) {
            return res.status(400).json({ error: "chatSessionId is required." });
        }

        const chatSession = await getChatSessionById(chatSessionId);

        if (!chatSession) {
            return res.status(404).json({ error: "Chat session not found." });
        }

        return res.status(200).json({
            message: "Resumed chat session successfully.",
            chatHistory: chatSession.chatHistory,
            idea: chatSession.idea,
            parsedIdea: chatSession.parsedIdea,
            competitors: chatSession.competitors,
            estimation: chatSession.estimation,
        });
    } catch (error) {
        console.error("[Resume Chat Error]:", error);
        return res.status(500).json({
            error: "Failed to resume chat session. Please try again later.",
        });
    }
};

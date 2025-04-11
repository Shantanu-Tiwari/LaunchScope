import { Chat } from "../models/ChatModel.js";

// Create a new chat session
export const createChatSession = async ({ idea, parsedIdea, competitors, estimation }) => {
    const chat = new Chat({
        idea,
        parsedIdea,
        competitors,
        estimation,
        chatHistory: [],
    });
    return chat.save();
};

// Fetch chat session by ID
export const getChatSessionById = async (chatSessionId) => {
    return Chat.findById(chatSessionId);
};

// Add a single message to chat history
export const addMessageToChat = async (chatSessionId, role, content) => {
    const chat = await Chat.findById(chatSessionId);
    if (!chat) {
        throw new Error("Chat session not found");
    }

    chat.chatHistory.push({ role, content });
    return chat.save();
};

// Append multiple messages to chat history
export const appendChatHistory = async (chatSessionId, messages) => {
    const chat = await Chat.findById(chatSessionId);
    if (!chat) {
        throw new Error("Chat session not found");
    }

    chat.chatHistory = [...chat.chatHistory, ...messages];
    return chat.save();
};

// Alias for adding a message, used externally
export const saveChatToDB = async (chatSessionId, role, content) => {
    return addMessageToChat(chatSessionId, role, content);
};

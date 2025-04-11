import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "gemini"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { _id: false });

const chatSchema = new mongoose.Schema({
    idea: {
        type: String,
        required: true,
    },
    parsedIdea: {
        category: { type: String },
        features: [String],
        audience: [String],
    },
    competitors: [
        {
            name: String,
            summary: String,
            link: String,
            highlightedFeatures: [String],
        },
    ],
    estimation: {
        estimatedTime: Number,
        estimatedCost: Number,
        assumptions: [String],
    },
    chatHistory: [messageSchema],
    status: {
        type: String,
        enum: ["initialized", "analyzed", "chatting"],
        default: "initialized",
    },
}, {
    timestamps: true,
});

export const Chat = mongoose.model("Chat", chatSchema);

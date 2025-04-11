import mongoose from "mongoose";

const IdeaAnalysisSchema = new mongoose.Schema({
    idea: { type: String, required: true },
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
        }
    ],
    estimation: {
        estimatedTime: Number,
        estimatedCost: Number,
        assumptions: [String],
    },
    feasibility: {
        summary: String,
        feasibilityScore: Number,
        isFeasible: Boolean,
    },
    chatSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("IdeaAnalysis", IdeaAnalysisSchema);

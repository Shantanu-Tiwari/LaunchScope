import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import ideaRoutes from "./routes/ideaRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());


app.use("/api/idea", ideaRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("SaaS Analyzer API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

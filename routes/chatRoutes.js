import express from "express";
import {
    initiateChat,
    continueChat,
    resumeChatFromAnalysis,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/initiate", initiateChat);
router.post("/continue", continueChat);
router.post("/resume", resumeChatFromAnalysis); // <-- new route for resuming chat from analysis

export default router;

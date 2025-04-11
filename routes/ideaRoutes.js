import express from 'express';
import { analyzeIdea } from "../controllers/ideaController.js";

const router = express.Router();

router.post('/analyze', analyzeIdea);

export default router;

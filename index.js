import express from "express";
import dotenv from 'dotenv';
import ideaRoutes from './routes/ideaRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/idea', ideaRoutes);

app.get('/', (req, res) => {
    res.send('Saas Analyzer is running..');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
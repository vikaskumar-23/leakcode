const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');
const { aiCodeReview } = require('./aiCodeReview');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));

// Health check
app.get("/", (req, res) => {
    res.json({ online: 'compiler', message: 'AlgoU Compiler API is running' });
});

// Legacy code execution endpoint (for backward compatibility)
app.post("/run", async (req, res) => {
    const { language = 'cpp', code, input } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }
    try {
        const filePath = generateFile(language, code);
        const inputPath = generateInputFile(input);
        const output = await executeCpp(filePath, inputPath);
        res.json({ filePath, inputPath, output });
    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({ 
            error: "Error in execution", 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// AI review endpoint
app.post("/ai-review", async (req, res) => {
    const { code } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }
    try {
        const review = await aiCodeReview(code);
        res.json({ "review": review });
    } catch (error) {
        console.error('AI review error:', error);
        res.status(500).json({ 
            error: "Error in AI review", 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});
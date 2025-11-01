const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// --- Routes ---

// @route   GET /history/:roomId
// @desc    Get chat history for a specific room
app.get('/history/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find messages, sort by timestamp (ascending), and limit to last 50
        const messages = await Message.find({ roomId })
            .sort({ timestamp: 1 })
            .limit(50);

        res.json(messages);

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

// @route   GET /health
// @desc    Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3002; // Use port 3002
app.listen(PORT, () => console.log(`Message Service running on port ${PORT}`));

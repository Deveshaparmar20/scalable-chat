const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => {
        try { req.rawBody = buf.toString(); } catch (e) { req.rawBody = ''; }
    }
}));
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
    if (err) {
        console.error('Body parse error:', err.message);
        console.error('Raw body captured:', req.rawBody);
        console.error('Content-Type header:', req.headers['content-type']);
    }
    next(err);
});

// Connect to MongoDB
connectDB();

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECRET_KEY'; // In production, use environment variable

app.post('/register', async (req, res) => {
    try {
        console.log('Register payload:', req.headers['content-type'], req.body);
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        const user = new User({ email, password });
        await user.save();
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered successfully', token, user: { id: user._id, email: user.email } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));

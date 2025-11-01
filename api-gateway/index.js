const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());

app.use('/auth', proxy('http://user-service:3001', {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/auth', '') || '/'
}));

app.use('/messages', proxy('http://message-service:3002', {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/messages', '') || '/'
}));

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

const io = require('socket.io-client');
const axios = require('axios');

const CHAT_URL = process.env.CHAT_URL || 'http://localhost:3003';
const HISTORY_URL = process.env.HISTORY_URL || 'http://localhost:3002';
const ROOM = process.env.TEST_ROOM || 'testroom';

const clientA = io(CHAT_URL, { reconnectionAttempts: 5 });
const clientB = io(CHAT_URL, { reconnectionAttempts: 5 });

clientA.on('connect', () => {
  console.log('[A] connected', clientA.id);
  clientA.emit('joinRoom', ROOM);
});
clientB.on('connect', () => {
  console.log('[B] connected', clientB.id);
  clientB.emit('joinRoom', ROOM);
});

clientA.on('receiveMessage', (m) => console.log('[A] receiveMessage', m));
clientB.on('receiveMessage', (m) => console.log('[B] receiveMessage', m));

clientA.on('connect_error', (err) => console.error('[A] connect_error', err.message));
clientB.on('connect_error', (err) => console.error('[B] connect_error', err.message));

// Send a message from client A after a short delay
setTimeout(() => {
  const message = {
    roomId: ROOM,
    userId: 'u1',
    username: 'TesterA',
    text: 'Hello from A',
    timestamp: new Date()
  };
  console.log('[A] sending message', message.text);
  clientA.emit('sendMessage', message);
}, 1200);

// Wait a bit then fetch history from message-service
setTimeout(async () => {
  try {
    console.log('\nFetching history from message-service...');
    const res = await axios.get(`${HISTORY_URL}/history/${ROOM}`);
    console.log('History response length:', Array.isArray(res.data) ? res.data.length : 'N/A');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error fetching history:', err.message);
  } finally {
    clientA.close();
    clientB.close();
    process.exit(0);
  }
}, 4000);

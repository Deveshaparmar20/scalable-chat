(async () => {
  try {
    const amqp = require('amqplib');
    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
    console.log('Attempting to connect to', url);
    const conn = await amqp.connect(url);
    console.log('Connected OK');
    await conn.close();
  } catch (err) {
    console.error('Connect error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();

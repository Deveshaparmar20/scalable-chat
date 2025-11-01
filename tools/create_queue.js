(async () => {
  try {
    const amqp = require('amqplib');
    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
    console.log('Connecting to', url);
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();
    await channel.assertExchange('chat_exchange', 'topic', { durable: true });
    const q = await channel.assertQueue('message_persist_queue', { durable: true });
    await channel.bindQueue(q.queue, 'chat_exchange', 'messages.*');
    console.log('Created and bound queue', q.queue);
    await channel.close();
    await conn.close();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();

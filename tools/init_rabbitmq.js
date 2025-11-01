// RabbitMQ initialization script: creates and binds queues required by the chat app
const amqp = require('amqplib');

async function initRabbitMQ() {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
    console.log('Connecting to RabbitMQ at', url);
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();

    // Create exchange
    await channel.assertExchange('chat_exchange', 'topic', { 
      durable: true 
    });
    console.log('✓ Asserted exchange: chat_exchange');

    // Create queue for message persistence
    const q = await channel.assertQueue('message_persist_queue', { 
      durable: true 
    });
    console.log('✓ Asserted queue:', q.queue);

    // Bind queue to messages.* routing pattern
    await channel.bindQueue(q.queue, 'chat_exchange', 'messages.*');
    console.log('✓ Bound queue to chat_exchange with routing pattern: messages.*');

    await channel.close();
    await conn.close();
    console.log('✓ Initialization complete');
    process.exit(0);
  } catch (err) {
    console.error('Initialization error:', err.message);
    process.exit(1);
  }
}

// If script is run directly (not imported), execute init
if (require.main === module) {
  // Add a small delay to ensure RabbitMQ is ready
  setTimeout(initRabbitMQ, 2000);
}
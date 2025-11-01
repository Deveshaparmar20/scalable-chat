# Scalable Real-time Chat Application

A scalable microservices-based chat application with real-time messaging, message persistence, and horizontal scaling capabilities.

## Architecture Overview

The application consists of the following services:

- **client-ui**: React-based frontend with Socket.IO client
- **api-gateway**: Reverse proxy handling HTTP requests to backend services
- **user-service**: Handles user registration and authentication
- **chat-service**: Manages real-time chat using Socket.IO and Redis adapter
- **message-service**: Persists chat messages using MongoDB and RabbitMQ
- **Infrastructure services**:
  - MongoDB: Database for users and messages
  - Redis: For Socket.IO scaling and message caching
  - RabbitMQ: Message queue for reliable message persistence

## Features

- User registration and authentication with JWT
- Real-time chat messaging using Socket.IO
- Message persistence with MongoDB
- Horizontal scaling support via Redis adapter
- Message queue for reliable message delivery
- Cache-aside pattern for chat history
- Containerized with Docker and orchestrated with Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/Deveshaparmar20/scalable-chat.git
   cd scalable-chat
   ```

2. Start the application stack:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Web UI: http://localhost
   - API Gateway: http://localhost:3000
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

## Service Details

### User Service (Port 3001)
- User registration and authentication
- JWT token issuance
- MongoDB for user storage
- Environment variables:
  - MONGO_URI: MongoDB connection string
  - JWT_SECRET: Secret for JWT signing

### Message Service (Port 3002)
- Chat history retrieval
- Message persistence
- Redis caching for history
- RabbitMQ consumer for async processing
- Environment variables:
  - MONGO_URI: MongoDB connection string
  - RABBITMQ_URL: RabbitMQ connection string
  - REDIS_URL: Redis connection string

### Chat Service (Port 3003)
- Real-time messaging with Socket.IO
- Redis adapter for horizontal scaling
- RabbitMQ publisher for persistence
- Environment variables:
  - RABBITMQ_URL: RabbitMQ connection string
  - REDIS_URL: Redis connection string

### API Gateway (Port 3000)
- Route proxying to backend services
- Health checks
- Environment variables:
  - NODE_ENV: Runtime environment

## API Endpoints

### Authentication
- POST /auth/register - Register new user
- POST /auth/login - User login
- GET /auth/health - Service health check

### Messages
- GET /messages/history/:roomId - Get chat history
- GET /messages/health - Service health check

## Socket.IO Events

### Client to Server
- joinRoom: Join a chat room
- sendMessage: Send a message to room

### Server to Client
- receiveMessage: New message in room

## Development

1. Install dependencies for each service:
   ```bash
   cd service-name
   npm install
   ```

2. Create .env files based on .env.example in each service directory

3. Start services individually (for development):
   ```bash
   cd service-name
   npm start
   ```

## Testing

Run the socket test utility:
```bash
cd tools
node socket_test.js
```

## Scalability Features

1. **Horizontal Scaling**
   - Socket.IO with Redis adapter allows multiple chat-service instances
   - API Gateway can distribute load across service instances

2. **Message Durability**
   - RabbitMQ ensures reliable message delivery
   - Messages persisted to MongoDB
   - Consumer retries with backoff

3. **Performance**
   - Redis caching for chat history
   - Cache invalidation on new messages
   - Efficient message broadcasting

## Monitoring & Management

- RabbitMQ Management UI: http://localhost:15672
  - Username: guest
  - Password: guest
- MongoDB data persisted to local volume
- Service health endpoints for monitoring

## Common Issues & Solutions

1. **Services fail to start**
   - Ensure all required services (MongoDB, Redis, RabbitMQ) are running
   - Check service logs: `docker-compose logs service-name`

2. **Message persistence issues**
   - Verify RabbitMQ connection in chat-service and message-service logs
   - Check queue bindings in RabbitMQ management UI

3. **Cache not working**
   - Verify Redis connection in message-service logs
   - Check cache hit/miss logs

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
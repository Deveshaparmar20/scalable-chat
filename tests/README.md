# Artillery Load Testing Suite for Scalable Chat

This directory contains all the load testing configurations and scripts for the scalable-chat project using Artillery.io.

## Files

- **artillery-config.yml** - Main Artillery configuration file with test scenarios
- **processor.js** - Artillery processor for custom logic (email/password generation)
- **package.json** - Dependencies and npm scripts for the load testing suite

## Setup

### Prerequisites
- Node.js 14+ installed
- Docker services running (`docker-compose up -d`)
- Artillery CLI installed globally (or run `npm install -g artillery`)

### Installation

```bash
# From the tests directory
npm install

# This will install:
# - artillery (main load testing framework)
# - artillery-engine-socketio-v3 (Socket.IO v3 support)
```

## Running Load Tests

### Quick Start
```bash
npm test
```

### With Custom Target
```bash
artillery run --target http://your-api:3000 artillery-config.yml
```

### View Results with HTML Report
```bash
artillery run artillery-config.yml -o report.json
artillery report report.json
```

## Test Scenario Overview

The load test simulates the following user flow:

1. **Registration** - Random user registration with unique email
2. **Authentication** - Login to retrieve JWT token
3. **Socket Connection** - Connect to Chat Service on port 3003
4. **Room Join** - Join a chat room named "load-test-room"
5. **Message Loop** - Send 10 messages with 1-second delays
6. **Disconnect** - Gracefully disconnect from Socket.IO

## Configuration

### Load Phases
- **Ramp Up** (60s): 5 requests/second
- **Sustained** (120s): 10 requests/second
- **Ramp Down** (60s): 5 requests/second

### Adjust Load
Edit `artillery-config.yml` and modify the `phases` section:
```yaml
phases:
  - duration: 120        # Duration in seconds
    arrivalRate: 20      # Requests per second
    name: "Heavy load"
```

## Troubleshooting

### "Cannot find module 'artillery'"
```bash
npm install -g artillery
npm install
```

### "Socket connection failed"
- Verify Chat Service is running: `docker-compose ps`
- Check port 3003 is accessible: `telnet localhost 3003`

### "Authentication failed"
- Verify User Service is running on port 3001
- Check API Gateway is forwarding to correct endpoints

### "No messages received"
- Verify Message Service is running on port 3002
- Check RabbitMQ connection in service logs

## Performance Metrics

After running, Artillery generates metrics for:
- **Response times** (p50, p95, p99)
- **Throughput** (requests/second)
- **Error rates** (failures per scenario)
- **Latency** (min, max, average)

## Advanced Usage

### Run Multiple Scenarios
Create additional scenario blocks in `artillery-config.yml`:
```yaml
scenarios:
  - name: "Scenario 1"
    flow: [...]
  - name: "Scenario 2"
    flow: [...]
```

### Add Custom Metrics
Extend `processor.js` with custom before/after hooks:
```javascript
module.exports = {
  setup: function(context, ee, next) {
    // Custom setup logic
    next();
  },
  cleanup: function(context, ee, next) {
    // Custom cleanup logic
    next();
  }
};
```

## Documentation

- [Artillery Documentation](https://artillery.io/docs)
- [Socket.IO Engine Guide](https://github.com/artilleryio/artillery-engine-socketio-v3)
- [Load Testing Best Practices](https://artillery.io/blog/load-testing-best-practices)

## Support

For issues or questions:
1. Check Artillery docs
2. Review service logs: `docker-compose logs -f [service-name]`
3. Verify all services are running: `docker-compose ps`

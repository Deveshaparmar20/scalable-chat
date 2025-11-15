# Quick Start Guide for Artillery Load Testing

## Files Created

```
tests/
├── artillery-config.yml              # Basic load test configuration
├── artillery-advanced-config.yml     # Advanced scenarios with multiple test types
├── processor.js                      # Custom functions for Artillery
├── package.json                      # NPM dependencies
├── run-load-test.sh                  # Bash script (Linux/macOS)
├── run-load-test.bat                 # Batch script (Windows)
├── README.md                         # Detailed documentation
├── QUICKSTART.md                     # This file
└── .gitignore                        # Git ignore patterns
```

## Prerequisites

Before running the load tests, ensure:

```bash
# 1. Services are running
docker-compose up -d

# 2. Verify all services
docker-compose ps
```

You should see these services running:
- API Gateway (port 3000)
- User Service (port 3001)
- Chat Service (port 3003)
- MongoDB, Redis, RabbitMQ

## Installation

### Option 1: Using npm (Recommended)

```bash
cd tests
npm install
```

### Option 2: Manual setup

```bash
# Install Artillery globally
npm install -g artillery

# Install Socket.IO engine
npm install -g artillery-engine-socketio-v3

# Run from tests directory
cd tests
npm install
```

## Running Tests

### Windows Users

```bash
cd tests
run-load-test.bat
```

Then select option from the menu:
- Option 1: Run basic test
- Option 2: Run advanced test
- Option 3: Generate HTML report

### Linux/macOS Users

```bash
cd tests
chmod +x run-load-test.sh
./run-load-test.sh
```

### Direct Commands

```bash
# Basic test (from tests directory)
npm test

# Or directly with Artillery
artillery run artillery-config.yml

# Advanced test with multiple scenarios
artillery run artillery-advanced-config.yml

# With HTML report
artillery run artillery-config.yml -o report.json
artillery report report.json
```

## What Gets Tested

### Basic Test Scenario (artillery-config.yml)
1. **Register** - Create random user via `/auth/register`
2. **Login** - Get JWT token via `/auth/login`
3. **Socket Connection** - Connect to Chat Service
4. **Join Room** - Emit `joinRoom` event
5. **Send Messages** - Loop 10 times sending messages
6. **Disconnect** - Close Socket.IO connection

### Advanced Test Scenarios (artillery-advanced-config.yml)
1. **Full User Journey** (60% weight)
   - Registration → Login → Chat → Messages → Disconnect

2. **Rapid Message Burst** (25% weight)
   - Fast succession of 50 messages with minimal delay

3. **Authentication Stress** (15% weight)
   - Register → Login → Failed login attempts

## Load Phases

### Basic Configuration
- **Ramp up** (60s): 5 requests/second
- **Sustained** (120s): 10 requests/second  
- **Ramp down** (60s): 5 requests/second

**Total Duration:** ~4 minutes

### Adjust Load

Edit `artillery-config.yml` and modify:

```yaml
phases:
  - duration: 60        # Duration in seconds
    arrivalRate: 5      # Requests per second
    name: "Phase name"
```

### Example: Light Load Test
```yaml
phases:
  - duration: 30
    arrivalRate: 2
```

### Example: Heavy Load Test
```yaml
phases:
  - duration: 120
    arrivalRate: 50
```

## Understanding Results

Artillery shows:
- **Response Times**: p50, p95, p99, min, max
- **Throughput**: Requests per second completed
- **Error Rate**: Failed vs successful requests
- **Latency**: Average response time

Example output:
```
All scenarios completed
Summary report @ 13:45:23 UTC+5:30

  Scenarios launched: 100
  Scenarios completed: 100
  Requests completed: 500
  
  Mean response time (ms): 250
  Min: 100
  Max: 1000
  p95: 500
  p99: 800
  
  Response codes:
    200: 450
    201: 50
  
  Errors:
    ECONNREFUSED: 0
    Socket timeout: 0
```

## Troubleshooting

### Problem: "Cannot find module 'artillery'"
```bash
npm install -g artillery
npm install
```

### Problem: "Connection refused on port 3000"
```bash
# Check services
docker-compose ps

# Start if needed
docker-compose up -d

# Test connection
curl http://localhost:3000/health
```

### Problem: "Socket connection timeout"
- Check Chat Service is running: `docker-compose logs chat-service`
- Verify port 3003 is open: `netstat -an | grep 3003`

### Problem: "Authentication failed"
- Check User Service logs: `docker-compose logs user-service`
- Verify API Gateway forwarding: `docker-compose logs api-gateway`

### Problem: "Node modules not found after npm install"
```bash
rm -rf node_modules package-lock.json
npm install
```

## Advanced Usage

### Generate HTML Report
```bash
artillery run artillery-config.yml -o report.json
artillery report report.json -o report.html
# Opens in browser
```

### Run with Debug Logging
```bash
DEBUG=* artillery run artillery-config.yml
```

### Run Specific Scenario
```bash
# Modify artillery-config.yml to include only desired scenario
artillery run artillery-config.yml
```

### Custom Target
```bash
artillery run --target http://your-api:3000 artillery-config.yml
```

### Run Multiple Times
```bash
for i in {1..5}; do
  artillery run artillery-config.yml
  sleep 60
done
```

## Performance Tuning

### For Better Results
1. Run from a fast network
2. Close unnecessary applications
3. Ensure adequate CPU/Memory (2GB+ recommended)
4. Run services on powerful machines

### Increase Load Gradually
```yaml
phases:
  - duration: 60
    arrivalRate: 1
  - duration: 60
    arrivalRate: 5
  - duration: 60
    arrivalRate: 10
  - duration: 60
    arrivalRate: 20
```

## Resources

- [Artillery.io Documentation](https://artillery.io/docs)
- [Socket.IO Engine](https://github.com/artilleryio/artillery-engine-socketio-v3)
- [Load Testing Best Practices](https://artillery.io/blog/load-testing-best-practices)

## Next Steps

1. Run basic test: `npm test`
2. Review results
3. Adjust load phases as needed
4. Run advanced scenarios
5. Generate HTML reports for stakeholders

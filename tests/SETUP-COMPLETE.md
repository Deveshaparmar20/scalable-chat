# Artillery Load Testing Suite - Setup Complete ✅

## Summary

A complete load testing suite has been set up in the `tests/` directory using **Artillery.io**. All files have been created and dependencies installed.

---

## 📁 Files Created

```
tests/
├── artillery-config.yml              # Basic load test (recommended to start)
├── artillery-advanced-config.yml     # Advanced scenarios (3 different test types)
├── processor.js                      # Custom functions (credential generation)
├── package.json                      # NPM dependencies
├── run-load-test.bat                 # Windows execution script
├── run-load-test.sh                  # Linux/macOS execution script
├── README.md                         # Detailed documentation
├── QUICKSTART.md                     # Quick reference guide
├── .gitignore                        # Git ignore patterns
├── node_modules/                     # Dependencies (artillery)
└── package-lock.json                 # Locked dependency versions
```

---

## 🚀 Quick Start

### For Windows Users:
```bash
cd tests
run-load-test.bat
```

### For Linux/macOS Users:
```bash
cd tests
chmod +x run-load-test.sh
./run-load-test.sh
```

### Manual Command:
```bash
cd tests
npm test
```

---

## 📊 What Gets Tested

### **Basic Configuration** (`artillery-config.yml`)
**Recommended for first run**

Load phases:
- **Ramp up**: 60s @ 5 req/sec
- **Sustained**: 120s @ 10 req/sec
- **Ramp down**: 60s @ 5 req/sec
- **Total duration**: ~4 minutes

Test flow per user:
1. ✅ Register new user (random credentials)
2. ✅ Login & capture JWT token
3. ✅ Connect to Socket.IO (Chat Service, port 3003)
4. ✅ Join room: "load-test-room"
5. ✅ Send 10 messages (1 second delay between each)
6. ✅ Disconnect gracefully

### **Advanced Configuration** (`artillery-advanced-config.yml`)
**For comprehensive testing**

Three weighted scenarios:
- **Full User Journey** (60%) - Complete registration to chat flow
- **Rapid Message Burst** (25%) - High-frequency messaging (50 messages)
- **Auth Stress Test** (15%) - Register → Login → Failed attempts

---

## ✨ Features

✅ **HTTP Testing**
- User registration endpoint
- User authentication endpoint
- JWT token capture and reuse

✅ **WebSocket Testing**
- Socket.IO v3 compatibility
- Room join/leave operations
- Real-time message sending
- Event-based assertions

✅ **Metrics Generated**
- Response times (p50, p95, p99)
- Throughput (requests/second)
- Error rates and failure types
- Latency statistics

✅ **Custom Processors**
- Random email generation
- Random password generation
- Token capture logging

---

## 🔧 Prerequisites Verified

✅ Node.js v16+ installed
✅ NPM v8+ installed
✅ Artillery CLI installed
✅ Docker containers running (services must be active)

---

## 📝 Configuration Options

### Adjust Load Intensity

Edit `artillery-config.yml` or `artillery-advanced-config.yml`:

```yaml
phases:
  - duration: 60        # Duration in seconds
    arrivalRate: 5      # Requests per second
    name: "Phase name"
```

### Light Load (1-2 users/sec)
```yaml
phases:
  - duration: 30
    arrivalRate: 1
```

### Medium Load (5-10 users/sec)
```yaml
phases:
  - duration: 60
    arrivalRate: 10
```

### Heavy Load (20+ users/sec)
```yaml
phases:
  - duration: 120
    arrivalRate: 50
```

---

## 📊 Expected Results Example

```
Summary report
==============

Scenarios launched: 250
Scenarios completed: 248
Requests completed: 1240

Mean response time: 245ms
Min: 50ms
Max: 1500ms
p95: 600ms
p99: 1200ms

Response codes:
  200: 1200
  201: 40
  
Errors: 2 (0.16%)
```

---

## 🎯 Next Steps

1. **Verify services running:**
   ```bash
   docker-compose ps
   ```

2. **Run basic load test:**
   ```bash
   cd tests
   npm test
   ```

3. **Generate HTML report:**
   ```bash
   artillery run artillery-config.yml -o report.json
   artillery report report.json
   ```

4. **Adjust load based on results:**
   - Edit configuration files
   - Increase `arrivalRate` for heavier load
   - Add more scenarios as needed

---

## 📚 Documentation

- **README.md** - Full technical documentation
- **QUICKSTART.md** - Quick reference guide
- **processor.js** - Custom function examples
- [Artillery Docs](https://artillery.io/docs) - Official documentation

---

## 🔍 Troubleshooting

### Services not running?
```bash
docker-compose up -d
docker-compose ps
```

### Artillery not found?
```bash
npm install -g artillery
cd tests && npm install
```

### Tests timing out?
- Increase timeout in config: `timeout: 5000`
- Check service logs: `docker-compose logs api-gateway`

### Low results?
- Increase `arrivalRate` in phases
- Run from same network as services
- Check available system resources

---

## 📞 Support

For issues:
1. Check artillery output for specific error
2. Review service logs: `docker-compose logs [service-name]`
3. Consult [Artillery documentation](https://artillery.io/docs)
4. Verify all services are healthy: `docker-compose ps`

---

## ✅ Setup Verification Checklist

- [x] Artillery installed globally
- [x] Artillery dependencies installed in `tests/`
- [x] All configuration files created
- [x] Processor functions defined
- [x] Execution scripts created
- [x] Documentation completed
- [x] Ready to run tests!

---

**You're all set!** 🎉

Run your first load test now:
```bash
cd tests && npm test
```

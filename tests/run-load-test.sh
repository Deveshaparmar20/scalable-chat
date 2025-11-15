#!/bin/bash
# Run Artillery Load Tests for Scalable Chat
# This bash script sets up and runs the Artillery load testing suite

set -e

echo "================================================"
echo "Artillery Load Test Setup & Execution"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_status "Node.js is installed: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_status "npm is installed: $(npm -v)"

# Check if Artillery is installed globally
if ! command -v artillery &> /dev/null; then
    print_warning "Artillery is not installed globally. Installing..."
    npm install -g artillery
    print_status "Artillery installed successfully"
else
    print_status "Artillery is already installed: $(artillery -v)"
fi

# Install local dependencies
echo ""
echo "Installing local dependencies..."
npm install
print_status "Dependencies installed successfully"

# Check if services are running
echo ""
echo "Checking if required services are running..."

check_service() {
    local service_name=$1
    local port=$2
    if timeout 2 bash -c "echo >/dev/tcp/localhost/$port" 2>/dev/null; then
        print_status "$service_name is running on port $port"
        return 0
    else
        print_warning "$service_name is NOT running on port $port"
        return 1
    fi
}

services_ok=true
check_service "API Gateway" 3000 || services_ok=false
check_service "Chat Service" 3003 || services_ok=false

if [ "$services_ok" = false ]; then
    echo ""
    print_warning "Some services are not running. Make sure to run 'docker-compose up -d' first."
    echo "Proceeding with load test anyway..."
fi

# Display menu
echo ""
echo "================================================"
echo "Load Test Options"
echo "================================================"
echo ""
echo "1. Run Basic Load Test (artillery-config.yml)"
echo "2. Run Advanced Load Test (artillery-advanced-config.yml)"
echo "3. Run with HTML Report"
echo "4. View Latest Report"
echo "5. Exit"
echo ""

read -p "Select an option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "Running Basic Load Test..."
        artillery run artillery-config.yml
        exit_code=$?
        ;;
    2)
        echo ""
        echo "Running Advanced Load Test..."
        artillery run artillery-advanced-config.yml
        exit_code=$?
        ;;
    3)
        echo ""
        echo "Running Load Test with Report Generation..."
        artillery run artillery-config.yml -o report.json
        if [ $? -eq 0 ]; then
            echo ""
            echo "Generating HTML Report..."
            artillery report report.json -o report.html
            print_status "Report generated: report.html"
            exit_code=0
        else
            print_error "Load test failed"
            exit_code=1
        fi
        ;;
    4)
        if [ -f "report.html" ]; then
            print_status "Opening report.html..."
            if command -v xdg-open &> /dev/null; then
                xdg-open report.html
            elif command -v open &> /dev/null; then
                open report.html
            else
                print_warning "Could not open report automatically. Please open report.html manually."
            fi
        else
            print_error "No report found. Run option 3 first to generate a report."
        fi
        exit 0
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "================================================"
if [ $exit_code -eq 0 ]; then
    print_status "Load test completed successfully"
else
    print_error "Load test failed with exit code $exit_code"
fi
echo "================================================"
echo ""

exit $exit_code

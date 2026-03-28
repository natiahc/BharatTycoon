#!/bin/bash
# Automated test runner for BharatTycoon

echo "Starting BharatTycoon API Tests..."
echo "===================================="

# Start backend in background
cd /Users/natiahc/sandbox/repo/BharatTycoon/BharatTycoon-backend
echo "Starting backend server..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Run tests
echo ""
echo "Running API tests..."
python test_api.py

# Cleanup
echo ""
echo "Stopping backend..."
kill $BACKEND_PID

echo "===================================="
echo "Tests complete!"

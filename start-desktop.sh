#!/bin/bash
# Yatrify Nepal - Unix Desktop App Runner

clear
echo "========================================================"
echo "  ___ ____ ____ ___ _ _ _ _ _ ___ _ _ "
echo " \  / |--\  |   |  |   | \_/   |   |  "
echo "  \/  |  \  |   |  |__ |  |    |   |__ "
echo "========================================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[Yatrify] Installing local dependencies..."
npm install --no-audit --no-fund

echo ""
echo "[Yatrify] Opening application in your browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
else
    echo "[INFO] Please navigate to http://localhost:3000 in your browser."
fi

echo "[Yatrify] Starting the live local server..."
npm run dev

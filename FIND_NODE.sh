#!/bin/bash

# Script pentru a găsi Node.js și npm pe server

echo "=== Căutare Node.js și npm ==="

echo ""
echo "1. Verifică în PATH:"
which node
which npm

echo ""
echo "2. Verifică în /usr/local/bin:"
ls -la /usr/local/bin/node* 2>/dev/null || echo "Nu există"

echo ""
echo "3. Verifică în /usr/bin:"
ls -la /usr/bin/node* 2>/dev/null || echo "Nu există"

echo ""
echo "4. Verifică în $HOME:"
find $HOME -name node -type f 2>/dev/null | head -5

echo ""
echo "5. Verifică versiunea Node.js (dacă este în PATH):"
node --version 2>/dev/null || echo "Node.js nu este în PATH"

echo ""
echo "6. Verifică versiunea npm (dacă este în PATH):"
npm --version 2>/dev/null || echo "npm nu este în PATH"

echo ""
echo "=== Găsește manual ==="
echo "Rulează: find /usr -name node 2>/dev/null"
echo "Sau: find /opt -name node 2>/dev/null"


#!/usr/bin/env bash
# HireAI — one-command local setup.
# Run this from the project root: bash setup.sh

set -e

echo "🚀 Setting up HireAI..."
echo ""

# ── Backend ─────────────────────────────────────────────
echo "📦 Installing backend dependencies..."
cd server
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created server/.env from .env.example — edit it if you're using MongoDB Atlas, email, etc."
fi
cd ..

# ── Frontend ────────────────────────────────────────────
echo ""
echo "📦 Installing frontend dependencies..."
cd client
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created client/.env from .env.example"
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure MongoDB is running (local: 'mongod', or set MONGO_URI in server/.env to an Atlas URI)"
echo "  2. Seed demo data:   cd server && npm run seed"
echo "  3. Start backend:    cd server && npm run dev"
echo "  4. Start frontend:   cd client && npm run dev   (in a new terminal)"
echo "  5. Open http://localhost:5173"
echo ""
echo "Demo accounts (after seeding):"
echo "  candidate@hireai.com / Candidate@123"
echo "  hr@hireai.com        / Hr@12345"
echo "  admin@hireai.com     / Admin@123"

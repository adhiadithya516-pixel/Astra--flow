# Astra Flow — Supply Chain Resilience Platform

Astra Flow is a complete, full-stack logistics and supply-chain management platform featuring real-time driver tracking, autonomous notifications, map rendering, and robust offline capabilities.

## Architecture & Tech Stack

Astra Flow is built on a microservices architecture with three main local services:

1. **Frontend (Next.js 14)**
   - Location: `/frontend`
   - Framework: React, Next.js (App Router)
   - Real-time Client: `socket.io-client`
   - Features: Real-time map rendering, shipment creation, tracking URL generation, and dynamic Next.js Proxy (`next.config.mjs`) to bypass mobile tunnel mixed-content restrictions.

2. **Backend API (FastAPI / Python)**
   - Location: `/api`
   - Framework: FastAPI, Uvicorn
   - Database Client: Supabase Python Client
   - Features: Handles shipment CRUD operations, external geocoding, authentication bypassing for mobile testing, and background rule engine tasking.

3. **Real-time Server (Node.js)**
   - Location: `/ws-server`
   - Framework: Node.js, Socket.io
   - Features: Facilitates real-time, low-latency live GPS pings from the driver's mobile browser to the operations dashboard.

4. **Database (Supabase)**
   - Hosted PostgreSQL database storing Shipments, Segments, Location History, and Alerts.

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (verified on v24.12)
- **Python**: 3.12+ 
- **Package Managers**: `npm`, `pip`

### 2. Environment Setup

**Frontend (`/frontend/.env.local`)**
```env
NEXT_PUBLIC_SUPABASE_URL="https://ietalksfcjixckkfzruo.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
NEXT_PUBLIC_API_URL="/api"
NEXT_PUBLIC_WS_URL=""
```
*(Note: API and WS URLs are set to relative paths to seamlessly support localtunnel proxying via Next.js rewrites).*

**Backend (`/api/.env`)**
Required environment variables for Supabase access and internal routing.

### 3. Running Locally

You need to spin up all 3 services concurrently. 

**Terminal 1: Start the Fast API Backend**
```bash
cd api
python -m pip install -r requirements.txt # (fastapi, uvicorn, supabase, httpx, python-dotenv)
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 2: Start the WebSocket Server**
```bash
cd ws-server
npm install
node index.js
```

**Terminal 3: Start the Next.js Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 4. Setting up a Public Tunnel (for Mobile GPS Testing)
Mobile browsers strictly require HTTPS to allow `navigator.geolocation` access. Since Astra Flow is designed for mobile tracking, you must expose it via a secure tunnel.

```bash
# In the project root, start a permanent background tunnel:
npx localtunnel --port 3000 --subdomain astra-tracker
```
Access the application globally via: `https://astra-tracker.loca.lt/dashboard`

*(The Next.js `next.config.mjs` automatically handles proxying `/api` and `/socket.io` to your internal Python and Node servers to prevent Mixed Content security errors on mobile devices.)*

## Key Workflows

1. **Shipment Creation**: Dispatcher enters origin, destination, and driver phone via the Dashboard.
2. **Autonomous Notification**: The system generates a secure tracking Token and deep-links it via WhatsApp/SMS to the driver's phone.
3. **Live Tracking**: The driver opens the link on their mobile device (via `https://astra-tracker.loca.lt`). The browser initiates high-frequency GPS pinging over WebSockets to the Node server.
4. **Dashboard View**: Dispatchers see real-time positional updates plotted dynamically onto the dashboard map.

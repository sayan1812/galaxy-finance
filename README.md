# Galaxy Finance

A bi-modal financial telemetry dashboard delivering real-time solvency tracking, multi-vault asset governance, and interactive 3D portfolio orbits across web and mobile environments.

---

## 1. Project Overview

Galaxy Finance is an executive personal finance and wealth telemetry platform. It provides individuals and finance operators with unified visibility across bank accounts, digital UPI wallets, physical cash holdings, and expenditure channels. 

The system provides bi-modal operation: a responsive web application optimized for desktop dashboards and mobile devices, coupled with a high-performance Three.js 3D orbital simulation engine that dynamically visualizes asset allocation and monthly burn rates across adaptive Light and Dark cosmic themes.

---

## 2. Key Capabilities

- **Real-Time Solvency Tracking**: Continuous aggregation of liquid cash, bank balances, net available capital, and month-over-month cash flow trajectory.
- **Dynamic Multi-Vault Management**: Complete isolation and tracking of multiple bank accounts, credit/debit facilities, cash reserves, and specialized investment vaults with transaction-to-vault binding.
- **3D Interactive Portfolio Orbits**: WebGL/Three.js spatial simulation rendering accounts and expense categories as gravitational planetary systems with full Light Mode and Dark Mode color harmonization.
- **Balance Masking & Privacy Controls**: Native eye-toggle privacy mode to obscure sensitive currency figures on shared screens while preserving full analytical telemetry.
- **Automated Statement Generation**: Production of itemized audit statements, high-resolution PDF exports with pagination and branding, and raw CSV data extracts.
- **Dual-Engine Persistence**: Cloud-native MongoDB Atlas database schema backed by automated local persistence layers for offline resilience.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Engine**: Vite 8
- **Styling**: Tailwind CSS (Tailwind v4 with CSS variables design tokens)
- **3D Visualization**: Three.js (WebGL Canvas with adaptive lighting and orbital math)
- **Data Visualization**: Recharts
- **Iconography**: Lucide React
- **PDF Generation**: jsPDF + jsPDF-AutoTable

### Backend
- **Runtime**: Node.js (ES Modules)
- **Server Framework**: Express.js
- **Database Engine**: MongoDB Atlas via Mongoose ODM
- **Local Fallback**: SQLite3 / SQL database engine
- **Security & Networking**: CORS, Cookie-Parser, Cross-Origin-Opener-Policy (COOP) headers

### Authentication & Authorization
- **Identity Provider**: Firebase Authentication (Google OAuth Popup + Email/Password)
- **Session Architecture**: Firebase ID Token validation paired with MongoDB JWT synchronization

---

## 4. Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)
- Active MongoDB connection string (MongoDB Atlas or local MongoDB instance)
- Firebase Project with Authentication enabled (Google & Email/Password providers)

### Environment Variable Configuration

Create a `.env` file in the root directory following this template:

```env
# Application Server
PORT=5000
NODE_ENV=development

# Database Connectivity
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/galaxy_finance?retryWrites=true&w=majority
JWT_SECRET=your_jwt_private_secret_key_here

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Frontend API Target (Vite dev server proxies /api to this address)
VITE_API_URL=http://localhost:5000
```

### Installation & Execution Commands

1. **Install Root & Frontend Dependencies**:
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Start the Backend API Server**:
   ```bash
   cd server
   npm run dev
   ```
   *The API server will initialize on `http://localhost:5000` and establish database connections.*

4. **Start the Frontend Vite Dev Server**:
   ```bash
   npm run dev -- --host
   ```
   *The client interface will be available at `http://localhost:5173/`.*

---

## 5. API Overview

All core backend endpoints are exposed under `/api` (and `/api/v1` for versioned routing):

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status, uptime, and database connection state | No |
| `POST` | `/api/v1/auth/register` | Register new user account with credentials | No |
| `POST` | `/api/v1/auth/login` | Authenticate existing user with email and password | No |
| `POST` | `/api/v1/auth/google-sync` | Synchronize Firebase OAuth UID and profile to MongoDB | Yes (Firebase Token) |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile and subscription metadata | Yes (JWT) |
| `GET` | `/api/v1/accounts` | List all bank accounts and vaults for the user | Yes (JWT) |
| `POST` | `/api/v1/accounts` | Create a new bank vault or wallet account | Yes (JWT) |
| `GET` | `/api/v1/accounts/:id` | Fetch specific bank vault details and transaction sub-ledger | Yes (JWT) |
| `PUT` | `/api/v1/accounts/:id` | Update bank vault balance, nickname, or planet color | Yes (JWT) |
| `DELETE` | `/api/v1/accounts/:id` | Remove a bank vault from tracking | Yes (JWT) |
| `GET` | `/api/v1/transactions` | Query transactions with date range, category, and account filters | Yes (JWT) |
| `POST` | `/api/v1/transactions` | Record an inflow, outflow, or cash balance adjustment | Yes (JWT) |
| `PUT` | `/api/v1/transactions/:id` | Update existing transaction metadata or amount | Yes (JWT) |
| `DELETE` | `/api/v1/transactions/:id` | Soft or hard delete a recorded transaction | Yes (JWT) |
| `GET` | `/api/v1/dashboard/summary` | Retrieve aggregated portfolio KPIs, monthly burn, and vault stats | Yes (JWT) |
| `GET` | `/api/download/apk` | Download standalone Android APK package | No |

---

## 6. Deployment Guide

### Backend Deployment (Render)

1. **Create Web Service**:
   - Link the repository on the Render Dashboard.
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
2. **Environment Variables**:
   - Configure `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, and `PORT=5000`.
3. **Health Check Endpoint**:
   - Set health check path to `/health`.

### Frontend Deployment (Netlify)

1. **Link Repository**:
   - Connect the GitHub repository to Netlify.
   - **Base directory**: Root (`.`)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
2. **Netlify Configuration File (`netlify.toml`)**:
   - Static assets cached immutably with 1-year max-age.
   - SPA route redirection (`/*` to `/index.html 200`).
   - Secure proxy rewrite (`/api/*` to Render backend URL).
   - Cross-Origin-Opener-Policy (`same-origin-allow-popups`) header applied across all routes.
3. **Environment Variables in Netlify**:
   - Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and other client credentials in Netlify Site Configuration.

---

## 7. License & Compliance

This software is developed for personal wealth management, portfolio telemetry, and financial auditing. Financial figures presented inside the application represent user-recorded ledgers and do not constitute formal investment or tax advice.

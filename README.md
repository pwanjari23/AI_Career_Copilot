# AI Career Copilot

An AI-powered full-stack platform that helps users analyze resumes, prepare for technical interviews, identify skill gaps, generate visual learning roadmaps, and track career development in real time.

---

## Technical Stack

### Frontend
- **React.js & Vite** (Fast bootstrapping and development)
- **Tailwind CSS** (Premium utility styling, custom HSL colors, responsive design)
- **React Router DOM** (Single page routing and navigation guards)
- **Axios** (API requests with automatic JWT silent refresh interceptors)
- **React Hook Form** (Form validation and state tracking)
- **Chart.js & react-chartjs-2** (Interactive analytics graphs)
- **Lucide React** (Clean developer icons)

### Backend
- **Node.js & Express.js** (MVC architecture, routing, middleware orchestration)
- **Sequelize ORM & MySQL Dialect** (Connection pooling, model definitions, relations)
- **Google Gemini API** (Structured JSON responses for parser/interview modules)
- **Socket.io** (Bidirectional real-time chatbot connection)
- **Multer** (File upload verification for resumes and photos)
- **jsonwebtoken & bcryptjs** (Encrypted logins, session management, RBAC verification)

---

## Project Structure

```text
AI_Copilot_Career/
├── backend/                  # Node.js MVC Server
│   ├── config/               # DB setup and connection pool
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # RBAC filter, JWT decoder, upload gates
│   ├── models/               # Sequelize DB declarations
│   ├── routes/               # Express endpoints
│   ├── services/             # Gemini API, PDF parsing, Socket.io
│   ├── utils/                # Standard apiResponse and JWT utility
│   ├── validators/           # express-validator schemas
│   ├── uploads/              # Local storage for avatars/resumes
│   └── server.js             # Main server entry file
└── frontend/                 # React SPA Client
    ├── public/               # Static icons
    └── src/
        ├── components/       # Layouts, Sidebar, buttons, skeletons
        ├── context/          # Auth context, Theme context
        ├── pages/            # App pages (Landing, Dashboard, Chats)
        ├── services/         # Axios config, Socket connections
        └── index.css         # Base Tailwind styling sheets
```

---

## Local Development Guide

### 1. Database Configuration
Make sure you have MySQL server installed and running locally. By default, the backend will verify/create a database named `ai_career_copilot`.

### 2. Backend Setup
1. Create a `backend/.env` file with details matching `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ai_career_copilot
   DB_PORT=3306
   JWT_ACCESS_SECRET=your_secret_access_key
   JWT_REFRESH_SECRET=your_secret_refresh_key
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:5173
   ```
2. Navigate to `backend` and run:
   ```bash
   npm install
   npm run dev
   ```

### 3. Frontend Setup
1. Create a `frontend/.env` file in the frontend folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
2. Navigate to `frontend` and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## Deployment Guide

### Backend Deployment (Render)

1. **Database Hosting**: Set up a cloud MySQL instance (e.g. using Aiven, PlanetScale, or Render MySQL).
2. **Web Service Setup**:
   - Create a new **Web Service** on Render connected to your backend repository.
   - Set **Root Directory** to `backend`.
   - Set **Build Command** to `npm install`.
   - Set **Start Command** to `npm start`.
3. **Environment Variables**: Add your production keys inside the Render environment settings:
   - `NODE_ENV`: `production`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: Set to cloud MySQL connection parameters.
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Secure cryptographic strings.
   - `GEMINI_API_KEY`: Your official Gemini developer API key.
   - `FRONTEND_URL`: The deployed Vercel frontend URL.

---

### Frontend Deployment (Vercel)

1. **Vercel Project Setup**:
   - Create a new project on Vercel connected to the repository.
   - Set **Framework Preset** to `Vite`.
   - Set **Root Directory** to `frontend`.
2. **Build and Output**:
   - Vercel will auto-fill:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
3. **Environment Variables**: Add keys inside the Vercel dashboard:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-render-backend-url.onrender.com`
4. Click **Deploy**. Vercel will compile the assets and host your career copilot client app.

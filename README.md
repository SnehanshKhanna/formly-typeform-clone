# Formly — Typeform Clone

Formly is an open-source, full-stack conversational form builder and respondent platform inspired by Typeform. It delivers a fluid drag-and-drop form creation experience, seamless autosave, rich question-type customization, a keyboard-navigable respondent player, and comprehensive real-time analytics.

---

## 🌟 Key Features

- **Visual Form Builder**: Reorder, add, duplicate, and delete questions with ease using a drag-and-drop canvas and outline sidebar.
- **8 Question Types**:
  - `short_text` — Single-line text input
  - `long_text` — Multi-line responses
  - `multiple_choice` — Single or multi-selection with randomized option order
  - `dropdown` — Searchable dropdown picker
  - `email` — Validated email entry
  - `number` — Min/max-validated numeric entry
  - `yes_no` — Binary quick-response toggle
  - `rating` — Configurable star/score rating scales
- **Smart Autosave**: Debounced queue with background flushing and retry logic.
- **Immersive Respondent Player**: One-question-at-a-time viewport with smooth transitions, progress indicators, keyboard navigation (Enter/Tab/Arrows), and instant validation feedback.
- **Publish & Share**: Unique slug generation, live/draft state toggling, and instant shareable public links.
- **Analytics & Submissions**: Real-time response counts, completion rates, submission inspection, and per-question distribution stats.

---

## 🏗️ Architecture

```
                       ┌────────────────────────┐
                       │     Vercel Frontend    │
                       │   (Next.js App Router) │
                       └───────────┬────────────┘
                                   │
                     REST API + CORS (NEXT_PUBLIC_API_BASE_URL)
                                   │
                                   ▼
                       ┌────────────────────────┐
                       │      Render Backend    │
                       │    (FastAPI + Uvicorn) │
                       └───────────┬────────────┘
                                   │
                                   ▼
                       ┌────────────────────────┐
                       │      SQLite DB         │
                       │ (/data/formly.db disk) │
                       └────────────────────────┘
```

- **Frontend**: Next.js 15 (React 19), Tailwind CSS, Zustand state stores, `@dnd-kit`, Radix UI primitives, Lucide icons.
- **Backend**: FastAPI, SQLAlchemy ORM with SQLite, Alembic migrations, Pydantic v2 validation.
- **Testing**: Pytest (backend unit/integration, 94% coverage), Vitest (frontend store/components), Playwright (full E2E test suite).

---

## 🚀 Local Quickstart

### 1. Prerequisites

- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ (Node.js 20+ recommended)
- Git

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run migrations to initialize the database
alembic upgrade head

# Seed initial test forms and submissions
python seed.py

# Start development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` (API docs at `http://localhost:8000/api/docs`).

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api in frontend/.env.local

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Testing Suite

### Backend Tests

```bash
cd backend
# Run test suite
python -m pytest -v

# Run with test coverage
python -m pytest --cov=app tests

# Run linter
ruff check app tests
```

### Frontend Tests

```bash
cd frontend
# TypeScript check
npm run typecheck

# Linter
npm run lint

# Component & Store tests (Vitest)
npm run test -- --run

# Production build verification
npm run build
```

### End-to-End Tests (Playwright)

```bash
cd frontend
npx playwright test
```

---

## 🌐 Production Deployment

### Backend: Render Web Service

1. Fork or push this repository to GitHub.
2. Sign in to [Render](https://render.com/) and click **New > Web Service**.
3. Connect your GitHub repository: `https://github.com/SnehanshKhanna/formly-typeform-clone`.
4. Configure service settings:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Region**: Any (e.g., Oregon)
   - **Branch**: `main`
5. Configure **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `ENV` | `production` | Production environment flag |
   | `DATABASE_URL` | `sqlite:////data/formly.db` | Persistent database path |
   | `CORS_ORIGINS` | `https://<your-vercel-app>.vercel.app` | Allowed frontend domains (comma-separated) |
6. **Persistent Disk (Recommended)**:
   - Go to the **Disks** section in Render.
   - Click **Add Disk**:
     - **Name**: `formly-data`
     - **Mount Path**: `/data`
     - **Size**: 1 GB
7. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g. `https://formly-backend.onrender.com`).
8. Verify backend health:
   - `GET https://<your-backend-url>/health` → `{"status": "ok"}`
   - `GET https://<your-backend-url>/api` → `{"status": "ok", "message": "Formly API is running"}`

---

### Frontend: Vercel

1. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Select your repository: `https://github.com/SnehanshKhanna/formly-typeform-clone`.
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
4. Configure **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_BASE_URL` | `https://<your-backend-url>.onrender.com/api` | Render backend API endpoint |
5. Click **Deploy**.
6. Once deployed, note your Vercel URL (e.g. `https://formly-typeform-clone.vercel.app`).
7. Return to Render and update `CORS_ORIGINS` to include your Vercel URL if you haven't already.

---

## 📖 Production Smoke Test Flow

1. **Dashboard**: Navigate to the Vercel URL. Forms list loads with seeded or newly created forms.
2. **Form Creator**: Click "Create Form", configure question titles, descriptions, and answer options.
3. **Autosave**: Watch the save badge transition to "Saved" automatically.
4. **Publish**: Click "Publish", copy the live public URL (`/f/{slug}`).
5. **Respondent Flow**: Open the public URL in an incognito window. Progress through questions using keyboard shortcuts (Enter / Tab / Arrow keys) and submit.
6. **Results**: Return to the builder dashboard, navigate to the "Results" tab, and verify that the submission and summary charts reflect the new response in real time.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

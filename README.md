# Formly - Typeform Clone

Formly is a full-stack form builder and survey application inspired by Typeform. It provides a drag-and-drop form builder, a sleek one-question-at-a-time player, and a results dashboard.

## Features
- **Form Builder**: Interactive drag-and-drop UI to create forms.
- **Form Player**: Clean, single-question layout for taking surveys.
- **Results Dashboard**: View responses and stats for your forms.

## Tech Stack
- **Frontend**: Next.js (App Router), React 19, Tailwind CSS, Zustand, dnd-kit, Playwright.
- **Backend**: FastAPI, SQLite, SQLAlchemy, Alembic, Pytest.

## Screenshots
- **Dashboard**: `docs/screenshots/dashboard.png`
- **Builder**: `docs/screenshots/builder.png`
- **Player**: `docs/screenshots/player_public.png`
- **Results**: `docs/screenshots/results_summary.png`

## Setup & Running Locally
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture
- Frontend communicates with the Backend via REST API.
- Backend uses SQLite for storage and SQLAlchemy for ORM.

## Environment Variables
See `.env.example` in both `frontend` and `backend` directories.

## Docker
The backend includes a `Dockerfile` for easy deployment.
```bash
cd backend
docker build -t formly-backend .
docker run -p 8000:8000 -v formly_data:/data formly-backend
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Two independent apps in one directory, developed and run separately (there is no root-level orchestration, no monorepo tooling, and the directory is not a git repo):

- `backend/` — Django 6 project (Python 3.12), SQLite (`db.sqlite3`). The Django *project* package is `backend/backend/`; application code lives in the `api` app (`backend/api/`).
- `frontend/` — Vite 8 + React 19 SPA (plain JS/JSX, not TypeScript).

**How the two halves connect:** the frontend has no hardcoded backend URL. Instead, `frontend/vite.config.js` proxies `/api/*` to `http://localhost:8000` during dev, so frontend code calls relative paths like `fetch('/api/ping/')` and avoids CORS entirely. Django routes `api/` (in `backend/backend/urls.py`) into `api/urls.py`. Adding a new endpoint means: add a view in `api/views.py`, register it in `api/urls.py`, then call `/api/<path>` from the frontend. There is currently no DRF or CORS middleware — endpoints return plain `JsonResponse`.

## Commands

Backend (run from `backend/`):
```
python manage.py runserver        # dev server on :8000
python manage.py check
python manage.py makemigrations api
python manage.py migrate
python manage.py test             # all tests
python manage.py test api.tests.ClassName.test_method   # single test
pip install -r requirements.txt
```

Frontend (run from `frontend/`):
```
npm run dev       # Vite dev server (proxies /api -> :8000)
npm run build
npm run lint      # ESLint flat config
npm run preview
```

Full local dev requires **both** servers running simultaneously (Django on :8000, Vite on its own port proxying to it).

## Conventions

- New Django apps must be added to `INSTALLED_APPS` in `backend/backend/settings.py` or Django silently ignores them (`startapp` alone does not register the app).
- `settings.py` ships with `DEBUG = True` and an insecure `SECRET_KEY` — development defaults only.

# Setup Guide

This guide walks you through getting the **Farm DB** application up and running both locally (Docker) and in development mode.

## Prerequisites
- Docker & Docker‑Compose installed.
- Node.js (v18+) and npm for the React frontend.
- Python 3.10+ and `virtualenv` (optional, for non‑Docker backend work).

## 1️⃣ Start with Docker (recommended)
```bash
# Clone the repository
git clone <repo-url>
cd farm-db

# Build and launch all services
docker compose up -d --build
```
The following containers will be started:
- `db` – MySQL 8 (`localhost:3306`).
- `web` – Django API server (`localhost:8000`).
- `react` – React development server (`localhost:3000`).

### Verify everything is running
```bash
# Check the API health endpoint (returns a 200 JSON response)
curl -i http://localhost:8000/api/farms/
```
You should see an HTTP 200 with a JSON payload similar to:
```json
{"count":1,"results":[{...}]}
```
Open the UI in your browser at **http://localhost:3000/farms** – you will see a table of farms.

## 2️⃣ Development workflow (without Docker)
### Backend
```bash
# Create a virtual environment (optional but recommended)
python3 -m venv myenv
source myenv/bin/activate

# Install Python dependencies
tap pip install -r requirements.txt

# Apply migrations and start the server
./myenv/bin/python farm_app/farm/manage.py migrate
./myenv/bin/python farm_app/farm/manage.py runserver 0.0.0.0:8000
```
Make sure the environment variable `DBHOST` points to your MySQL instance, e.g.:
```bash
export DBHOST=localhost   # when running MySQL locally
echo $DBHOST
```
### Frontend
```bash
cd react-frontend
npm install   # installs dependencies listed in package.json
npm start      # runs on http://localhost:3000
```
The React app reads the API base URL from `REACT_APP_API_URL` (default `http://localhost:8000`).

## 3️⃣ Environment variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DBHOST` | Hostname of the MySQL container/database. Used by Django settings. | `db` (Docker) or `localhost` (local dev) |
| `REACT_APP_API_URL` | Base URL for Axios requests from React. | `http://localhost:8000` |

## 4️⃣ Testing
```bash
# Backend tests (Django)
./myenv/bin/python farm_app/farm/manage.py test farms
```
Frontend unit‑tests can be added later; for now you can lint the code:
```bash
cd react-frontend
npm run lint   # if eslint is configured
```

## 5️⃣ Troubleshooting
See **docs/troubleshooting.md** for common errors such as CORS, DB connection failures, and missing authentication tokens.

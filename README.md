# Farm DB Application

A full‑stack sample application consisting of:

- **Backend** – Django 3.2 with Django REST Framework providing a JSON API for farms, transactions and fields.
- **Frontend** – React 18 (create‑react‑app) using Material‑UI components. The UI talks to the backend via the DRF endpoints.
- **Database** – MySQL 8 running in Docker.
- **Containerised deployment** – Docker Compose orchestrates three services (`db`, `web`, `react`).

## Quick start (Docker)
```bash
# Clone the repo and cd into it
git clone <repo‑url>
cd farm-db

# Build and start all containers (backend, frontend & MySQL)
docker compose up -d --build
```
The services become available at:
- API: http://localhost:8000/api/
- React UI: http://localhost:3000/

## Development workflow
1. **Backend** – The Django project lives under `farm_app/farm`.  Run migrations with:
   ```bash
   ./myenv/bin/python farm_app/farm/manage.py migrate
   ```
2. **Frontend** – The React source is in `react-frontend/`.  Start the dev server locally (without Docker) with:
   ```bash
   cd react-frontend
   npm start   # runs on http://localhost:3000
   ```
3. **Environment variables**
   - `DBHOST` – hostname of the MySQL container (`db`).  The Django settings default to this value.
   - `REACT_APP_API_URL` – base URL for the API used by the React Axios client (default `http://localhost:8000`).

## API reference
The main endpoints are defined in `farm_app/farm/urls.py`:
- **GET /api/farms/** – List farms.
- **POST /api/farms/** – Create a farm.
- **GET /api/farms/<id>/** – Retrieve a single farm.
- **PUT/PATCH /api/farms/<id>/** – Update a farm.
- **DELETE /api/farms/<id>/** – Delete a farm.

Authentication is provided by DRF token auth:
- **POST /api-token-auth/** – Supply `username` and `password`, receive a token.
  Include the token in subsequent requests as `Authorization: Token <token>` (the Axios client adds this automatically).

Additional resources for transactions, fields etc. follow a similar pattern under `/api/transactions/` and `/api/fields/`.

## Testing & linting
```bash
# Backend tests (Django)
./myenv/bin/python farm_app/farm/manage.py test farms

# Frontend lint / format (optional)
cd react-frontend
npm run lint
```

## Deploying without Docker
You can run the Django server directly with the virtual‑environment interpreter and serve the React build as static files.  Build the frontend first:
```bash
cd react-frontend
npm run build   # outputs to ../farm_app/farm/static/
```
Then start Django:
```bash
./myenv/bin/python farm_app/farm/manage.py runserver 0.0.0.0:8000
```

## Troubleshooting
- **CORS errors** – Ensure `django-cors-headers` is installed and `CORS_ALLOW_ALL_ORIGINS = True` (or configure allowed origins) in `settings.py`.
- **Database connection** – The Django setting reads the host from `os.getenv('DBHOST', 'db')`.  When running locally without Docker, set `export DBHOST=localhost` before migrating or starting the server.
- **Missing token on API calls** – Verify that the token is stored in `localStorage` by the login component and that the Axios interceptor adds it to request headers.

## License
This project is provided for educational purposes. Feel free to fork, modify, and experiment.

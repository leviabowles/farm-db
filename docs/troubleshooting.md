# Troubleshooting Guide

This document collects the most frequent problems you may encounter while working with the **Farm DB** application and how to resolve them.

## 1. CORS Errors
```
Access to fetch at 'http://localhost:8000/api/...'' from origin 'http://localhost:3000' has been blocked by CORS policy
```
### Fix
- Ensure `django-cors-headers` is installed (`pip install django-cors-headers`).
- In `farm_app/farm/farm/settings.py`:
  ```python
  INSTALLED_APPS += ['corsheaders']
  MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', *MIDDLEWARE]
  CORS_ALLOW_ALL_ORIGINS = True   # or set a whitelist with CORS_ALLOWED_ORIGINS
  ```
- Restart the Django container (`docker compose restart web`).

## 2. Database Connection Refused
```
OperationalError: could not connect to server: Connection refused
```
### Fix
- When running inside Docker, `DBHOST` must be set to the service name **db**. This is already defined in `docker-compose.yml`. If you run Django locally, export:
  ```bash
  export DBHOST=localhost   # or the host where MySQL runs
  ```
- Verify the MySQL container is healthy:
  ```bash
  docker compose ps db
  ```
- Check that port 3306 is not blocked by a firewall.

## 3. Missing Token on API Calls
API requests return `401 Unauthorized` even after logging in.
### Fix
- The login component stores the token in `localStorage` under the key `'token'`. Confirm it exists:
  ```javascript
  console.log(localStorage.getItem('token'))
  ```
- The Axios interceptor (see `react-frontend/src/services/api.js`) must read this value and set the `Authorization` header. If you edited the file, ensure the code matches:
  ```javascript
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Token ${token}`;
    return config;
  });
  ```
- Clear browser storage and log in again.

## 4. Django Migrations Fail
```
django.db.utils.OperationalError: no such table: django_migrations
```
### Fix
- Make sure you run migrations against the correct database:
  ```bash
  ./myenv/bin/python farm_app/farm/manage.py migrate
  ```
- If the MySQL container was recreated, the volume may have been removed. Re‑run the migration command after the containers are up.

## 5. React Development Server Fails to Start (`npm start` exits with code 254)
### Common causes
- **Port already in use** – another process occupies port 3000.
- **Missing dependencies** – `node_modules` not installed or corrupted.
### Fix
1. Ensure dependencies are installed:
   ```bash
   cd react-frontend
   npm ci    # clean install based on package-lock.json
   ```
2. If the port is busy, change it in `.env` or start with a custom port:
   ```bash
   PORT=3001 npm start
   ```
3. Verify that `package.json` scripts contain:
   ```json
   "start": "react-scripts start"
   ```
4. Check the console output for any syntax errors in your components.

## 6. Docker Compose “version” warning
```
WARN[0000] ... the attribute `version` is obsolete, it will be ignored
```
### Fix
- The `docker-compose.yml` file contains a top‑level `version:` key which is no longer required for v2 schema. You can safely delete that line – Docker Compose will still work.

## 7. API Returns Empty List after Restart
If `/api/farms/` returns an empty array after you restart the stack, the data may have been lost.
### Fix
- By default MySQL stores its data in a named volume (`farm-db-data`). Ensure the volume is persisted:
  ```yaml
  services:
    db:
      volumes:
        - farm-db-data:/var/lib/mysql
  volumes:
    farm-db-data:
  ```
- Do **not** run `docker compose down --volumes` unless you intend to wipe the database.

---
For any other issues, feel free to open an issue on the repository or consult the official Django/React documentation.

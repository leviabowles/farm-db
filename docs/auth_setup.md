# Authentication & CORS Setup

This repository now includes:

1. **CORS configuration** – `corsheaders` is installed and `CORS_ALLOW_ALL_ORIGINS = True` in `farm_app/farm/farm/settings.py`.
2. **Database host environment variable** – `DBHOST=db` is set in `docker-compose.yml` so Django can connect to the MySQL container both locally and in CI.
3. **Token authentication** – DRF token auth is enabled via:
   * `rest_framework.authtoken` added to `INSTALLED_APPS`
   * `DEFAULT_AUTHENTICATION_CLASSES` includes `TokenAuthentication`
   * `/api-token-auth/` endpoint exposed in `farm_app/farm/farm/urls.py`

The front‑end (`react-frontend`) stores the token in `localStorage` after a successful login and attaches it to every request via an Axios interceptor.

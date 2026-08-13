# API Documentation

The backend exposes a JSON REST API built with **Django REST Framework**. All endpoints are prefixed with `/api/`.

## Authentication
- **POST** `/api-token-auth/`
  - Request body (JSON): `{ "username": "<user>", "password": "<pass>" }`
  - Response: `{ "token": "<auth‑token>" }`
  - Use the token in subsequent requests via the HTTP header:
    ```
    Authorization: Token <auth‑token>
    ```

## Farm Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/farms/` | List all farms (paginated). Returns `{ "count": n, "results": [ ... ] }`. |
| POST | `/api/farms/` | Create a new farm. Body: `{ "farm_name": "...", "location": "..." }`. |
| GET | `/api/farms/{id}/` | Retrieve a single farm by its primary key. |
| PUT/PATCH | `/api/farms/{id}/` | Update an existing farm (full or partial). |
| DELETE | `/api/farms/{id}/` | Delete a farm.

### Farm Model fields
- `id` – integer, auto‑generated primary key.
- `farm_name` – string, required.
- `location` – string, optional.
- `create_date` / `update_date` – timestamps automatically set by Django.

## Transaction Endpoints (similar pattern)
- **GET** `/api/transactions/`
- **POST** `/api/transactions/`
- **GET** `/api/transactions/{id}/`
- **PUT/PATCH** `/api/transactions/{id}/`
- **DELETE** `/api/transactions/{id}/`

## Field Endpoints (similar pattern)
- **GET** `/api/fields/`
- **POST** `/api/fields/`
- **GET** `/api/fields/{id}/`
- **PUT/PATCH** `/api/fields/{id}/`
- **DELETE** `/api/fields/{id}/`

All list endpoints are paginated with `limit` and `offset` query parameters. Example:
```
GET /api/farms/?limit=10&offset=20
```

## Error handling
- Validation errors return HTTP 400 with a JSON payload describing the field issues.
- Authentication failures return HTTP 401.
- Permission denials (if expanded) would return HTTP 403.

---
**Note:** The API is deliberately simple for demo purposes. In production you would likely add permission classes, throttling and more granular serializers.

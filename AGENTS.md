# Farm DB Agent Guide

## Overview

This is a Django-based farm accounting application with a React frontend. The application uses **manual SQL management** for the database schema (no Django migrations) and is deployed via **GitHub Actions CI/CD** to a self-hosted server.

---

## ⚠️ Critical Configuration

### 1. NO DJANGO MIGRATIONS - MANUAL SQL ONLY

**WARNING:** This project uses **manual SQL schema management**. Do NOT create or modify Django migrations.

#### Configuration:
```python
# farm_app/farm/farm/settings.py
MIGRATION_MODULES = {
    'admin': None,
    'auth': None,
    'contenttypes': None,
    'sessions': None,
    'farms': None,  # Our app migrations are also disabled
}
```

#### Database Schema:
- SQL files are located in: `farm_app/farm/init_db.sql`
- Database is initialized via: `docker-entrypoint-initdb.d/` directory
- MySQL 8.0 is used (configured in `docker-compose.prod.yml`)
- Schema documentation: `SCHEMA.md` (reference for current tables and maintenance)

#### When you need to change the schema:
1. Edit `farm_app/farm/init_db.sql` directly
2. Update Django models to match the SQL schema
3. Manually apply the SQL changes to the database
4. **DO NOT** run `python manage.py makemigrations`
5. **DO NOT** run `python manage.py migrate`

#### Current Models (managed via SQL):
- Account
- AnnualCrop
- Crop
- Field
- Farm
- Transaction
- TransactionObject
- TransactionAttachment
- TransactionAnnualCrop

---

### 2. GitHub Actions CI/CD Pipeline

#### Build Workflow (`.github/workflows/build.yml`)
- Triggers on: `push to main`, `workflow_dispatch`
- Builds Docker images:
  - `ghcr.io/leviabowles/farm-db-web` (Django backend)
  - `ghcr.io/leviabowles/farm-db-frontend` (React frontend)
- Pushes images to GitHub Container Registry (GHCR)
- Triggers deployment workflow

#### Deploy Workflow (`.github/workflows/deploy.yml`)
- Triggers on: `push to main`, `workflow_dispatch`, or after build completion
- Runs on: self-hosted runner (home server)
- Steps:
  1. Checkout code
  2. Create `.env` file from GitHub Secrets
  3. Login to GHCR
  4. Stop existing containers (`docker compose down`)
  5. Pull latest images
  6. Restart services (`docker compose up -d --force-recreate`)
  7. Clean up old images

#### Environment Variables (set in GitHub Secrets):
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host (172.17.0.1 for Docker bridge to host MySQL)
- `REACT_APP_API_URL` - Frontend API endpoint

---

#### Production Deployment Architecture

**Docker Containers (on self-hosted server):**
1. **Django Web App** (`farm-db-web-prod`)
   - Image: `ghcr.io/leviabowles/farm-db-web:latest`
   - Port: `8800:8000`
   - Connects to MySQL at `172.17.0.1:3306` (host machine)
   - Purpose: API backend serving Django REST Framework endpoints

2. **React Frontend** (`farm-db-frontend-prod`)
   - Image: `ghcr.io/leviabowles/farm-db-frontend:latest`
   - Ports: `8300:80`, `8888:80`
   - Connects to API at `http://172.17.0.1:8800/farms`
   - Purpose: User interface served via Nginx

**MySQL Database:**
- Runs **directly on the host machine** (not in Docker)
- Port: `3306`
- Connection: Django connects via `172.17.0.1` (Docker bridge IP)
- Database: `farmdb`
- Why not in Docker? Direct installation for easier backup, monitoring, and database management

**Development Environment** (local machine):
- All services run in Docker Compose (`docker-compose.yml`)
- MySQL runs in container (`farm-db-mysql-local:3306`)
- Easy to start/stop: `docker-compose up -d`

---

## Project Structure

```
farm-db/
├── .github/workflows/        # GitHub Actions CI/CD
│   ├── build.yml            # Builds and pushes Docker images
│   └── deploy.yml           # Deploys to self-hosted server
├── farm_app/                # Django backend application
│   ├── Dockerfile           # Backend Docker build
│   ├── farm/                # Django project
│   │   ├── __init__.py
│   │   ├── settings.py      # Settings (manually managed SQL)
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── farms/               # Django app
│   │   ├── models.py        # Models (must match SQL schema)
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── migrations/      # Empty (SQL-only)
│   └── init_db.sql          # Manual SQL schema (exported via mysqldump)
├── react-frontend/          # React frontend
│   ├── Dockerfile           # Frontend Docker build
│   └── src/
├── docker-compose.prod.yml # Production deployment config
├── requirements.txt         # Python dependencies
└── AGENTS.md               # This file
```

---

## Environment Setup

### Development (with Docker)

```bash
# Start MySQL database
docker-compose up -d mysql

# Set environment variables
export DB=farmdb
export DBUSER=farm_user
export DBPW=farm_password
export DBHOST=localhost

# Run Django server
cd farm_app/farm
python manage.py runserver
```

### Production Deployment

Production is deployed automatically via GitHub Actions. The workflow:
1. Builds images on GitHub Actions runners
2. Pushes to GHCR
3. Self-hosted runner pulls and deploys

---

## Adding New Models

### Step 1: Create SQL Schema
Add the table definition to `farm_app/farm/init_db.sql`:

```sql
CREATE TABLE `farms_newmodel` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `field1` varchar(255) NOT NULL,
  `field2` decimal(10,2),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 2: Create Django Model
Add the model to `farm_app/farm/farms/models.py`:

```python
class NewModel(models.Model):
    field1 = models.CharField(max_length=255)
    field2 = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False  # Important: Django doesn't manage this
        db_table = 'farms_newmodel'
```

### Step 3: Apply Changes
Manually run the SQL on the database server (or in dev, run it locally).

---

## API Endpoints

### Backend API (Django REST Framework)
- `/api/transactions/` - Transaction CRUD
- `/api/fields/` - Field CRUD
- `/api/annualcrops/` - AnnualCrop CRUD
- `/api/farms/` - Farm CRUD
- `/api-token-auth/` - Token authentication

### Frontend API
- React app at port 8300
- Connects to backend at: `http://172.17.0.1:8800/farms`

---

## Testing

### Run Tests (Development)
```bash
cd farm_app/farm
python manage.py test
```

### Run Tests (Docker)
```bash
docker-compose exec web python manage.py test
```

---

## Troubleshooting

### Database Connection Issues
- Check MySQL container is running: `docker ps | grep mysql`
- Verify environment variables are set correctly
- Ensure DB_HOST is correct (172.17.0.1 for Docker bridge)

### Migration Errors
- **DO NOT run migrations** - this project uses manual SQL
- If you see migration errors, check `MIGRATION_MODULES` in settings.py

### Build Issues
- Check GitHub Actions workflow logs
- Verify Dockerfiles are building correctly
- Ensure all required environment variables are set in GitHub Secrets

### Deployment Failures
- Check self-hosted runner status
- Verify GHCR token has pull access
- Check Docker Compose logs: `docker-compose -f docker-compose.prod.yml logs`

---

## Development Guidelines

1. **Never run `makemigrations`** - schema is manually managed
2. **Models must match SQL** - keep them in sync
3. **Test locally first** - use Docker for local development
4. **Use GitHub Actions for production** - don't deploy manually
5. **Backup database** - SQL files are the source of truth

---

## Quick Start for New Agents

1. Read this file completely
2. Understand the manual SQL approach (no migrations)
3. Review the GitHub Actions workflows
4. Check `farm_app/farm/init_db.sql` for schema
5. Check `SCHEMA.md` for detailed schema documentation
6. Check `farm_app/farm/farms/models.py` for Django models
7. Ensure models match SQL schema exactly
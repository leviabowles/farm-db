"""
Local development settings for farm project.
"""

from .settings import *

# Database configuration for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB', 'farmdb'),
        'USER': os.getenv('DBUSER', 'farm_user'),
        'PASSWORD': os.getenv('DBPW', 'farm_password'),
        'HOST': os.getenv('DBHOST', '127.0.0.1'),
        'PORT': '3306',
    }
}

# Allow all hosts for local development
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0']

# For local development, set a secret key (in production, this should be in environment)
SECRET_KEY = 'django-insecure-local-secret-key-for-development-only'

# Enable debug mode
DEBUG = True

# Add CORS for local React development if needed
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
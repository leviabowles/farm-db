#!/usr/bin/env python3.15
"""
Run Django tests for the farm-db application.
"""
import os
import sys
import django
from pathlib import Path

# Add the project to the path
sys.path.insert(0, str(Path(__file__).parent / 'farm_app' / 'farm'))

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farm.settings')
os.environ.setdefault('DATABASE_URL', 'sqlite:///farms_test.db')

# Setup Django
django.setup()

# Now run the tests
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    print("Running Django tests for farms app...")
    print("=" * 60)
    execute_from_command_line([
        'manage.py',
        'test',
        'farms',
        '--settings=farm.settings',
        '--keepdb',
    ])
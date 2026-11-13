#!/bin/bash

# Script to setup test database with all necessary tables
# This runs migrations and creates tables for managed=False models

echo "Running migrations..."
DJANGO_SETTINGS_TEST=1 /Users/levibowles/lbcode/farm-db/.venv-new/bin/python /Users/levibowles/lbcode/farm-db/farm_app/farm/manage.py migrate

echo ""
echo "Creating managed=False tables..."
python3 << 'PYTHON_SCRIPT'
import sqlite3

db_path = "/Users/levibowles/lbcode/farm-db/farm_app/farms_test.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create transaction_object table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS transaction_object (
        id INTEGER PRIMARY KEY,
        object_name VARCHAR(255),
        object_type VARCHAR(100)
    )
""")

# Create field_year_crop table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_year_crop (
        id INTEGER PRIMARY KEY,
        year_key INTEGER,
        acres_planted DECIMAL(10,2),
        total_bushels DECIMAL(10,2),
        create_date DATETIME,
        update_date DATETIME
    )
""")

# Create vendor table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendor (
        id INTEGER PRIMARY KEY,
        vendor_name VARCHAR(10),
        create_date DATETIME,
        update_date DATETIME
    )
""")

# Create field_year_transaction_crop table (needed for Transaction line_items)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_year_transaction_crop (
        id INTEGER PRIMARY KEY,
        transaction_id INTEGER,
        crop_id INTEGER,
        acres_planted DECIMAL(10,2),
        bushels_per_acre DECIMAL(10,2)
    )
""")

conn.commit()
conn.close()

print("Tables created successfully!")
PYTHON_SCRIPT

echo ""
echo "Test database setup complete!"
echo "Running TransactionLineItem CRUD tests..."
DJANGO_SETTINGS_TEST=1 /Users/levibowles/lbcode/farm-db/.venv-new/bin/python /Users/levibowles/lbcode/farm-db/farm_app/farm/manage.py test farms.tests_transaction_crud.SimpleTransactionCRUDTests
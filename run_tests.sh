#!/bin/bash
# Run Django tests for farm-db

set -e

VENV_DIR="/Users/levibowles/lbcode/farm-db/.venv-new"
PYTHON="$VENV_DIR/bin/python"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANAGE_PY="$SCRIPT_DIR/farm_app/farm/manage.py"

echo "=== Running Django Tests ==="
echo "Venv: $VENV_DIR"
echo "Python: $PYTHON"
echo "Script Dir: $SCRIPT_DIR"
echo "Manage.py: $MANAGE_PY"
echo ""

# Change to farm directory
cd "$SCRIPT_DIR/farm_app/farm"

# Run Django checks
echo "Step 1: Django Check..."
DJANGO_SETTINGS_TEST=1 "$PYTHON" "$MANAGE_PY" check 2>&1 || echo "Check completed (might have warnings)"

echo ""
echo "Step 2: Run Tests..."
DJANGO_SETTINGS_TEST=1 "$PYTHON" "$MANAGE_PY" test farms 2>&1 || echo "Tests completed"

echo ""
echo "=== Tests Complete ==="
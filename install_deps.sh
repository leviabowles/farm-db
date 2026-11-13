#!/bin/bash
VENV_DIR="/Users/levibowles/lbcode/farm-db/.venv-new"
PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"

echo "Installing missing dependencies..."
"$PIP" install django-jazzmin==2.6.2
"$PIP" install django-tables2==2.4.1
"$PIP" install django-cors-headers==3.13.0 2>&1 | tail -5

echo "Done!"
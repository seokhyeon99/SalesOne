#!/bin/bash

# Set the current directory to the script directory
cd "$(dirname "$0")/../../../"

# Activate the virtual environment
source venv/bin/activate

# Run the workflow tests with verbosity
python manage.py test apps.workflows.tests --verbosity=2 
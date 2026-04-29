#!/bin/bash
# Backend Setup Script

echo "=== Hotel Booking - Backend Setup ==="

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
if [ ! -f .env ]; then
  cat > .env << EOF
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
DB_NAME=hotel_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
EOF
  echo ".env file created"
fi

# Run migrations
python manage.py makemigrations hotel_app
python manage.py migrate

# Seed data
python manage.py seed_data

echo ""
echo "=== Setup Complete! ==="
echo "Admin credentials: admin / admin123"
echo "Start server: python manage.py runserver"
echo "Or with WebSockets: daphne hotel_project.asgi:application"

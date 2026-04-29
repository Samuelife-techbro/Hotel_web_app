# 🏨 Lumière Hotel Booking System

A full-stack hotel booking application built with **Django + React**.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Backend | Django 4.2 + Django REST Framework + SimpleJWT |
| Database | PostgreSQL |
| Real-time | Django Channels + WebSockets |
| Charts | Recharts |

---

## Project Structure

```
hotel-booking/
├── backend/                    # Django backend
│   ├── hotel_project/          # Project settings, URLs, ASGI
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── asgi.py
│   ├── hotel_app/              # Main app
│   │   ├── models.py           # Room, Booking, Inventory, Notification
│   │   ├── views.py            # All ViewSets + exports + stats
│   │   ├── serializers.py
│   │   ├── urls.py             # REST + JWT endpoints
│   │   ├── filters.py
│   │   ├── consumers.py        # WebSocket consumer
│   │   ├── tasks.py            # WS notification broadcaster
│   │   └── management/commands/seed_data.py
│   ├── requirements.txt
│   └── setup.sh
│
└── frontend/                   # React frontend
    ├── src/
    │   ├── pages/
    │   │   ├── customer/       # HomePage, Rooms, Booking, Confirmation
    │   │   └── admin/          # Dashboard, Bookings, Rooms, Inventory, Reports, Notifications
    │   ├── components/
    │   │   ├── shared/         # Navbar
    │   │   └── admin/          # AdminLayout (sidebar)
    │   ├── contexts/           # AuthContext, NotificationContext (WebSocket)
    │   ├── services/           # api.ts (Axios)
    │   └── types/              # TypeScript interfaces
    ├── package.json
    └── tailwind.config.js
```

---

## Quick Start

### 1. Database Setup (PostgreSQL)

```bash
createdb hotel_db
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env      # Edit DB credentials as needed

# Migrate + seed
python manage.py makemigrations hotel_app
python manage.py migrate
python manage.py seed_data

# Start server (with WebSocket support)
daphne hotel_project.asgi:application
# or for development:
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | JWT login |
| POST | `/api/auth/refresh/` | Refresh token |
| GET | `/api/auth/me/` | Current user |
| GET | `/api/rooms/` | List rooms (public) |
| GET | `/api/rooms/available_rooms/` | Available rooms for dates |
| POST | `/api/rooms/` | Create room (admin) |
| PATCH | `/api/rooms/{id}/` | Update room (admin) |
| DELETE | `/api/rooms/{id}/` | Delete room (admin) |
| GET | `/api/bookings/` | List bookings (admin) |
| POST | `/api/bookings/` | Create booking (public) |
| PATCH | `/api/bookings/{id}/update_status/` | Update booking status |
| GET | `/api/bookings/export_csv/` | Export bookings CSV |
| GET | `/api/bookings/stats/` | Booking statistics |
| GET | `/api/inventory/items/` | List inventory |
| POST | `/api/inventory/items/` | Add item |
| GET | `/api/inventory/items/export_csv/` | Export inventory CSV |
| GET | `/api/notifications/` | List notifications |
| POST | `/api/notifications/mark_all_read/` | Mark all read |
| GET | `/api/dashboard/stats/` | Dashboard statistics |
| WS | `ws://host/ws/notifications/` | Real-time notifications |

---

## Default Credentials

```
Admin:    admin / admin123
```

---

## Features

### Customer Side
- Browse rooms with images, descriptions, prices
- Filter by category, price range, capacity
- Date availability search
- Booking form with validation
- Booking confirmation page

### Admin Dashboard
- JWT authentication
- Real-time WebSocket notifications on new bookings
- Dashboard with revenue charts and stats
- Full booking management with status updates
- Room CRUD (add/edit/delete/toggle availability)
- Inventory tracking with low-stock alerts
- Reports with charts (daily/weekly/monthly)
- CSV export for bookings and inventory

---

## Environment Variables

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=hotel_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
```

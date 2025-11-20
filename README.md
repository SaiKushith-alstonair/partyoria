# PartyOria - Unified Event Management Platform

Complete event creation and vendor management system with React frontend and Django backend.

## Quick Start

### One-Command Development Setup

```bash
# Start both frontend and backend
start-dev.bat
```

This will start:
- **Backend**: http://localhost:8000 (Django API)
- **Frontend**: http://localhost:3000 (Customer Portal)
- **Vendor Portal**: http://localhost:3000/vendor

### Manual Setup

#### Backend
```bash
cd backend
start-backend.bat
```

#### Frontend
```bash
cd frontend
start-frontend.bat
```

## Features

### Customer Portal
- 106+ event types across 11 categories
- Dynamic vendor selection
- Budget management
- Real-time chat
- RSVP management

### Vendor Portal
- Vendor registration & verification
- Service management
- Booking management
- Analytics dashboard
- Customer communication

## API Endpoints

### Customer APIs
- `/api/` - Event management
- `/api/auth/` - Authentication
- `/chat/` - Real-time messaging

### Vendor APIs
- `/api/vendor/` - Vendor management
- `/api/vendor/auth/` - Vendor authentication
- `/api/vendor/bookings/` - Booking management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Django 4.2 + DRF + PostgreSQL
- **Real-time**: Socket.IO + Django Channels
- **Authentication**: JWT + Token-based auth

## Database Setup

Ensure PostgreSQL is running with:
- Database: `partyoria_db`
- User: `postgres`
- Password: `1234`
- Host: `localhost`
- Port: `5432`
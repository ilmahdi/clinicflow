# ClinicFlow — Patient & Appointment Management System

ClinicFlow is a modern, production-grade reference architecture for a PERN-stack (PostgreSQL, Express 5, React 19, Node.js) internal web application designed for medical clinics to manage patient records, schedule conflict-free appointments, enforce role-based access control, and track clinical KPIs.

---

## Features

- **Patient Records**: Centralized patient profiles with unique National ID (CIN) validation, full-text search, and admin-only soft deletion.
- **30-Minute Conflict Engine**: Concurrency-safe scheduling that prevents overlapping confirmed appointments for any patient within a $\pm 30$-minute window using PostgreSQL row-level locks (`FOR UPDATE`).
- **Role-Based Access Control**: Separate privileges for Administrators (full access, patient deletion) and Staff (records creation and scheduling).
- **Security-First Authentication**: JWT authentication with tokens stored in secure `HttpOnly`, `SameSite=Strict` cookies to mitigate XSS attacks, plus fallback Bearer header support for API consumers.
- **Real-Time Clinic Dashboard**: Key metrics for active patients, daily consultations, and appointment status distribution.
- **Interactive API Documentation**: Embedded OpenAPI 3.0 Swagger UI console.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, React Router |
| **Backend** | Node.js (ES Modules), Express 5, PostgreSQL (`pg`), Zod, JWT, bcryptjs |
| **Database** | PostgreSQL 16 with UUID primary keys (`pgcrypto`) |
| **DevOps** | Docker, Docker Compose, Makefile |

---

## Quickstart

### Prerequisites
- [Docker](https://www.docker.com/) (v20.10+) and Docker Compose (v2+)
- `make` (Unix build tool)

> All application runtime dependencies, database migrations, tests, and linting run strictly inside Docker containers. No local Node.js or PostgreSQL installation required.

### 1. Clone & Start (Development Mode)

```bash
git clone https://github.com/ilmahdi/clinicflow.git
cd clinicflow

# Start all services in development mode (hot reloading enabled)
make up
```

Service URLs:
- **Frontend Application**: [http://localhost:1313](http://localhost:1313)
- **Backend API**: [http://localhost:1314](http://localhost:1314)
- **Swagger API Docs**: [http://localhost:1314/api/docs](http://localhost:1314/api/docs)
- **API Health Check**: [http://localhost:1314/health](http://localhost:1314/health)

### 2. Start (Production Mode)

```bash
# Build and run optimized production containers
make up-build-prod

# Or start existing production builds
make up-prod
```

### 3. Testing & Quality Checks

```bash
make test-back    # Run backend test suite (Jest + Supertest)
make lint-front   # Run frontend linter (Oxlint)
make build-front  # Run frontend production build validation
```

---

## Demo Accounts

Pre-seeded accounts are ready for testing (quick-fill buttons are also available on the login page):

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Admin Director | `admin@clinicflow.local` | `Admin123!` | Full access + Patient deletion |
| **Staff** | Dr. Sarah Smith | `dr.sarah@clinicflow.local` | `Staff123!` | View, create, and edit records & appointments |
| **Staff** | Nurse John Doe | `nurse.john@clinicflow.local` | `Staff123!` | View, create, and edit records & appointments |

---

## Project Structure

```
├── back/
│   ├── postgres-init/     # Database schema and seed SQL
│   ├── src/
│   │   ├── controllers/   # Request/response handlers
│   │   ├── docs/          # OpenAPI/Swagger specification
│   │   ├── middlewares/   # Auth, validation, error handling
│   │   ├── repositories/  # Parameterized SQL database queries
│   │   ├── routes/        # Express API endpoints
│   │   └── services/      # Business logic & concurrency rules
│   ├── tests/             # Jest + Supertest suites
│   ├── Dockerfile
│   └── docker_entry.sh    # Dev/Prod backend entrypoint
├── front/
│   ├── src/
│   │   ├── components/    # Reusable UI component library
│   │   ├── context/       # Auth state (HttpOnly cookie sessions)
│   │   ├── layouts/       # App layout & route guards
│   │   ├── pages/         # Dashboard, Patients, Appointments, Login
│   │   └── services/      # API client services
│   ├── Dockerfile
│   └── docker_entry.sh    # Dev/Prod frontend entrypoint
├── docker-compose.yml     # Container orchestration
└── Makefile               # Development and production commands
```

---

## Key API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & set secure HttpOnly cookie |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session & clear auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/patients` | Authenticated | Paginated patient list with search (`?search=&page=&limit=`) |
| `POST` | `/api/patients` | Authenticated | Register new patient |
| `GET` | `/api/patients/:id` | Authenticated | Patient details with consultation history |
| `PUT` | `/api/patients/:id` | Authenticated | Update patient record |
| `DELETE`| `/api/patients/:id` | Admin Only | Soft-delete patient record |
| `GET` | `/api/appointments` | Authenticated | List appointments with filters (`?date=&status=`) |
| `POST` | `/api/appointments` | Authenticated | Schedule appointment (30-min conflict check) |
| `PATCH`| `/api/appointments/:id/status` | Authenticated | Update status (`pending`, `confirmed`, `cancelled`) |
| `GET` | `/api/dashboard/stats` | Authenticated | Clinic KPIs (total patients, today's visits, statuses) |

Full schemas and interactive testing are available at [http://localhost:1314/api/docs](http://localhost:1314/api/docs).
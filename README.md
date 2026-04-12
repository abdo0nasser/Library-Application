# 📚 Personal Library & Lending API

A robust, scalable, and secure RESTful API built with **NestJS**, **Prisma**, and **PostgreSQL**. Designed to manage a personal library where users can list books, borrow them for specific durations, and track lending history.

---

## 🚀 Features

- **🔐 Authentication & Security**:
  - Secure Signup, Login, and Password Reset cycles.
  - **HttpOnly Cookie Authentication**: JWT access tokens protected from XSS via secure cookies.
  - **Social Logins**: Facebook OAuth integration.
  - Email Verification via Nodemailer.
  - **Role-Based Access Control (RBAC)**: `ADMIN` and `NORMAL` user roles.
  - IDOR protection with ownership verification.

- **📖 Book Management**:
  - Full CRUD operations for books.
  - Atomic borrowing logic (concurrency safe).
  - Tracking available vs. total copies.

- **🤝 Lending System**:
  - Borrowing books with custom "days to return".
  - Automated late-return detection.
  - Comprehensive borrowing history.

- **🛠 Technical Excellence**:
  - **Caching & Rate Limiting**: Redis + `@nestjs/throttler`.
  - **Global Response Format**: Standardized JSON responses via `TransformInterceptor`.
  - **Database Exception Handling**: Prisma filter translates DB errors to HTTP codes.
  - **File Uploads**: Profile pictures via Multer.
  - **Pagination**: Deep-metadata pagination (total pages, cursor, bounds).

---

## ⚙️ Tech Stack

| Category     | Technology                                                                              |
| ------------ | --------------------------------------------------------------------------------------- |
| Framework    | [NestJS](https://nestjs.com/)                                                           |
| Language     | [TypeScript](https://www.typescriptlang.org/)                                           |
| Database     | [PostgreSQL](https://www.postgresql.org/)                                               |
| ORM          | [Prisma](https://www.prisma.io/)                                                        |
| Cache/Broker | [Redis](https://redis.io/)                                                              |
| Auth         | [JWT](https://github.com/nestjs/jwt), [Argon2](https://github.com/ranisalt/node-argon2) |
| Mailing      | [Nodemailer](https://nodemailer.com/)                                                   |
| Queue        | [BullMQ](https://docs.bullmq.io/)                                                       |

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/personal-library-api.git
cd personal-library-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend Configuration
BACKEND_PORT=3000
API_PREFIX=api
DOMAIN=http://localhost:${BACKEND_PORT}
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=library_db
DB_EXTERNAL_PORT=5432
DB_URL=postgresql://postgres:postgres@postgres:5432/library_db

# Redis & Caching
REDIS_THROTTLER=redis://redis-broker:6379
CACHE_URL=redis://redis-cache:6379
BROKER_HOST=redis-broker
BROKER_PORT=6379
REDIS_TTL=86400000

# JWT
JWT_SECRET=super-secret-key-change-me
JWT_EXPIRATION_TIME=1h

# Throttler
THROTTLE_TTL=60
THROTTLE_LIMIT=30

# Facebook ID
APP_ID=your-facebook-app-id
APP_SECRET=your-facebook-app-secret
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

---

## 🛰️ Running the Project

### Local Development

```bash
# Start in watch mode
npm run start:dev
```

### Docker (Recommended for Development)

```bash
# Start all services with healthchecks
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Production Build

```bash
# Build the application
npm run build

# Run production build
npm run start:prod
```

---

## 🐳 Docker Architecture

```
┌─────────────────┐     ┌─────────────┐
│   nest-server   │────▶│  PostgreSQL │
│   (NestJS)      │     └─────────────┘
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌────────┐
│ Redis │ │ Redis  │
│ Cache │ │ Broker │
└───────┘ └────────┘
```

### Services

| Service        | Port | Description   |
| -------------- | ---- | ------------- |
| `nest-server`  | 3000 | API server    |
| `postgres`     | 5432 | Database      |
| `redis-cache`  | 6379 | Caching layer |
| `redis-broker` | 6379 | Queue broker  |

---

## 📚 API Documentation

Once running, visit:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/health`

---

## ⚡ CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:

- Every push to any branch
- Pull requests to `master`

Pipeline steps:

1. Checkout code
2. Setup Node.js 22
3. Install dependencies
4. Generate Prisma client
5. Build project
6. Run Docker Compose with healthchecks
7. Verify containers are healthy

---

## 📁 Project Structure

```
src/
├── main.ts                     # Application entry point
├── app.module.ts               # Root module
├── health/                    # Health check endpoint
├── modules/
│   ├── user/
│   │   ├── auth/              # Authentication (login, register, OAuth)
│   │   └── dto/               # User DTOs
│   ├── book/
│   │   ├── borrow_book/       # Lending/borrowing logic
│   │   └── dto/               # Book DTOs
│   ├── prisma/               # Database service
│   ├── worker/               # Background jobs
│   ├── logger/               # Logging service
│   └── mail/                 # Email service
├── guards/                   # Auth & role guards
├── interceptors/             # Response transform, logging
├── decorators/               # Custom decorators
├── filters/                  # Exception filters
└── utils/                    # Helpers, configs
├── prisma/                   # Database schema
├── docker-compose.yml        # Docker services
├── Dockerfile               # Container image
└── .github/workflows/       # CI/CD pipelines
```

---

## ⚠️ Production Considerations

Before deploying to production:

1. **Secrets Management**: Use Docker secrets or external secrets manager
2. **Database Migrations**: Implement proper migration strategy
3. **Environment Variables**: Use production values (not `.env.example`)
4. **HTTPS/TLS**: Configure SSL termination
5. **Backup Strategy**: Set up database backups

---

## 📄 License

This project is [UNLICENSED](LICENSE).

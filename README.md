# 📚 Personal Library & Lending API

A robust, scalable, and secure RESTful API built with **NestJS**, **Prisma**, and **PostgreSQL**. Designed to manage a personal library where users can list books, borrow them for specific durations, and track lending history.

---

## 🚀 Features

- **🔐 Authentication & Security**:
  - Secure Signup, Login, and Password Reset cycles.
  - **HttpOnly Cookie Authentication**: JWT access tokens are fundamentally protected from XSS attacks by relying exclusively on secure cookies.
  - **Social Logins**: Seamless integration with **Facebook OAuth** natively binding to the local database.
  - Complete robust Email Verification process using Nodemailer.
  - **Role-Based Access Control (RBAC)**: Distinct permissions for `ADMIN` and `NORMAL` users.
  - Ownership verification for sensitive operations (IDOR protection).

- **📖 Book Management**:
  - Full CRUD operations for books.
  - Sophisticated borrowing logic with atomic inventory updates (concurrency safe).
  - Tracking available vs. total copies.

- **🤝 Lending System**:
  - Borrowing books with custom "days to return".
  - Return system with automated late-return detection.
  - Comprehensive borrowing history for both users and individual books.

- **🛠 Technical Excellence**:
  - **Caching & Rate Limiting**: Performance optimized and secured using **Redis** and `@nestjs/throttler`.
  - **Unified Response Architectures**: Global `TransformInterceptor` cleanly packages standard returns, stripping presentation layers from services.
  - **Intelligent Database Exceptions**: Global Prisma Filter translates database exceptions (e.g. Missing records or constraints) transparently into native HTTP codes over 500s.
  - **Strong Type Safety**: All layers enforce rigorous `PaginatedResult` abstractions mapped perfectly against Prisma generated payloads.
  - **File Uploads**: Profile picture support via Multer.
  - **Pagination**: Computed deep-metadata (total pages, current cursor, bounds checking) returned natively for large lists.

---

## ⚙️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Cache**: [Redis](https://redis.io/)
- **Auth**: [JWT](https://github.com/nestjs/jwt), [Argon2](https://github.com/ranisalt/node-argon2)
- **Mailing**: [Nodemailer](https://nodemailer.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/personal-library-api.git
cd personal-library-api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/library_db"
JWT_SECRET="your_secret_key"
JWT_EXPIRATION_TIME="1d"
REDIS_URL="redis://localhost:6379"
REDIS_TTL=3600
MAIL_HOST="smtp.example.com"
MAIL_USER="your-email@example.com"
MAIL_PASS="your-password"
```

### 4. Database Setup

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

---

## 🛰️ Running the Project

```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

## 📚 Documentation

- **Swagger UI**: Interactive API documentation structurally available at `http://localhost:3000/api/docs`.
- **Global Pipes & Serialization**: All routes are protected with `ValidationPipe` (whitelist and transform enabled) and standardized JSON output via global Interceptors.
- **Static Files**: Uploaded profile pictures are served via `/uploads/`.

## 📄 License

This project is [UNLICENSED](LICENSE).

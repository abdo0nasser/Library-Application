# Personal Library & Lending Monorepo

This is a monorepo containing the backend API and frontend application for the Personal Library & Lending system.

## Structure

- `backend/`: NestJS API server
- `frontend/`: React frontend application

## Development

To run both backend and frontend in development mode:

```bash
npm run dev
```

This will start the backend on port 3000 and frontend on port 5173.

## Building

To build both:

```bash
npm run build
```

## Docker

To run with Docker:

```bash
docker-compose up --build
```

## Workspaces

This project uses npm workspaces for managing dependencies.
# Event Management App

A full-stack event management application built with Elysia.js, Bun, and PostgreSQL.

## Features

- 🔐 User Authentication & Authorization
- 👥 Role-based Access (Admin, Organizer, Attendee)
- 📅 Event Management & RSVP System
- 🔔 Real-time Notifications
- 🎨 Modern Responsive UI
  > event-management-app@1.0.0 dev
  > bun --watch src/index.ts

## Tech Stack

- **Backend:** Elysia.js, Bun, Prisma ORM
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Database:** PostgreSQL (Neon)
- **Deployment:** Render

## Local Development

1. Clone the repository
2. Install dependencies: `bun install`
3. Setup database: `npx prisma db push`
4. Start development server: `npm run dev`
5. Open http://localhost:3000

## API Documentation

API documentation is available at the `/docs` endpoint when the server is running. You can access it at [http://localhost:3000/docs](http://localhost:3000/docs).

## Deployment

This application is designed for deployment on [Render](https://render.com/) with a [Neon](https://neon.tech/) PostgreSQL database.

### Neon Database Setup

1. Create a new project on Neon.
2. Retrieve the connection string (specifically the pooled connection string) for your database.
3. This string will be used as the `DATABASE_URL` environment variable.

### Render Deployment

1. Fork this repository.
2. On the Render dashboard, create a new "Web Service".
3. Connect your forked repository.
4. Configure the service with the following settings:
   - **Environment**: `Bun`
   - **Build Command**: `bun install && npx prisma generate && npx prisma migrate deploy && npm run db:seed`
   - **Start Command**: `npm start`
5. Add the following environment variables:
   - `DATABASE_URL`: The pooled connection string from your Neon database.
   - `ADMIN_EMAIL`: The email for the default admin user.
   - `ADMIN_PASSWORD`: The password for the default admin user.
   - `JWT_SECRET`: A secure, random string for signing JWTs.
6. Deploy the service. Your application will be live at the URL provided by Render.

## Design Principles

This application's architecture is an evolution of a previous event management system, incorporating key software design principles to ensure scalability, maintainability, and efficiency.

### Singleton Pattern for Database Connection

A notable example of this is the use of the singleton pattern for the `PrismaClient`. In `src/index.ts`, a single instance of the Prisma client is created and shared across the entire application. This approach ensures that a single, efficient connection pool is used to communicate with the database, preventing resource exhaustion and improving performance under load. This is a critical design choice for any database-driven application.

=========================================
🚀 Event Management App - FULL STACK READY!
📍 Frontend: http://localhost:3000
📚 API Docs: http://localhost:3000/docs
❤️ Health: http://localhost:3000/health
server: http://localhost:4000
✅ FEATURES:
🔐 Authentication & JWT
📅 Event Management (Admin/Organizer/Attendee)
✅ RSVP System
🔔 Real-time Notifications
🎨 Modern Frontend UI

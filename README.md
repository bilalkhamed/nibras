# Nibras

Nibras is a comprehensive educational management platform designed to streamline the administration of cohorts, groups, and student learning paths. It serves as a central hub for students, supervisors, and administrators to track progress, manage assignments, and facilitate communication within an educational program.

## Overview

The application is built to support a hierarchical educational structure where students are organized into groups within cohorts. It allows for:

- **Student Tracking**: Monitoring student progress through assignments and levels.
- **Group Management**: Supervisors can manage their assigned student groups.
- **Content Delivery**: Delivery of various assignment types (lectures, readings, quizzes) and articles.
- **Role-Based Access**: Granular permissions to ensure users only access what they need.

## Domain Concepts

To understand the codebase, it's essential to be familiar with the following domain concepts:

- **Program**: An educational curriculum or course of study. Programs can be marked as "Supervisor Only" for staff training.
- **Cohort**: A group of students each year with a defined start and end date (e.g., "Class of 2024").
  - Cohorts transition through **Levels**.
- **Group**: A subset of students within a Cohort.
  - Managed by **Supervisors** (mentors) and **Group Managers**.
- **Level**: A stage of progress within a Program (e.g., "Level 1", "Level 2").
- **Week**: Time units within the curriculum.
  - **CalendarWeek**: Maps a curriculum week to specific dates in a year.
- **Assignment**: Educational tasks linked to a Program, Week, and Level.
  - Types: `Lecture`, `Exercise`, `Quiz`, `Reading`.
  - Supports text and file submissions.
- **Article**: Content published by the Media Team (news, resources).
- **Invite**: System for registering new users via unique, validating codes.

## User Roles

The application uses a role-based permission system (`Role` enum in Prisma):

1.  **Admin**: Full system access. Can manage all cohorts, users, and settings.
2.  **Cohort Manager**: Manages specific cohorts and the groups/students within them.
3.  **Group Manager**: Manages specific groups.
4.  **Supervisor**: Responsible for mentoring a specific group of students.
5.  **Student**: The end learner. Accesses assignments and tracks their own progress.
6.  **Media Team**: Can create and publish Articles.

## Tech Stack

### Frontend & Backend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI based), Lucide Icons
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns

### Database & Storage

- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **File Storage**: AWS S3 (using `@aws-sdk/client-s3`) - Used for assignment attachments and media.

### Authentication & Security

- **Auth**: Custom JWT-based authentication stored in HTTP-only cookies.
- **Session**: Server-side session validation.
- **Hashing**: bcrypt for passwords.

## Architecture

The application follows a **Feature-Based Architecture** where each domain (e.g., `groups`, `users`) is self-contained in `src/features/`. Within each feature, we enforce a strict separation of concerns using a Data Access Layer (DAL) and a Service Layer.

### 1. Data Access Layer (DAL)

- **Purpose**: specialized for **pure database interactions**. It should **never** contain business logic or authentication checks.
- **Location**: `src/features/<feature>/dal/`
- **Structure**: Split into `queries.ts` (reads) and `mutations.ts` (writes).
- **Helper**: All functions are wrapped in `runDalOperation` to handle database errors uniformly.
- **Return Type**: `DalReturn<T>`
  - **Success**: `{ success: true, data: T }`
  - **Failure**: `{ success: false, error: DalErrorType }`
    - `DalErrorType` can be specific (e.g., `no-user` if database user not found) or generic (e.g., `prisma-client` error).

### 2. Service Layer

- **Purpose**: specific for **business logic** and **authorization/permissions**. It consumes the DAL.
- **Location**: `src/features/<feature>/service/`
- **Structure**: Split into `queries.ts` and `mutations.ts`.
- **Helper**: All functions are wrapped in `runServiceOperation` which provides a secure `session` context.
- **Return Type**: `ServiceReturn<T>`
  - **Success**: `{ success: true, data: T }`
  - **Failure**: `{ success: false, error: ServiceErrorType }`
    - `ServiceErrorType` includes an HTTP status code (e.g., `{ type: 'forbidden', statusCode: 403 }`) to easily map to API responses.

### 3. Entry Points

- **Server Actions**: The UI calls Server Actions (in `src/features/<feature>/actions/`), which in turn call the Service Layer.
- **API Routes**: API endpoints call the Service Layer directly.
- **Server Components**: For data fetching in Server Components, we call the Service Layer directly.

## Project Structure

The project follows a feature-based architecture for better scalability:

```
src/
├── app/                 # Next.js App Router pages and API routes
├── components/          # Shared/Global UI components (buttons, inputs, etc.)
├── features/            # Feature-specific modules
│   ├── articles/
│   ├── assignments/
│   ├── cohorts/
│   ├── groups/
│   ├── programs/
│   └── users/
├── hooks/               # Global custom hooks
├── lib/                 # Shared utilities and core logic
│   ├── server/          # Server-side specific code (Auth, DAL, S3)
│   ├── permissions/     # Role and permission logic
│   └── shared/          # Shared utilities
└── types/               # Global TypeScript type definitions
```

## Environment Setup

Duplicate `.env.example` (if available) or create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
SESSION_SECRET="..."
HMAC_SECRET="..."

# AWS S3 (Private Bucket - Assignments/User Data)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="auto"
AWS_ENDPOINT_URL_S3="..."
S3_BUCKET_NAME="..."

# AWS S3 (Public Bucket - Articles/Assets)
PUBLIC_AWS_ACCESS_KEY_ID="..."
PUBLIC_AWS_SECRET_ACCESS_KEY="..."
PUBLIC_AWS_REGION="auto"
PUBLIC_AWS_ENDPOINT_URL_S3="..."
PUBLIC_AWS_BUCKET_NAME="..."
NEXT_PUBLIC_S3_PUBLIC_BUCKET="..."

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Getting Started

1.  **Install dependencies**:

    ```bash
    npm install
    # or
    pnpm install
    ```

2.  **Set up the database**:

    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  **Run the development server**:

    ```bash
    pnpm dev
    ```

4.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000)

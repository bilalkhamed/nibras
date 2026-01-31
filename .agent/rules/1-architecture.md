ARCHITECTURE AND TECH STACK

PROJECT OVERVIEW
Nibras Educational Platform private internal web app for girls 12-17 Unified management for 500-1000 student cohorts replacing Google Forms Drive WhatsApp Zoom Excel

Core Purpose Centralized curriculum for 3 programs weekly task tracking reading lectures activities student progress monitoring bi-weekly reports

Target Girls 12-17 Middle East Syria Yemen Admins Cohort Managers Group Managers Supervisors Scale 500-1000 students per cohort groups of 20-30 Low-bandwidth regions optimized delivery

Environment Internal-only SEO irrelevant Phase 2 Public CMS for articles blog SEO CRITICAL High mobile usage majority on phones Low internet Syria Yemen Language Arabic

TECH STACK
Frontend Next.js 16 App Router TypeScript strict TailwindCSS v4 tw-animate-css Radix UI shadcn/ui React Server Components React Hook Form Zod TanStack Table TipTap Lucide React next-themes
Backend Node.js Next.js server API Routes PostgreSQL Neon DB Prisma 7.x JWT jose bcrypt S3-compatible Tigris AWS SDK v3
Developer pnpm ESLint Prettier React Compiler TypeScript 5.9+

FOLDER STRUCTURE Vertical Sliced
Feature-based vertical slicing plus layered architecture

src/app Next.js routes with role groups auth admin student shared
src/features Each domain entity self-contained module with dal service actions components types.ts
src/components Shared UI auth common forms layout providers skeletons ui
src/lib/server Server-only utils dal helpers service helpers auth prisma s3 tokens
src/lib/shared Client server shared utils
prisma Schema and migrations

ARCHITECTURAL PRINCIPLES

1 Feature-Based Organization
Each entity users cohorts groups programs assignments has DAL Prisma queries ONLY Service authorization validation orchestration Actions Server Actions for mutations Components feature UI Types DTOs schemas

2 Layered Architecture
DAL to Service to Server Component Action
CRITICAL Prisma ONLY in DAL files Service layer used anywhere Never import Prisma outside DAL

3 Route Organization
Route groups for role-based access admin student shared auth

4 Vertical Slicing Benefits
Clear ownership easy feature location no circular deps independent testing scalable

DATA MODEL
User Students Supervisors Admins Cohort academic year 500-600 Group 40-50 students Program 3 main plus 1 supervisor training Level curriculum years Week planning Assignment reading lecture quiz exercise StudentAssignment completion tracking AssignmentAttachment files links

Relationships Users to Cohorts Users to Groups supervisors Students to Groups via junction Assignments by Program x Level x Week StudentAssignments track completion

DEPLOYMENT
Production PostgreSQL Neon RDS Supabase S3-compatible storage Vercel AWS self-hosted
ENV DATABASE_URL S3_ JWT_SECRET
Performance Server Components default Next.js Image Presigned S3 URLs DB indexing use cache in DAL
Security JWT auth RBAC at service layer Zod validation Prisma ORM SQL injection prevention CSRF protection file upload validation

SCALABILITY
Current 500-600 students cohort 40-50 students group 3 main plus 1 training weekly tasks

Phase 2 CMS Planned Public blog articles for community SEO-optimized Content educational articles updates success stories Target parents prospective students community donors Features TipTap editor categories tags SEO metadata sitemap RSS social sharing analytics multi-language Tech SSG for SEO Next.js Image Schema.org separate routes blog caching

Scaling DB read replicas Redis cache CDN rate limiting background jobs monitoring Sentry Vercel Analytics

DEVELOPMENT WORKFLOW
Local pnpm install pnpm prisma migrate dev pnpm dev
Migrations pnpm prisma migrate dev --name description Never edit manually test staging first

Code Review Checklist No Prisma outside DAL Service handles authorization Server Components default TypeScript strict Mobile responsive dark mode Error handling loading states Phase 2 SEO metadata CMS static generation blog

SUMMARY
Architecture prioritizes Maintainability clear separation Scalability 500-1000 students Performance server-first rendering Security RBAC validation Developer Experience feature-based strict typing modern tooling Prefer simplicity over premature optimization
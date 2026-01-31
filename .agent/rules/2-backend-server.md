BACKEND AND SERVER LAYER ARCHITECTURE

OVERVIEW
Strict three-layer architecture DAL Data Access Layer Prisma only Service Layer Business logic authorization Presentation Layer Server Components API Routes Server Actions

CRITICAL RULE Prisma Client ONLY in DAL files No exceptions

LAYER RESPONSIBILITIES

1 DATA ACCESS LAYER DAL
Location src/features/feature/dal/

Purpose Execute Prisma queries mutations Return typed DTOs Handle database errors Cache data

Rules ONLY place where import prisma allowed Every function wraps in runDalOperation Pure database operations no business logic Use use cache directive for reads Use cacheTag for invalidation Return strongly-typed DTOs from types.ts NEVER authorization logic NEVER business calculations NEVER import service

Error Handling runDalOperation catches Prisma errors returns DalReturn<T>
DalReturn types success true data or success false error DalError
DalError types prisma-validation prisma-client no-user no-access unknown

2 SERVICE LAYER
Location src/features/feature/service/

Purpose Enforce authorization Orchestrate DAL calls Apply business logic Map DAL to service errors Validate permissions

Rules Import DAL from feature dal Use runServiceOperation for auth Check roles permissions before access Map DalReturn to ServiceReturn via mapDalToService Can import anywhere Server Components API Routes Actions NEVER import Prisma NEVER bypass DAL

ServiceReturn types success true data or success false error ServiceError
ServiceError types unauthorized 401 forbidden 403 not-found 404 conflict 409 bad-request 400 internal 500

Helpers runServiceOperation wraps with session mapDalToService converts DAL errors runServiceOrRedirect executes and redirects

3 PRESENTATION LAYER

Server Components Preferred
Fetch data on server render HTML Import service functions Handle errors display UI Use Suspense streaming Prefer Server over Client NEVER import DAL or Prisma

Server Actions Mutations
Handle forms mutations Use use server directive Import service functions Validate with Zod revalidateTag after mutations Return structured responses NEVER import DAL or Prisma

API Routes Less Common
REST endpoints Import service functions JSON responses with status codes Validate with Zod NEVER import DAL or Prisma

DATA FETCHING PATTERNS

Pattern 1 Direct const result await getStudents if not success return Error return List
Pattern 2 Auto Redirects const result await runServiceOrRedirect get return List
Pattern 3 Parallel const a b await Promise.all getA getB
Pattern 4 Suspense Use Suspense fallback async component

CACHING
DAL use cache directive cacheTag invalidation
Server Actions revalidateTag after mutations

SECURITY PERFORMANCE

Authorization Always check in service Never trust client IDs use session Validate role-based access

Input Validation Zod schemas in types.ts Validate in Actions Sanitize content

Query Optimization Prisma select only needed fields DB indexes Pagination Avoid N+1 use include

Error Handling Never expose Prisma errors Log server-side Generic messages to users Structured error types

GOLDEN RULES

1 Prisma ONLY in DAL No exceptions
2 Service for Logic Authorization validation orchestration
3 Service Everywhere Server Components Actions API Routes
4 One-way flow DAL Service Presentation
5 Server Components First Not client-side
6 Server Actions for Mutations Not API routes

IMPORT RULES
DAL can import Prisma DAL helpers types
Service can import DAL service helpers types
Presentation can import Service components hooks

FILE CHECKLIST
Create dal/queries.ts use cache
Create dal/mutations.ts writes
Create dal/index.ts exports
Create service/queries.ts authorization
Create service/mutations.ts business logic
Create service/index.ts exports
Create types.ts DTOs Zod schemas
Never import Prisma outside DAL
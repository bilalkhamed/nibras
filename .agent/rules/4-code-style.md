CODE STYLE AND BEST PRACTICES

GENERAL PRINCIPLES

1 TypeScript Strict Mode
Always strict true noImplicitAny strictNullChecks noUnusedLocals noUnusedParameters

2 Quotes
ALWAYS single quotes except JSX attributes and HTML
Correct const name Nibras import from components
Wrong const name double quotes
JSX attributes className bg-primary use double

3 Semicolons
ALWAYS use semicolons at end of statements

4 Formatting
Prettier semi true singleQuote true trailingComma all tabWidth 2 printWidth 90 prettier-plugin-tailwindcss

NAMING CONVENTIONS

Files and Folders kebab-case
Correct src/features/users/dal/queries.ts components/ui/button.tsx
Wrong StudentList.tsx

Component Names PascalCase
Correct export function StudentCard export default function DashboardPage
Wrong export function studentCard

Functions and Variables camelCase
Correct const firstName Fatima const isCompleted false function getUserById
Wrong const FirstName const is_completed

Constants UPPER_SNAKE_CASE
Correct const MAX_UPLOAD_SIZE 5000000 const API_BASE_URL const DEFAULT_LOCALE ar
Wrong const maxUploadSize

Types and Interfaces PascalCase with descriptive suffixes
Correct interface UserDTO type ServiceReturn enum UserStatus
Suffixes DTO Data Transfer Object Props React props Input Input schemas Return Return types
Wrong interface userDto interface Props too generic

REACT AND NEXT.JS PATTERNS

1 Server Components First
Default to Server only add use client when absolutely necessary
Use client when React hooks useState useEffect Event handlers onClick onChange Browser APIs window localStorage Third-party client libs

Optimization Extract Client pieces
Dont make entire page client extract interactive part to separate Client Component

2 Component Architecture

Single Responsibility
One thing per component If over 200 lines break down

Reusability
If used twice or more move to components/

Props Typing
Always specific interfaces Never any or loose types

3 Imports
Absolute imports with at alias Never relative beyond one level
Correct import Button from components/ui/button import getStudents from features/users/service
Wrong import from ../../../../components

Import Order
1 React and Next.js
2 External libraries
3 Internal absolute at
4 Relative if necessary
5 Types
6 Styles

TYPESCRIPT RULES

1 No any
Never use any Use specific types unknown or generics

2 Type Inference
Let TypeScript infer when obvious Explicit for function parameters and returns

3 DTOs
Define in types.ts using Prisma.validator

4 Nullish Coalescing
Use ?? for null undefined only
Use || for any falsy value

TAILWIND CSS AND STYLING

1 Utility-First
Use Tailwind classes for everything Avoid custom CSS

2 Conditional Classes
Use cn utility from clsx tailwind-merge
className cn text-sm isActive and font-bold

3 Class Ordering
Layout flex grid Box model width height padding margin Typography font text Visual bg border shadow Effects transition animation

4 Responsive Design
Mobile-first with breakpoint prefixes
flex flex-col md:flex-row gap-2 md:gap-4

ERROR HANDLING

1 Service Layer Errors
Always handle gracefully const result await getStudents if not success switch error.type redirect or display error

2 Try-Catch
Only for expected errors parsing external APIs
Never for business logic use ServiceReturn

COMMENTS AND DOCUMENTATION

1 Self-Documenting Code
Prefer clear names over comments

2 JSDoc for Public APIs
Use for exported functions especially service layer

3 TODO Comments
Consistent format TODO Implement pagination TODO bilal Add error handling FIXME breaks when zero HACK temporary workaround

PERFORMANCE

1 Avoid Re-renders
Use React.memo for expensive components

2 Proper Keys
Always unique stable keys in lists Use ID not index

3 Debounce Input
useDebouncedCallback for search inputs 500ms

SECURITY

1 Sanitize Input
Never trust user input Validate with Zod schemas

2 Avoid Exposing Sensitive Data
Never send passwords or tokens to client Use select in Prisma exclude sensitive fields

SUMMARY CHECKLIST

Single quotes except JSX attributes
Semicolons always
kebab-case files folders
PascalCase components types
camelCase variables functions
UPPER_SNAKE_CASE constants
Server Components default Client only when needed
Absolute imports at alias
No any types strict typing
Reusable components to components/
Single responsibility under 200 lines
Tailwind utilities not custom CSS
cn for conditional classes
Proper error handling with ServiceReturn
Input validation with Zod
JSDoc for exported functions
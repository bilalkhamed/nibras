FRONTEND STYLING AND UX GUIDELINES

OVERVIEW
Lively fun engaging experience for girls 12-17 Professional for admins supervisors Fully responsive mobile-first Dark mode support Excellent UX for data-heavy interfaces

DESIGN PHILOSOPHY

Target Audience
Students 12-17 Fun colorful motivating Clear visual feedback Simple navigation Minimal text maximum visual cues Mobile-optimized 90 percent on phones
Supervisors Quick access to progress Easy marking tools Clear dashboards Mobile-friendly data-dense
Admins Cohort Managers Data-rich tables reports Efficient bulk operations Advanced filtering search Desktop-optimized with mobile support

Core Principles Delight animations confetti visual rewards Clarity clear typography high contrast accessible colors Efficiency fast navigation minimal clicks Accessibility WCAG 2.1 AA keyboard navigation Performance optimized low-bandwidth regions

THEME AND COLOR SYSTEM

Located src/app/globals.css CSS custom properties Tailwind v4 theme directive

Light Theme Default
Base background fff7fb soft pink-white foreground 1f2933 near black card ffffff muted f6eef6 border e5d5e7 ring f25c88 coral
Primary Gold f3a73b warm gold soft fff3da muted f6c874 foreground 3b2606
Secondary Coral f25c88 vibrant soft ffe5ef muted f89bb4 foreground 4b071c
Accent Indigo 5a4ae3 rich soft ecebff muted 8a80f0 foreground 140f4a
Status Success 22c55e Warning d97706 Destructive f97373

Dark Theme
Base background 0e0a16 deep purple-black foreground f9f5ff card 000 muted 241a33 border 2f2243 ring f6c874 gold
Primary Gold f6b649 brighter
Secondary Coral ff7aa8 vibrant
Accent Indigo 9e8bff lighter
Status Success 43d49f Warning f5c65a Destructive ff8fa3

Using Colors className bg-primary text-primary-foreground hover:bg-primary-muted

Dark Mode next-themes provider useTheme hook

TYPOGRAPHY
System font stack Apple System Segoe UI Roboto
Headings text-2xl md:text-4xl font-bold
Body text-sm md:text-base
Helper text-xs md:text-sm text-muted-foreground
Arabic RTL dir rtl text-right

COMPONENT ARCHITECTURE

Server Components Default
Start Server only use client if need useState useEffect onClick browser APIs

Client Components When Needed
Add use client only for React hooks event handlers browser APIs third-party client libs

Optimization Extract small Client pieces from Server Component

RESPONSIVE DESIGN

Mobile-First
Design mobile first enhance for larger
Breakpoints sm 640px md 768px lg 1024px xl 1280px 2xl 1536px

Responsive classes flex flex-col md:flex-row text-xl md:text-3xl p-4 md:p-6 hidden md:block

Mobile Navigation Sheet drawer for mobile menu

UX PATTERNS

Students Fun Engaging
Task completion animation confetti particleCount 100 spread 70 colors gold coral indigo
Progress bars with celebrations percent 100 shows confetti
Visual task cards rounded-xl border-2 transition isCompleted border-success bg-success-soft

Supervisors Quick Access
Student progress lists Avatar name completion count progress bar

Admins Data-Dense
Advanced DataTable TanStack Table searchable sortable filterable
Bulk action bars fixed bottom translate fixed bar with actions

DATA FETCHING

Server-Side Preferred
Fetch in Server Components const result await getTasks if not success Error return TaskList

Loading States
Suspense boundaries Skeleton loading

Server Actions Mutations
use client useTransition completeTaskAction toast success or error

ACCESSIBILITY

Keyboard aria-label tabIndex onKeyDown Enter Space
ARIA Labels aria-describedby aria-invalid
Focus focus-visible:ring-2 focus-visible:ring-ring

PERFORMANCE

Image Optimization Next Image priority lazy loading
Code Splitting dynamic import loading ssr false
Optimistic Updates useOptimistic

SUMMARY

Design Principles Mobile-first 90 percent users on phones Fun motivating animations colors for students Efficient data-rich for admins Dark mode full support

Technical Server Components first client when needed Server Actions for mutations Mobile to Desktop responsive Performance image optimization code splitting Accessibility semantic HTML ARIA focus management

Color Usage Primary Gold main CTAs branding Secondary Coral accents highlights Accent Indigo links interactive Success Green task completion Warning Amber pending Destructive Red errors delete
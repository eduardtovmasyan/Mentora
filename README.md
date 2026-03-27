# Mentora — PHP Backend & Cloud Engineering

A structured, self-paced learning platform for PHP engineers preparing for senior/architect roles. Covers algorithms, OOP, SOLID, modern PHP 8.x, databases, system design, AWS, and DevOps across 76 lessons in 8 phases (~22 weeks).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 + Composition API (`<script setup lang="ts">`) |
| Language | TypeScript (strict) |
| Build | Vite 5 |
| State | Pinia |
| Routing | Vue Router 4 (hash history) |
| Styles | SCSS |
| Syntax highlighting | highlight.js |

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run type-check # TypeScript check only
```

---

## Project Structure

```
mentora/
├── src/
│   ├── Main.ts                        # App entry point
│   ├── App.vue                        # Root component
│   ├── env.d.ts                       # Vite type declarations
│   │
│   ├── api/                           # HTTP layer (ready for backend)
│   │   ├── BaseApiClient.ts           # Abstract fetch wrapper
│   │   ├── ApiClient.ts               # Concrete client
│   │   └── configs/
│   │       └── ApiClientConfig.ts     # Base URL from VITE_API_BASE_URL
│   │
│   ├── configs/
│   │   └── AppConfig.ts               # App-wide config singleton
│   │
│   ├── interfaces/
│   │   └── IGlobalWindow.ts           # Global window type augmentation
│   │
│   ├── router/
│   │   └── Router.ts                  # Root router — aggregates module routes
│   │
│   ├── assets/styles/
│   │   └── main.scss                  # Global styles + CSS variables
│   │
│   ├── layouts/
│   │   └── main-layout/
│   │       ├── MainLayout.vue         # App shell (sidebar + router-view)
│   │       └── components/sidebar/
│   │           ├── AppSidebar.vue     # Sidebar: search, progress, nav
│   │           └── components/
│   │               ├── SidebarProgress.vue
│   │               └── PhaseGroup.vue
│   │
│   └── modules/
│       ├── course/                    # Course browsing & lesson viewing
│       │   ├── enums/
│       │   │   └── CourseRoute.ts     # Route name enum
│       │   ├── interfaces/
│       │   │   ├── ICourse.ts
│       │   │   ├── IPhase.ts
│       │   │   ├── ILesson.ts
│       │   │   └── ILessonContent.ts
│       │   ├── routes/
│       │   │   └── Routes.ts          # Module route definitions
│       │   ├── stores/
│       │   │   ├── course.store.ts
│       │   │   └── interfaces/
│       │   │       └── ICourseStoreState.ts
│       │   ├── data/
│       │   │   └── php-backend-cloud/
│       │   │       ├── Index.ts       # Typed course meta + phases
│       │   │       └── lessons/       # 76 lesson files (JS exports)
│       │   ├── views/
│       │   │   ├── HomeView.vue
│       │   │   └── LessonView.vue
│       │   └── components/
│       │       └── phase-card/
│       │           └── PhaseCard.vue
│       │
│       └── progress/                  # Lesson completion tracking
│           ├── interfaces/
│           │   └── IProgressStats.ts
│           └── stores/
│               ├── progress.store.ts
│               └── interfaces/
│                   └── IProgressStoreState.ts
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Architecture Patterns

### Module-based structure
Each feature lives under `src/modules/{feature}/` and owns its routes, stores, views, components, and interfaces. Adding a new feature means creating a new module folder — nothing else needs to change globally except registering routes in `src/router/Router.ts`.

### Route name enums
Route names are typed enums, not magic strings:

```ts
// src/modules/course/enums/CourseRoute.ts
export enum CourseRoute {
  Home   = 'course.home',
  Lesson = 'course.lesson',
}

// Usage in any component
router.push({ name: CourseRoute.Lesson, params: { lessonId: 'arrays' } })
```

### Typed Pinia stores
Every store has a matching `IStoreState` interface:

```ts
// src/modules/progress/stores/interfaces/IProgressStoreState.ts
export interface IProgressStoreState {
  completed: Record<string, boolean>
}
```

### Layouts as route wrappers
`MainLayout.vue` is used as the `component` in route definitions, not imported directly in `App.vue`. This allows adding layouts per module (e.g. a future auth layout) without touching `App.vue`.

### API layer (backend-ready)
`BaseApiClient` and `ApiClient` are already wired. When the backend is ready, swap `localStorage` in `progress.store.ts` for API calls through a new `ProgressClient`:

```ts
// Future: src/modules/progress/requests/ProgressClient.ts
class ProgressClient extends ApiClient {
  toggle(lessonId: string) {
    return this.post('/progress/toggle', { lessonId })
  }
}
```

---

## Adding a New Lesson

### 1. Open the lesson file
All lessons are pre-listed in `src/modules/course/data/php-backend-cloud/Index.ts`. The corresponding file already exists under `lessons/`. Open the one you want — e.g. `lessons/redis.js`.

### 2. Replace the null stub with content

```js
// Before (stub)
export default null

// After (full lesson)
export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'Redis — All Data Types',
  intro: 'One paragraph describing what this lesson covers.',
  tags: ['Strings', 'Hashes', 'Sets', 'Sorted Sets', 'Pub/Sub'],
  seniorExpectations: [
    'Know all 5 core data types and when to use each',
    'Implement rate limiting, caching, and session storage with Redis',
  ],
  body: `
<h2>Section Title</h2>
<p>Your explanation here.</p>

<div class="code-block">
  <div class="code-header">
    <span class="code-lang">PHP</span>
    <button class="code-copy" onclick="copyCode(this)">Copy</button>
  </div>
  <pre><code class="language-php"><?php
// your code here
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Tip</div>
  <p>Useful tip here.</p>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Common interview question?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Detailed answer here.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>First key takeaway</li>
    <li>Second key takeaway</li>
  </ul>
</div>
  `,
}
```

### 3. Done
Hot-reload picks it up instantly. No registration, no imports needed — Vite's `import.meta.glob` discovers it automatically.

> **Note:** If your lesson body contains `${...}` (e.g. Terraform HCL or GitHub Actions YAML), escape the dollar sign: `\${`.

---

## Available Lesson Components

| Component | CSS class | Notes |
|---|---|---|
| Code block | `.code-block` | Add `class="language-php"` on `<code>` for highlighting |
| Info callout | `.callout.callout-info` | Blue left border |
| Warning callout | `.callout.callout-warn` | Yellow left border |
| Tip callout | `.callout.callout-tip` | Green left border |
| Danger callout | `.callout.callout-danger` | Red left border |
| Q&A accordion | `.qa-block` | Click to expand, `onclick="toggleQA(this)"` on `.qa-q` |
| Key points | `.keypoints > ul > li` | Auto-prefixed with ✓ |
| Complexity table | `.ctable` | Use `.o1` `.on` `.olog` `.on2` for colored complexity cells |
| Senior box | `.senior-box` | Rendered from `seniorExpectations[]` automatically |

---

## Adding a New Course

1. Create `src/modules/course/data/{course-id}/Index.ts` — export `meta` and `phases`
2. Create `src/modules/course/data/{course-id}/lessons/` — add lesson `.js` files
3. Update `course.store.ts` glob pattern to include the new course path
4. Add a route or course switcher in the router

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Mentora
```

---

## Roadmap

- [ ] Laravel backend — user accounts, progress sync via API
- [ ] Authentication — login, registration, JWT
- [ ] Subscription tiers — free preview / pro full access
- [ ] Admin panel — write and publish lessons without touching code
- [ ] Quiz mode — auto-generated questions from lesson content
- [ ] Full-text search across all lessons
- [ ] Completion certificates
- [ ] More courses: JavaScript/Node.js, Kubernetes, System Design Deep Dive

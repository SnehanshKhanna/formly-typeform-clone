# ROLE

You are a senior full-stack engineer and software architect working inside this repository. You will build a Typeform clone for an SDE Fullstack assignment. This prompt contains the assignment AND the architecture decisions. The decisions are already made. Your job is to implement them, not to re-debate them.

If you believe a decision is technically unworkable (for example, a library is incompatible with the installed Node or Python version), do NOT silently substitute. List it under "Decisions requiring human review" in your planning report with a concrete proposed alternative, and keep the original decision in the plan until I approve the change.

---

# MANDATORY WORKFLOW

Your first run covers ONLY Stages 0 to 4, then you STOP.

- Stage 0: Repository inspection
- Stage 1: Requirements analysis
- Stage 2: Architecture confirmation (the architecture is specified below)
- Stage 3: Create `IMPLEMENTATION_PLAN.md`
- Stage 4: Create `TASKS.md`
- HARD STOP and report

## Planning-stage restrictions

The ONLY files you may create or modify during planning are `IMPLEMENTATION_PLAN.md` and `TASKS.md` (at the repo root). You MUST NOT:
- write application code (components, endpoints, models, migrations, seed scripts)
- scaffold the frontend or backend
- install dependencies
- modify any existing application file
- start implementing any feature

## Approval gate

Implementation begins ONLY when I explicitly say something equivalent to **"Proceed with implementation."** Messages like "looks good", "okay", "continue", "nice", or "that's fine" are NOT authorization. If unsure, ask.

## Planning-stage report (after the two documents exist)

Report: (1) repository state discovered, (2) existing infrastructure, (3) proposed architecture (concise), (4) major technical decisions, (5) important assumptions, (6) important risks, (7) files created, (8) conflicts with existing code, (9) decisions requiring explicit human review. Then state exactly:

**"Implementation has NOT started. Waiting for explicit approval."**

---

# STAGE 0: REPOSITORY INSPECTION

Inspect the whole workspace: directories, source code, `package.json`, lockfiles, `requirements*.txt`, `pyproject.toml`, `.env*` files, `.db`/`.sqlite` files, README, `.git` config, existing scripts, existing tests, installed dependencies, and the versions of Node, npm, and Python. Determine whether a frontend and/or backend already exist, what is reusable, and what conflicts with this spec. Do not delete, overwrite, or replace existing work unnecessarily. If the repository is empty, say so and plan a clean project with `frontend/` and `backend/` at the repo root.

# STAGE 1: REQUIREMENTS ANALYSIS

Inside `IMPLEMENTATION_PLAN.md`, translate the assignment below into an engineering specification: every mandatory functional requirement, non-functional requirements, UI/UX requirements, technical constraints, database requirements, API requirements, evaluation criteria, deliverables, deployment, testing, placeholders, and bonuses. Explicitly rank requirements by priority (see "Implementation priority" later).

---

# THE ASSIGNMENT (AUTHORITATIVE SOURCE)

**Title:** Typeform Builder, SDE Fullstack Assignment.

**Goal:** Build a functional clone of Typeform replicating its design, UX, and core form-building and form-filling workflows. A creator builds forms with multiple question types in a drag-and-drop-style builder, publishes them via a shareable link, and collects responses through the signature one-question-at-a-time conversational experience. The creator then views results. The two hardest and most important pieces are **the builder** and **the polished, animated one-question-at-a-time respondent flow**. The app must match Typeform's UI and UX; the look and feel should be as close to the original as possible.

**Required stack:** Next.js (TypeScript) frontend; Python backend with FastAPI; SQLite database with a self-designed schema (evaluated). The public form fill must be a real, shareable experience with no auth.

**AI usage:** Allowed and encouraged, but the candidate must understand and explain every line. Keep the architecture explainable.

## Mandatory features

1. **Form builder:** title and ordered questions; add, edit, reorder (drag-and-drop), delete questions; types: short text, long text, multiple choice, dropdown, email, number, yes/no, rating; per-question settings: required toggle, description/help text; live preview.
2. **Form management (CRUD):** list of forms with status (draft/published) and response count; create, rename, duplicate, delete; publish/unpublish generating a shareable public link; all definitions persist.
3. **Respondent flow:** one question at a time, full-screen, smooth transitions; keyboard navigation (Enter/arrows) and progress indicator; client + server validation (required, email format, number, etc.); submit stores the response; thank-you screen; no login.
4. **Results:** per-form responses view (table/list); view an individual response in full; basic per-question summary stats (e.g. counts for choice questions); all responses persist.
5. **Typeform experience:** conversational one-at-a-time UI with transitions; clean builder layout with live preview; forms, modals, inline editing; notifications/toasts; settings placeholders (theme, thank-you screen).

## Placeholders ("Coming Soon" is sufficient)
Advanced logic jumps/branching, integrations/webhooks, team collaboration/sharing, payment and file-upload question types, real creator authentication (assume a default logged-in creator).

## Bonus (ONLY after every mandatory item is complete and verified)
Logic jumps, custom themes, CSV export, partial-response tracking / completion rate, file-upload question type, dark mode.

## Other notes
Seed the database with a couple of published forms with mixed question types and existing responses. Original work only (no copying existing repositories). README must include setup, tech stack, architecture overview, database schema, API overview, assumptions. Deliverables: public GitHub repo with `frontend/` and `backend/`, README, deployed demo link. Evaluation: functionality, UI/UX similarity, database design, backend/API design, code quality, modularity, code understanding.

**Product name in the UI:** "Formly" (defined once in a constants file). Do not use Typeform's name, logo, or assets anywhere in the UI.

---

# ARCHITECTURE DECISIONS (FIXED)

## Frontend

- **Framework:** Next.js (latest stable 15.x) with the **App Router**, React, **TypeScript with `strict: true`** (no `any`; `noUncheckedIndexedAccess` on). Package manager: **npm**. Node 20+.
- **Styling:** Tailwind CSS with design tokens as CSS variables (see UI spec). No component library. **Radix UI primitives** (`@radix-ui/react-dialog`, `dropdown-menu`, `popover`, `tooltip`, `switch`, `tabs`) wrapped in our own styled UI components for accessible modals, menus, and popovers. Icons: `lucide-react`. Toasts: `sonner`, styled to match.
- **Animation:** **Framer Motion** (use the current package that supports the installed React version, for example `motion/react`) for question transitions, progress bar, modal and drawer entrances, list reordering. Honor `prefers-reduced-motion` (collapse to a simple fade).
- **Drag and drop:** **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/modifiers`** with `PointerSensor` (activation distance 5px) and `KeyboardSensor` (for accessibility and for reliable E2E tests), a `DragOverlay` showing a lifted, shadowed copy of the dragged row, and animated drop settling.
- **Server state:** **TanStack Query** for the dashboard list, results, and stats (cache, invalidation, loading/error states).
- **Builder state:** **Zustand** store (single store for the open form) because the outline, canvas, settings panel, top bar, and preview all share the same in-progress definition and save status. Keep the store small and typed, with actions: `load`, `renameForm`, `addQuestion`, `updateQuestion`, `deleteQuestion`, `reorderQuestions`, `select`, `setSaveStatus`, plus the autosave queue.
- **Player state:** a pure typed **`useReducer`** (`playerReducer`) holding `phase` (`welcome | question | submitting | done`), `index`, `direction` (`forward | backward`), `answers`, `errors`. It must be unit-testable without React.
- **API client:** a thin typed `apiFetch<T>()` in `lib/api/client.ts` plus per-resource modules (`forms.ts`, `questions.ts`, `submissions.ts`, `public.ts`). Throws a typed `ApiError { status, code, message, fields }`. Types in `types/api.ts` are hand-written to mirror the Pydantic schemas and listed in the plan as an explicit assumption. Base URL from `NEXT_PUBLIC_API_BASE_URL`.
- **Data fetching approach:** all pages are client components that fetch from the FastAPI backend (the public form page included). No Next.js API routes, no server actions, no Next-side database access.
- **Fonts:** `next/font/google`: **Inter** for app chrome (dashboard, builder, results) and **Karla** for the respondent player (Typeform's default look is Karla-like).
- **Lint/format:** ESLint (Next config) + Prettier.

### Frontend routes

- `/` : creator dashboard (form list)
- `/forms/[formId]` : redirects to `/forms/[formId]/create`
- `/forms/[formId]/create` : builder
- `/forms/[formId]/settings` : settings (thank-you screen editable; theme placeholder)
- `/forms/[formId]/connect` : "Coming Soon" (integrations/webhooks)
- `/forms/[formId]/results` : results (Summary / Responses tabs, individual response drawer via `?response=<id>`)
- `/f/[slug]` : public respondent flow (no auth)

`forms/[formId]/layout.tsx` renders the shared top bar (back arrow, inline-editable title, save indicator, tabs, Preview, Publish) and owns the Zustand store for that form, so all tabs share one loaded definition.

### Frontend folder structure

```
frontend/src/
  app/                      # routes only; thin pages
  components/
    ui/                     # Button, Input, Modal, Dropdown, Switch, Tabs, Tooltip, Skeleton, EmptyState, Badge, Spinner, Toaster
    dashboard/              # FormList, FormRow, CreateFormModal, RenameModal, DeleteModal, FormMenu
    builder/                # TopBar, QuestionOutline, SortableQuestionItem, AddQuestionPopover, QuestionCanvas, SettingsPanel, PublishModal, SaveIndicator, PreviewOverlay
    player/                 # FormPlayer, WelcomeScreen, QuestionSlide, ThankYouScreen, ProgressBar, NavControls, EnterHint, InlineError
    results/                # SummaryTab, QuestionStatCard, ResponsesTable, ResponseDrawer
    placeholders/           # ComingSoon
  lib/
    api/                    # client + resource modules
    question-types/         # registry + one folder per type (see below)
    player/                 # playerReducer, keyboard helpers
    store/                  # builder store + autosave
    utils/
  hooks/
  types/
```

## Backend

- **Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (typed `Mapped[]` ORM style), Alembic** for migrations (SQLite batch mode enabled in `env.py`), **pytest** + FastAPI `TestClient`, **ruff** for lint/format. Dependencies via `requirements.txt` and `requirements-dev.txt` in a virtualenv (no Poetry/uv, for simplicity).
- **Layering:** `routers/` (HTTP only, thin) → `services/` (all business logic, take a `Session`) → `models/` (ORM). `schemas/` holds Pydantic request/response models. Routers never contain query logic.
- **Default creator:** a dependency `get_current_creator()` returns the seeded default creator. It is the single documented swap-point for real auth later. All creator endpoints scope queries by `creator_id` (a form id belonging to another creator returns 404).
- **SQLite settings:** on every connection, `PRAGMA foreign_keys=ON` and `PRAGMA journal_mode=WAL` via a SQLAlchemy engine connect event. `check_same_thread=False` with a per-request session dependency.
- **Config:** `pydantic-settings` reading env vars: `DATABASE_URL`, `CORS_ORIGINS` (comma-separated), `ENV`. Provide `backend/.env.example`.
- **Timestamps:** stored UTC, serialized as ISO 8601 with `Z`.

### Backend folder structure

```
backend/
  app/
    main.py                 # app factory, CORS, exception handlers, router includes
    core/                   # config.py, errors.py (AppError + handlers), security.py (default-creator dependency)
    db/                     # base.py, session.py
    models/                 # creator.py, form.py, question.py, question_option.py, submission.py, answer.py, answer_option.py
    schemas/                # form.py, question.py, submission.py, stats.py, common.py
    routers/                # forms.py, questions.py, submissions.py, public.py
    services/               # form_service.py, question_service.py, submission_service.py, stats_service.py, slug.py
    question_types/         # base.py, registry.py, one module per type
    seed.py                 # python -m app.seed
  alembic/ , alembic.ini
  tests/                    # conftest.py (isolated temp-file SQLite per test), test_*.py
  requirements.txt, requirements-dev.txt, Dockerfile, .env.example
```

## Database schema (SQLite, relational; justified in the plan)

Integer autoincrement primary keys. All FKs use `ON DELETE CASCADE` unless noted.

**`creators`**: `id`, `email` (unique), `name`, `created_at`. One seeded default creator.

**`forms`**: `id`, `creator_id` FK, `title` (not null, default "Untitled form"), `description` (nullable, shown on the welcome screen), `status` (`draft`|`published`, CHECK constraint, default `draft`), `slug` (unique, not null; 8-character random URL-safe string generated with the `secrets` module; stable across unpublish/republish; generated at creation), `thank_you_title`, `thank_you_message` (defaults provided), `theme` (JSON text, default `{}`, reserved for the theme bonus and shown as "Coming Soon" in the UI), `published_at` (nullable), `created_at`, `updated_at`. Indexes: `(creator_id, updated_at)`, unique `slug`.

**`questions`**: `id`, `form_id` FK, `type` (CHECK constraint over the 8 type keys: `short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, `rating`), `title` (text, may be empty while editing), `description` (nullable), `required` (bool, default false), `position` (integer), `config` (JSON text, type-specific settings only), `created_at`, `updated_at`. Index `(form_id, position)`.
- **Ordering strategy:** contiguous integer `position` (0..n-1) per form, rewritten in ONE transaction by `PUT .../questions/reorder` (the client sends the full ordered id list; the server verifies the ids exactly match the form's questions). Adding appends at the end (or after a given `after_question_id`); deleting resequences the remainder. There is deliberately NO unique constraint on `(form_id, position)` because SQLite cannot defer unique checks during a bulk resequence; integrity is enforced in the service layer inside a transaction. Rationale for the plan: simple, explainable, form sizes are small, fractional indexing is unnecessary.
- **`config` JSON usage (the only JSON on question definitions):** type-specific scalar settings validated by a per-type Pydantic model on the server (`extra="forbid"`): `short_text`/`long_text`: `placeholder`, `max_length`; `email`: `placeholder`; `number`: `placeholder`, `min`, `max`; `rating`: `max` (integer 3 to 10, default 5); `multiple_choice`: `allow_multiple` (bool); `dropdown`: `placeholder`; `yes_no`: none. Core structure (type, title, required, position, options) stays in real columns/tables so queries and constraints work.

**`question_options`**: `id`, `question_id` FK, `label`, `position`. Index `(question_id, position)`. Used by `multiple_choice` and `dropdown`. Options are a table (not JSON) so answers can reference them by FK and stats stay correct when labels are edited.

**`submissions`**: `id`, `form_id` FK, `status` (`in_progress`|`completed`, CHECK, default `completed`; the MVP only writes `completed`, the column exists to support the partial-response bonus), `started_at`, `submitted_at` (nullable). Index `(form_id, submitted_at)`.

**`answers`**: `id`, `submission_id` FK, `question_id` FK, `value_text` (nullable; short_text, long_text, email), `value_number` (nullable REAL; number, rating), `value_bool` (nullable; yes_no). UNIQUE `(submission_id, question_id)`. Indexes on `question_id` and `submission_id`. Skipped optional questions produce NO answer row.

**`answer_options`**: `answer_id` FK, `option_id` FK, composite primary key. Used for `multiple_choice` and `dropdown` answers (supports multi-select). This gives typed storage with real FKs and trivial `GROUP BY option_id` stats.

Deleting a question cascades to its options and answers (the UI confirmation modal warns when responses exist). Deleting a form cascades to everything below it.

## Business rules (fixed)

- **Publish:** `POST /publish` requires at least 1 question, every question has a non-empty title, and every choice/dropdown question has at least 1 non-empty option. Otherwise 422 `PUBLISH_VALIDATION_FAILED` with `fields` listing offending question ids (the UI selects the first offender and shows a toast). Publishing sets `status=published` and `published_at`; the slug never changes.
- **Unpublish:** sets `status=draft`; the public endpoint immediately returns 404.
- **Editing a published form** is allowed and goes live immediately; the builder shows a subtle "Changes are live" banner. No versioning.
- **Question type cannot be changed** after creation (delete and re-add). This is a documented assumption.
- **Duplicate form:** deep copy of form fields, questions, and options into a new draft titled "Copy of <title>" with a NEW slug, zero submissions, `published_at` null.
- **Duplicate question** (in the builder): `POST .../questions/{qid}/duplicate` inserts a deep copy directly after the original.
- **Public access:** only `published` forms are reachable. Unknown slug and unpublished slug both return the same 404 `FORM_NOT_FOUND` (no existence leak). The public payload contains no creator-only data (no creator id, no response counts, no timestamps beyond what the player needs).

## Question-type system (identical concept on both sides)

**Backend:** `question_types/base.py` defines an abstract `QuestionTypeHandler` with:
`type_key`, `config_model` (Pydantic), `default_config()`, `supports_options` (bool), `validate_answer(question, raw_value) -> NormalizedAnswer` (raises a structured per-question validation error), `persist_answer(answer_row, normalized)` (writes the right typed column / `answer_options`), `read_answer(answer_row) -> JSON value`, `format_answer(question, value) -> str` (for tables and CSV), and `aggregate_stats(db, question) -> dict`. `registry.py` maps `type_key -> handler`. Services only talk to the registry; there is no `if type == ...` chain in services or routers.

**Frontend:** `lib/question-types/registry.ts` maps `type -> QuestionTypeDefinition` where each definition (one folder per type) provides: `type`, `label`, `icon`, `description`, `defaultConfig`, `defaultTitle`, `ConfigPanel` (settings panel section), `CanvasPreview` (what the builder canvas renders; reuses the respondent input in read-only mode), `RespondentInput` (the interactive input for the player), `validate(question, value) -> string | null`, `isEmpty(value)`, `formatAnswer(question, value) -> string`, `AnswerView` (renders in the response drawer), and `StatView` (renders the stat card from the stats payload). A registry test asserts every type implements every member. The builder, player, and results components iterate the registry and never branch on type.

Types "File upload" and "Payment" appear in the type picker as disabled entries with a "Coming Soon" badge.

### Per-type behavior

| Type | Respondent UI | Value sent | Validation (client and server) |
|---|---|---|---|
| short_text | single-line large underline input | string | required; max_length |
| long_text | large textarea; Enter advances, Shift+Enter newline; hint "Shift ↵ to make a line break" | string | required; max_length |
| multiple_choice | lettered option cards (A, B, C...); letter keys select; single-select auto-advances after ~400ms; `allow_multiple` shows checkmarks and requires OK/Enter | `number[]` option ids | required; every id must belong to the question; length 1 unless `allow_multiple` |
| dropdown | custom searchable combobox (type to filter, arrows to navigate, Enter to pick) | `number[]` of length ≤ 1 | required; option id must belong to the question |
| email | email input | string | required; regex-based format check (identical rule on both sides) |
| number | numeric input | number | required; finite number; min/max if configured |
| yes_no | two large buttons; Y and N keys; auto-advances | boolean | required |
| rating | row of stars (click or number keys 1..max, max default 5); auto-advances | integer | required; 1 ≤ value ≤ max |

Optional + empty = skipped (value `null` or omitted); no answer row stored. Unknown question ids in a submission are rejected.

## API (REST, prefix `/api`, JSON)

**Error format (all errors, including Pydantic request-validation errors, which are mapped into it):**
```
{ "error": { "code": "VALIDATION_ERROR", "message": "Human readable summary",
             "fields": [ { "question_id": 12, "code": "REQUIRED", "message": "Please fill this in" } ] } }
```
`fields` is present only for validation-type errors (`question_id` for submissions/publish; `field` name for request-body errors). Status codes: 200, 201, 204, 404 (`NOT_FOUND` / `FORM_NOT_FOUND`), 409 (conflicts), 422 (`VALIDATION_ERROR`, `PUBLISH_VALIDATION_FAILED`), 500 (`INTERNAL_ERROR`, generic message, details logged, never leaked). Global exception handlers live in `core/errors.py`.

**Creator endpoints (default creator, no auth):**
- `GET /api/forms?q=&status=`: list summaries: `id, title, status, slug, question_count, response_count, updated_at, published_at`. Response counts via a single aggregate query (no N+1).
- `POST /api/forms` `{title?}` → 201 form (zero questions)
- `GET /api/forms/{id}`: full definition (form + ordered questions + options)
- `PATCH /api/forms/{id}`: `title`, `description`, `thank_you_title`, `thank_you_message`
- `DELETE /api/forms/{id}` → 204
- `POST /api/forms/{id}/duplicate` → 201
- `POST /api/forms/{id}/publish`, `POST /api/forms/{id}/unpublish` → 200 form
- `POST /api/forms/{id}/questions` `{type, title?, description?, required?, config?, options?, after_question_id?}` → 201 question (server fills type defaults, including two default options "Choice 1"/"Choice 2" for choice/dropdown)
- `PATCH /api/forms/{id}/questions/{qid}`: partial update of `title, description, required, config, options`. If `options` is present it is the full ordered list `[{id?, label}]`: existing ids are updated, items without id are created, missing ids are deleted (their answer_options rows cascade).
- `DELETE /api/forms/{id}/questions/{qid}` → 204 (resequences)
- `POST /api/forms/{id}/questions/{qid}/duplicate` → 201
- `PUT /api/forms/{id}/questions/reorder` `{ordered_ids: number[]}` → 200 questions (atomic; 422 if ids do not exactly match)
- `GET /api/forms/{id}/submissions?page=&page_size=` → paginated `{items, total, page, page_size}`; each item `{id, submitted_at, status, answers: [{question_id, value}]}`
- `GET /api/forms/{id}/submissions/{sid}`: single response
- `GET /api/forms/{id}/stats`: `{total_responses, last_response_at, questions: [{question_id, type, answered_count, skipped_count, ...type-specific}]}`. Type-specific: choice/dropdown/yes_no: `options: [{label, count, percentage}]`; rating: `average, distribution: [{value, count}]`; number: `min, max, average`; text/email: `recent: [string]` (latest 5).

**Public endpoints (no auth):**
- `GET /api/public/forms/{slug}`: published only; returns title, description, thank-you fields, ordered questions with options
- `POST /api/public/forms/{slug}/submissions` `{answers: [{question_id, value}]}` → 201 `{id}`. Server validates EVERY question against its stored definition (required, type, email, number range, rating bounds, valid option ids, unknown question ids, malformed shapes) independently of the client, collects ALL per-question errors, and returns them together in `fields`. The submission and all its answers are written in one transaction. Rejected if the form is not published.

---

# BUILDER SPEC

**Layout (desktop ≥1024px, three panes under a top bar):**
- **Top bar:** back arrow to dashboard, inline-editable form title (click to edit, Enter/blur commits, Escape cancels), save indicator, tabs (`Create`, `Settings`, `Connect` [Coming Soon page], `Results`), `Preview` button, primary `Publish` button (becomes `Published` with a status dot plus a share affordance once published; opens PublishModal).
- **Left pane, outline:** numbered list of questions. Each row: drag handle, number, type icon, truncated title (placeholder "Your question here"), hover three-dot menu (Duplicate, Delete). Selected row highlighted. Rows are sortable with dnd-kit (lifted overlay, animated displacement and drop). An `Add question` button at the bottom opens `AddQuestionPopover`: a searchable grid of the 8 types plus the two Coming Soon types. Adding selects the new question and focuses its title.
- **Center pane, canvas:** renders the selected question in player styling on a soft background. The title and description are inline-editable (borderless, large type, placeholders "Type your question here" and "Description (optional)"). Below them, `CanvasPreview` shows the real respondent input in read-only mode. For choice/dropdown questions, options are editable inline (add, remove, edit label, drag to reorder not required). Empty state when the form has no questions: illustration-free centered prompt with an "Add your first question" button.
- **Right pane, settings:** question type label (read-only), `Required` switch, `Description` is on the canvas, type-specific `ConfigPanel` (placeholder, max length, min/max, rating scale, allow multiple, etc.), and a "Logic" section rendered as `ComingSoon`.
- **Live preview:** (1) the canvas is a live WYSIWYG render of the in-progress question; (2) `Preview` opens a full-screen overlay running the real `FormPlayer` in `mode="preview"` against the in-memory (unsaved) definition, with a desktop/mobile viewport toggle and a close button. Preview mode never submits and never touches the server, and shows a "Preview" ribbon; the thank-you screen shows with a "Restart" action.
- **Below 1024px:** the outline becomes a toggled drawer and settings a bottom sheet. Pixel-perfect mobile builder is not required; dashboard, results, and player must be fully responsive.

**Settings tab (`/settings`):** editable thank-you title and message (real, persisted, with live mini-preview); form description for the welcome screen (real); a "Theme" card showing color swatches and font selector disabled with a "Coming Soon" badge.

**Publish modal:** if unpublished, explains and shows `Publish`; publish failures show the offending questions list. If published, shows the public URL (`<origin>/f/<slug>`), a `Copy link` button (toast "Link copied"), an `Open form` link, and an `Unpublish` button. A "Team collaboration" row shows Coming Soon.

## Autosave (fixed behavior)

- Text edits (title, description, config, options, required, form title) update the store immediately and mark that entity dirty. A **debounced (600ms)** flush sends one `PATCH` per dirty question (merging pending fields) or form. Flushes are serialized (no overlapping saves for the same entity); if edits arrive mid-flight, a follow-up flush runs after it completes.
- **Structural actions:** `addQuestion` awaits `POST` then inserts the returned question; `deleteQuestion` and `reorderQuestions` are optimistic with rollback and an error toast on failure; the reorder sends the full ordered id list.
- **Save indicator** in the top bar with exactly three states: `Saving…`, `Saved` (with a check icon, fades to a muted state), `Failed to save · Retry`. A `beforeunload` guard warns if unsaved changes exist. Switching tabs or opening Preview first flushes pending saves.
- No localStorage as a source of truth.

---

# RESPONDENT PLAYER SPEC (HIGHEST PRIORITY)

One `FormPlayer` component used by the public route (`mode="live"`) and the builder preview (`mode="preview"`). It must NEVER render all questions at once.

**Phases:** `welcome` (form title, description, "Start" button with "press Enter ↵" hint, and "Takes about N minutes" computed as ~15 seconds per question rounded up to a minimum of 1) → `question` → `submitting` → `done` (thank-you). A form with zero questions in preview shows a helpful empty message.

**Layout:** full viewport (`100dvh`), content vertically centered, max content width ~720px, left aligned on desktop, generous padding on mobile. Thin progress bar fixed at the top (animated width = answered or advanced fraction), bottom-right navigation cluster (up chevron = previous, down chevron = next; the up chevron is disabled on the first question). A question counter label near the bottom-left (`3 of 8`). No third-party branding.

**Question slide:** question number followed by an arrow icon in the accent color, then the title (required questions show a trailing asterisk), the description beneath it in a muted color, then the type's `RespondentInput`, then an `OK ✓` button with a "press Enter ↵" hint (hint hidden on touch devices). On the last question the button reads `Submit`.

**Transitions:** direction-aware. Forward: current slide exits upward with fade, the next enters from below with fade. Backward: reversed. Duration ~350ms with `cubic-bezier(0.22, 1, 0.36, 1)`; use `AnimatePresence mode="wait"` (or an equivalent that avoids layout jumps). Reduced motion: fade only. Input auto-focuses after the enter transition completes.

**Keyboard:**
- `Enter` advances (validates first). In long text, `Shift+Enter` inserts a newline. In an open dropdown, `Enter` selects the highlighted option; with a closed dropdown that already has a value, `Enter` advances.
- `ArrowDown`/`PageDown` advances with validation and `ArrowUp`/`PageUp` goes back without validation, except when the focused control consumes the key (textarea caret movement, open dropdown list).
- Letter keys select options in multiple choice, `Y`/`N` in yes/no, digits select a rating (when focus is not inside a text input).
- Tab order and focus rings are visible and correct. All interactive elements have ARIA roles/labels; validation errors are announced through `aria-live="polite"`.

**Validation UX:** client validators from the registry run on advance. On failure: the slide shakes briefly (disabled for reduced motion), an inline error message with an icon appears beneath the input ("Please fill this in", "Please enter a valid email", "Please enter a number", "Minimum value is X", etc.), and navigation is blocked. Going backward never requires validity. Answers survive back/forward navigation (held in player state).

**Submission:** after the last valid question, phase `submitting` (button spinner, inputs disabled), then POST. On 201 → thank-you screen (animated check, the form's thank-you title and message). On 422 → map `fields` to questions, jump to the first errored question, show its server error message. On network or 5xx failure → inline error banner "Something went wrong. Your answers are saved on this page. Try again." with a retry button; answers are retained in state.

**Public route states:** loading skeleton; 404/unavailable → friendly full-screen "This form is not available" page; network error → retry state. In preview mode, the server is never called.

---

# DASHBOARD SPEC

Top nav (product wordmark "Formly", demo-creator avatar), page header "My forms" with search input (debounced server-side `q`), status filter (All/Published/Draft), and a primary `Create form` button that opens a modal (title input defaulting to "Untitled form") and then routes to the builder. The list is rows: colored tile with the title's initial, title, `Updated <relative time>`, question count, response count, status badge (green "Published", grey "Draft"), and a three-dot menu (Open in builder, View results, Copy link [published only], Rename, Duplicate, Delete). Rename opens a modal; Delete opens a confirmation modal stating the response count; Duplicate toasts and navigates or refreshes the list. Clicking a row opens the builder. Loading: skeleton rows. Empty: friendly empty state with a Create button. Error: retry state. Every mutation shows a toast (success and failure).

# RESULTS SPEC

Route `/forms/[formId]/results` with Tabs `Summary` and `Responses`.
- **Summary:** stat header cards (Responses, Last response). Per-question cards from `GET /stats`: choice/dropdown/yes_no as horizontal CSS bars with count and percentage; rating as average plus a 1..max distribution bar chart; number as min/max/average; text and email as the 5 most recent answers plus answered/skipped counts. No charting library (CSS/SVG bars only).
- **Responses:** paginated table (25 per page): first column submission date/time, then one column per question (truncated cell via `formatAnswer`, horizontal scroll, sticky first column). Clicking a row opens a right-side `ResponseDrawer` showing every question with its full answer (skipped shown as "No answer"), with previous/next response arrows; the drawer is deep-linkable via `?response=<id>`.
- Empty state (no responses, with a copy-link CTA if published), loading skeletons, and error states for both tabs.

---

# UI/UX SPEC

**Study first:** if you have web access, study the live Typeform product (dashboard, builder, public player, results) before writing the plan, and describe in your own words the patterns you will reproduce. Do NOT copy proprietary source code, hidden implementation details, logos, or assets. Recreate the visual language independently. If you have no web access, rely on the tokens below and say so in the plan. The final result must feel like a polished SaaS product, not a CRUD template.

**Design tokens (CSS variables; calibrate against the live product when possible):**
- App text `#262627`; muted text `#6F6F70`; border `#E5E5E5`; app background `#FFFFFF` with `#F7F7F7` for panels and the builder canvas surround; primary button background `#262627` with white text, hover `#000000`; success `#1B7F4B`; danger `#C4314B`.
- Player: background `#FFFFFF`; question text `#262627`; accent (answer/button color) `#0445AF`, button hover slightly darker; accent tint for option cards `rgba(4,69,175,0.1)` with a 1px accent border, selected state filled accent with white letter badge; input underline `rgba(38,38,39,0.3)` 1px, focus 2px accent; error text/background tint `#C4314B`.
- Typography: app chrome Inter at 14px base, headings 600 weight; player Karla: question title 28px/1.3 desktop (22px mobile) weight 400, description 20px (16px mobile) at 70% opacity, input text 28px (22px mobile), buttons 16px weight 600.
- Radii: buttons 4–6px, cards/modals 8–12px, option cards 4px. Spacing on a 4px grid. Shadows: subtle (popovers `0 4px 16px rgba(0,0,0,.12)`, modals larger).
- Hover/focus/disabled states defined for every control; focus-visible ring 2px accent with offset. Modals and drawers animate (fade + 8px translate); toasts bottom-center or top-center, concise.
- Responsive: dashboard and results fully responsive; player mobile-first (touch targets ≥44px, nav cluster stays reachable above the mobile keyboard); builder as specified above.
- Global: skeletons for every async region, empty states, error states with retry, confirmation modals for destructive actions, ARIA labels, `prefers-reduced-motion` support.

---

# SEED DATA

`python -m app.seed` is idempotent (safe to run repeatedly): it upserts the default creator (`demo@formly.app`) and creates the demo forms only if their fixed slugs do not already exist. Responses are generated with a fixed-seed RNG so results are deterministic, with submission timestamps spread across the last 30 days and some optional questions skipped.

1. **"Customer Satisfaction Survey"**, published, slug `demo-feedback`, ~28 submissions: short text (name, optional), email, multiple choice (how did you hear about us, single select), multiple choice with `allow_multiple` (features used), dropdown (country), rating 1 to 5 (overall satisfaction), number (likelihood to recommend 0 to 10, via min/max), yes/no (would you buy again), long text (open feedback, optional).
2. **"Event Registration"**, published, slug `demo-event`, ~18 submissions: short text, email, number (guest count with min/max), dropdown (session track), yes/no (dietary requirements), multiple choice, rating, long text. Between the two forms ALL 8 types must appear.
3. **"Product Waitlist"**, draft, 3 questions, no submissions.

---

# TESTING (FIXED STACK)

**Backend (pytest + TestClient, a fresh temp-file SQLite DB per test via fixtures with foreign keys on):** form CRUD, scoping by creator, duplicate (deep copy, new slug, zero responses), publish (including all `PUBLISH_VALIDATION_FAILED` cases)/unpublish, question CRUD, option sync via PATCH, atomic reorder (including mismatched id lists), public access rules (draft and unknown slug → 404 with identical body), submission validation per type (required, email, number min/max, rating bounds, invalid/foreign option id, multiple selection rules, unknown question id, malformed shapes, multiple errors returned together), transactionality (no partial rows after a failed submission), persistence, cascade deletes, stats correctness for every type, and seed idempotency (running it twice yields no duplicates).

**Frontend (Vitest + React Testing Library + jsdom):** every validator; the question-type registry completeness test; `playerReducer` transitions (forward, backward, validation block, submit success/failure); `FormPlayer` behavior (Enter advances, Shift+Enter in long text, back navigation keeps answers, required blocks advance, server errors jump to the offending question); builder store (add, edit, delete with rollback, reorder, autosave state machine with mocked API: saving → saved → failed → retry).

**End-to-end (Playwright, Chromium):** Playwright config starts the backend (on a separate test database file, migrated and seeded fresh) and the frontend. The critical-path spec: create form → add short text, email, multiple choice, rating, number, yes/no, dropdown, long text → set required and a description on some → reorder via keyboard drag (dnd-kit KeyboardSensor) → publish → read the public URL from the modal → open it in a fresh browser context (no auth) → trigger a validation failure (empty required, invalid email) → recover → navigate back and verify the answer is retained → submit → thank-you screen → open creator results → find the response in the table and the drawer → verify stats → reload and confirm persistence. A second small spec: an unpublished form's public URL shows the unavailable page.

---

# DEPLOYMENT (FIXED)

- **Frontend:** Vercel, project root `frontend/`, env `NEXT_PUBLIC_API_BASE_URL=https://<backend-host>`.
- **Backend:** Render web service built from `backend/Dockerfile`. Start command runs `alembic upgrade head && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Env: `DATABASE_URL=sqlite:////data/formly.db`, `CORS_ORIGINS=https://<vercel-domain>`, `ENV=production`. SQLite persistence: attach a Render persistent disk mounted at `/data`. Document the fallback: on an ephemeral filesystem the idempotent seed repopulates demo data at each boot, but submitted responses are lost on redeploy (state this limitation in the README).
- Do not spend time on deployment until the application is stable and verified locally; during implementation only keep the structure deployment-ready (env-driven config, Dockerfile, `.env.example` files, health endpoint `GET /api/health`).

---

# DOCUMENTATION

`README.md` (repo root) must describe the ACTUAL implementation: overview, features, screenshots, tech stack with the reasons for each major choice, architecture overview (with a diagram), folder structure, database schema with a Mermaid ER diagram and an explanation of the typed-answer and JSON-config decisions, API overview table, setup instructions, environment variables, database setup and migrations, seed instructions, local development (both servers), testing instructions (backend, frontend, E2E), production build, deployment instructions (frontend/backend separation, API base URL, CORS, env vars, SQLite persistence), assumptions, limitations, future improvements.

---

# STAGE 3: `IMPLEMENTATION_PLAN.md` REQUIRED CONTENT

Create it at the repo root. It must restate and elaborate the decisions above (do not weaken them) with these numbered sections, detailed enough that another developer could implement from it alone:

1. Project overview
2. Requirements breakdown
3. Mandatory vs placeholder vs bonus features
4. Architecture
5. Technology decisions
6. Reasons for each major decision
7. Directory structure
8. Database schema (tables, columns, types, constraints, indexes, deletion behavior)
9. Entity relationships (ER description or Mermaid)
10. API specification (endpoints, request/response schemas, status codes, error format)
11. Frontend architecture
12. Builder architecture
13. Question-type architecture (both sides)
14. Respondent-flow architecture
15. State-management approach
16. Validation strategy (shared rules on the client, independent enforcement on the server, rule parity table per type)
17. Autosave strategy
18. UI/UX specification (tokens, components, per-screen notes)
19. Animation strategy
20. Seed-data strategy
21. Testing strategy
22. Deployment strategy
23. Documentation strategy
24. Risk analysis (for example: dnd-kit plus Framer Motion layout conflicts, autosave race conditions, SQLite write concurrency, keyboard-handling conflicts in the player, Typeform visual parity)
25. Known assumptions (including every ambiguity resolved)
26. Implementation phases
27. Definition of done

Also include a "Decisions requiring human review" section (empty if none) and a "Repository inspection findings" section.

# STAGE 4: `TASKS.md` REQUIRED CONTENT

Create it at the repo root. Use checkboxes. Each task must be specific, small enough to verify, ordered by dependency, mapped to the architecture above, and carry an acceptance criterion. Phases:

1. Project setup (frontend, backend, env files, lint/format, CORS, health check, frontend-to-backend connectivity)
2. Database (models, Alembic initial migration, constraints/indexes, PRAGMAs, seed script, relationship and cascade verification)
3. Backend foundation (config, session, error handling, default-creator dependency, question-type base and registry)
4. Backend APIs (form CRUD, duplicate, publish/unpublish, question CRUD with option sync, duplicate question, atomic reorder, public retrieval, submission with server validation, submissions list and detail, stats), each with its tests
5. Frontend foundation (tokens, fonts, UI primitives, API client, ApiError, toasts, Query provider, layout)
6. Creator dashboard (list, search/filter, create/rename/duplicate/delete modals, menu, states)
7. Form builder (layout, top bar, store plus autosave, outline with dnd-kit, add-question popover, canvas with inline editing, settings panel, publish modal, preview overlay, settings tab, Connect placeholder)
8. Question types (all 8 definitions on the frontend and backend with their tests)
9. Respondent experience (public route, playerReducer, FormPlayer, welcome, slides, transitions, keyboard, validation, progress, submission, thank-you, error states)
10. Results (summary, responses table, drawer, empty/loading/error states)
11. UI/UX polish (Typeform parity pass, responsive pass, accessibility pass, animation refinement)
12. Testing (complete backend, frontend, and Playwright suites; run everything)
13. Documentation (README and final checks)
14. Deployment readiness (Dockerfile, production builds, env docs; deploy only after everything is verified)
15. Bonus (only after all above are verified), in this order: CSV export (`GET /api/forms/{id}/submissions/export.csv` plus a button), completion rate / partial-response tracking, basic logic jumps, dark mode, custom themes, file-upload

---

# HARD STOP (repeat)

After creating `IMPLEMENTATION_PLAN.md` and `TASKS.md`, STOP. Produce the planning-stage report described above and end with: **"Implementation has NOT started. Waiting for explicit approval."**

---

# AFTER I SAY "PROCEED WITH IMPLEMENTATION"

Execute `TASKS.md` systematically:
1. Work in dependency order; verify each milestone (run the backend tests, hit the endpoints, exercise the UI) before moving on. Integrate frontend, backend, and DB continuously; do not wait until the end.
2. Tick off tasks in `TASKS.md` as they are actually completed; keep `IMPLEMENTATION_PLAN.md` synchronized with any meaningful architectural change.
3. Run tests after every meaningful milestone. Fix errors; never suppress or hide them.
4. Never claim functionality is complete without testing it.
5. Complete and verify all mandatory requirements before touching any bonus feature.

## Implementation priority
1. Functional correctness
2. Database persistence
3. Backend/API correctness
4. Form builder quality
5. Respondent experience
6. UI/UX polish
7. Testing
8. Documentation
9. Deployment readiness
10. Bonus features

## Engineering principles
- Do not over-engineer: a robust MVP with polished UX that a candidate can explain in an interview.
- Do not under-build: every mandatory requirement must actually work.
- No fake functionality: a control either works or is clearly marked "Coming Soon".
- No fake response data: all responses and stats come from the database.
- No frontend-only persistence of core data (no localStorage as source of truth).
- No monolithic files; no `if type == ...` chains outside the registries.
- No unnecessary dependencies and no unnecessary rewrites of existing work.
- Strict TypeScript (no `any`), Python type hints, Pydantic schemas.
- Environment-based configuration, no hardcoded secrets, `.env.example` for both apps.
- Never leave a blank screen or an uncaught exception: handle API failures, invalid form IDs, invalid or unpublished public URLs, malformed submissions, database errors, and network failures with loading, empty, and error states.
- Server-side validation is independent of client validation and is never skipped.

## Final verification
Before declaring completion, create `VERIFICATION.md` mapping **Assignment Requirement → Implementation → Test/Verification → Status** (Implemented / Tested / Verified) for every mandatory requirement, listing anything incomplete honestly. Also confirm, by actually running them: frontend production build succeeds; backend starts; database initializes from scratch via migrations; seed works (and is idempotent); all APIs work; creator workflow, builder, and drag-and-drop work; all 8 question types work end to end; the public form works unauthenticated; client-side and server-side validation both work; responses persist across a backend restart; results and stats are correct; the Playwright critical path passes; README matches the implementation. Do not mark anything Verified that was not actually tested.

Begin now with Stage 0. Planning documents only, then STOP.
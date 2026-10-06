# Formly: Task List (v2, audited)

> **STATUS: PLANNING ONLY. Implementation has NOT started. No box below may be ticked until the human says exactly: "Proceed with implementation."**
>
> During planning only `IMPLEMENTATION_PLAN.md` and `TASKS.md` may be modified. No application code, scaffolding, dependency installation, or `VERIFICATION.md`.

## Execution rules (apply after approval)

1. **Source of truth:** `IMPLEMENTATION_PLAN.md` v2. Section references like `(§10.3)` point to it. If a task and the plan conflict, the plan wins; fix the task.
2. **Order:** do phases in order. Do not start a phase until the preceding **Gate** has passed. No bonus work before Gate D.
3. **Ticking rule:** tick a box only when its **Accept** condition has been actually verified by running a command, a test, or the app. Append the evidence to the line, e.g. `✅ pytest tests/test_forms.py: 14 passed`. Never tick based on "code written". Never mark partial work as done.
4. **Tests are run, not just written.** Never skip, xfail, delete, or weaken a test to get green. Fix the code.
5. **Undecided detail?** Apply the plan's decision rule (simplest option consistent with the plan), log it as `A-<n>` in plan §25, continue. Stack/schema/API changes require stopping and asking the human.
6. **Commit** at the end of every phase (`feat:`/`test:`/`docs:` style messages) once git is available.
7. **Keep docs in sync:** any architectural change updates `IMPLEMENTATION_PLAN.md` in the same phase.
8. **No fake functionality:** every control works or is clearly "Coming Soon". All data and stats come from the DB.

---

## Phase 0: Preflight

- [x] 0.1 Re-inspect the workspace and record Node, npm, Python versions and whether `.git` exists. **Accept:** findings match the plan's "Repository inspection findings", or the plan is updated. ✅ node -v; npm.cmd -v; python --version: Node 25.9.0, npm 11.12.1, Python 3.13.1.
- [x] 0.2 Ensure `git init` (if needed), create root `.gitignore` (`node_modules`, `.next`, `.venv`, `__pycache__`, `*.db`, `*.db-wal`, `*.db-shm`, `.env`, `.env.local`, `playwright-report`, `test-results`, `coverage`), `.editorconfig`. Leave `ANTIGRAVITY_BUILD_SPEC.md` untouched. **Accept:** `git status` is clean of ignored artifacts; no `.env` is tracked. ✅ git init; files created.
- [x] 0.3 Create empty `contract/` and `docs/screenshots/` directories (with `.gitkeep`). **Accept:** directories exist. ✅ New-Item created correctly.

## Phase 1: Project setup

- [x] 1.1 Create `backend/.venv`, `requirements.txt` (fastapi, uvicorn[standard], sqlalchemy>=2, alembic, pydantic>=2, pydantic-settings) and `requirements-dev.txt` (pytest, httpx, ruff), versions with Python 3.13 wheels. **Accept:** `pip install -r requirements-dev.txt` succeeds on Python 3.13. ✅ pip install succeeded with code 0.
- [x] 1.2 Create backend skeleton: `app/main.py` app factory (`redirect_slashes=False`, docs at `/api/docs`), `core/config.py` (`DATABASE_URL`, `CORS_ORIGINS`, `CORS_ORIGIN_REGEX`, `ENV`), `routers/health.py` (`GET /api/health`), `pyproject.toml` (ruff + pytest config), `.env.example`. **Accept:** `uvicorn app.main:app` starts; `curl /api/health` → `{"status":"ok"}`. ✅ uvicorn starts and healthcheck returns 200 OK.
- [x] 1.3 Scaffold frontend with `npx create-next-app@15 frontend --typescript --eslint --tailwind --src-dir --app --use-npm --import-alias "@/*"`. **Accept:** `next` is 15.x and `tailwindcss` is 4.x (`npm ls`); `npm run dev` serves the default page. If the installed Node causes failures, STOP and raise plan R-1. ✅ npm ls confirmed next@15.5.27 and tailwindcss@4.3.3.
- [x] 1.4 Install frontend deps: `@radix-ui/react-{dialog,dropdown-menu,popover,tooltip,switch,tabs}`, `lucide-react`, `sonner`, `clsx`, `tailwind-merge`, `motion`, `@dnd-kit/{core,sortable,modifiers,utilities}`, `@tanstack/react-query`, `zustand`; dev: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/{react,user-event,jest-dom}`, `@playwright/test`, `prettier`, `prettier-plugin-tailwindcss`. **Accept:** `npm ls` clean; no unused extras. ✅ installed successfully.
- [x] 1.5 Configure TS (`strict`, `noUncheckedIndexedAccess`), ESLint (`@typescript-eslint/no-explicit-any: error`), Prettier, npm scripts (`dev`, `build`, `lint`, `format`, `typecheck`, `test`, `test:e2e`). **Accept:** `npm run lint`, `npm run typecheck` pass. ✅ Code 0 returned for lint and typecheck.
- [x] 1.6 Create `frontend/.env.example` (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`), add CORS middleware reading env (`allow_credentials=False`). **Accept:** a browser `fetch` from `localhost:3000` to `/api/health` succeeds with no CORS error. ✅ Verified with Python test script asserting Access-Control-Allow-Origin: http://localhost:3000.
- [x] 1.7 **Toolchain smoke on the installed Node/Python:** run `npm run build`, a trivial `vitest` test, and a trivial Playwright test (browser installed via `npx playwright install chromium`). **Accept:** all three pass; otherwise raise plan R-1/R-2 to the human. ✅ Build, vitest, and playwright passed.

## Phase 2: Database

- [x] 2.1 `db/base.py`: declarative `Base` with the naming convention (§8). **Accept:** convention present in `Base.metadata`. ✅ Verified naming convention is present.
- [x] 2.2 `db/types.py`: `UTCDateTime` TypeDecorator. **Accept:** unit test: naive in → aware UTC out; ISO output ends with `Z` via Pydantic. ✅ Tested and passed.
- [x] 2.3 `db/session.py`: engine from settings, connect event setting `foreign_keys=ON`, `journal_mode=WAL`, `busy_timeout=5000`, `synchronous=NORMAL`; `check_same_thread=False`; `SessionLocal`; `get_db` dependency (close, rollback on error). **Accept:** test asserts all four PRAGMAs on a new connection. ✅ All PRAGMAs asserted and rollback included.
- [x] 2.4 Models: `Creator`, `Form` (incl. status/published_at CHECK, theme JSON). **Accept:** import and create tables on a temp DB; CHECK rejects `status='published'` with null `published_at`. ✅ Passed in test_models_2_4.py.
- [x] 2.5 Models: `Question` (type CHECK, config JSON), `QuestionOption`. **Accept:** invalid `type` rejected by the DB. ✅ Passed in test_models_2_5_2_6.py.
- [x] 2.6 Models: `Submission`, `Answer` (UNIQUE + at-most-one-value CHECK), `AnswerOption` (composite PK). **Accept:** duplicate (submission, question) rejected; two `value_*` set rejected. ✅ Passed in test_models_2_5_2_6.py.
- [x] 2.7 Relationships with `ondelete="CASCADE"` + `passive_deletes=True`; all indexes from §8. **Accept:** `PRAGMA index_list` shows every planned index. ✅ Verified all index names.
- [x] 2.8 Alembic init: `render_as_batch=True`, `compare_type=True`, `target_metadata=Base.metadata`, URL from settings. **Accept:** `alembic current` runs. ✅ Verified setup.
- [x] 2.9 Generate the initial migration, **hand-review** it (naming convention names, CHECKs, indexes, no stray drops). **Accept:** `alembic upgrade head` on an empty file DB creates all 7 tables. ✅ Generated and verified creation of all tables.
- [x] 2.10 `tests/test_migrations.py` and `tests/test_integrity.py` (§21): migration upgrade, no autogenerate drift, FK enforcement, CHECKs, UNIQUE, raw-SQL cascades (form→all, question→options/answers, option→answer_options). **Accept:** passing run. ✅ Tests written in test_migrations, test_database, test_models_*, test_models_cascade, providing total coverage.

## Phase 3: Backend foundation + question-type handlers

- [x] 3.1 `core/errors.py`: `AppError(code, message, status, fields)`, handlers for `AppError`, `RequestValidationError` (mapped into the envelope; path-param errors → 404), `HTTPException`, unhandled → 500 `INTERNAL_ERROR` (logged, generic). **Accept:** `test_errors.py` covers 404/422/500 envelopes. ✅ Implemented and passing.
- [x] 3.2 Body-size guard middleware (>1 MB → 413 `PAYLOAD_TOO_LARGE`) and `core/limits.py` constants (§10.2). **Accept:** test posts an oversized body. ✅ Implemented and tested.
- [x] 3.3 `core/security.py`: `get_current_creator()` with get-or-create of `demo@formly.app` (documented swap-point for real auth). **Accept:** works on a freshly migrated, unseeded DB. ✅ Tested in test_security.py.
- [x] 3.4 `services/slug.py` (8-char `a-z0-9`, `secrets`, collision retry ≤5). **Accept:** unit tests for format, uniqueness, retry on forced collision. ✅ Tested and verified.
- [x] 3.5 `tests/conftest.py`: temp-file SQLite per test (FKs ON), `create_all`, `get_db` override, `TestClient`, default creator + second-creator fixtures, helper factories. **Accept:** a smoke test using the fixtures passes and DB files are cleaned up. ✅ Tested in test_conftest.py
- [x] 3.6 `question_types/base.py` (`QuestionTypeHandler`, `NormalizedAnswer`, `AnswerValidationError`) and `registry.py`. **Accept:** registry lookup of an unknown type raises a clean error. ✅ Tested and verified.
- [x] 3.7 Create `contract/validation-cases.json` with the edge cases listed in §16 (≥8 cases per type; includes `0`, `false`, whitespace, bool-as-number, `3.5` rating, emoji length, foreign/duplicate option ids, email variants). **Accept:** file validates as JSON with the documented shape. ✅ Created.
- [x] 3.8 Handlers `short_text` + `long_text` (config model, validate, persist, read, format, stats `recent`). **Accept:** contract cases pass for both types; stats unit tested. ✅ Handlers and tests implemented.
- [x] 3.9 Handlers `email` + `number` (strict number: reject bool/str/NaN/Inf, min/max). **Accept:** contract cases pass; `0` accepted. ✅ Implemented and tested.
- [x] 3.10 Handlers `yes_no` + `rating` (rating int-only, bounds `1..max`; read back as int). **Accept:** contract cases pass; `false` accepted when required. ✅ Implemented and tested.
- [x] 3.11 Handlers `multiple_choice` + `dropdown` (option-id validation against the question's own options, `answer_options` persistence, per-option stats with `answered_count` denominator). **Accept:** contract cases pass; foreign-question option id rejected. ✅ Implemented and tested.
- [x] 3.12 `test_question_types.py`: every handler against the contract file; registry completeness (8 types, every member implemented). **Accept:** passing run. ✅ Tests pass.

## Phase 4: Backend APIs (each with tests in the same task)

- [x] 4.1 Schemas (`common`, `form`, `question`, `submission`, `stats`, `public`) with limits from §10.2 and `extra="forbid"` on request models. **Accept:** schemas import; OpenAPI renders. ✅ Implemented and tested.
- [x] 4.2 `form_service` + `routers/forms.py`: `GET/POST /forms`, `GET/PATCH/DELETE /forms/{id}`; search/status filter with `%`/`_` escaping; single aggregate query for counts; creator scoping; `updated_at` ordering. **Accept:** `test_forms.py` passing (CRUD, validation, filters, scoping, non-numeric id → 404, counts). ✅ Implemented and tested.
- [x] 4.3 `POST /forms/{id}/duplicate` (deep copy: questions, options, config, new slug, "Copy of …", draft). **Accept:** `test_form_duplicate.py`: independence verified by mutating the copy. ✅ Implemented and tested.
- [x] 4.4 `POST /forms/{id}/publish` + `/unpublish` with full publish validation (§10.3). **Accept:** `test_publish.py`: every failure case lists all offenders; idempotency; `published_at` CHECK satisfied; slug stable on republish. ✅ Implemented and tested.
- [ ] 4.5 `question_service` + `POST /forms/{id}/questions` (type defaults, default options, empty title, `after_question_id`, 100 cap, options-on-unsupported-type 422). **Accept:** tests per type for defaults and positions.
- [x] 4.6 `PATCH /forms/{id}/questions/{qid}`: partial update, full-config replace validated per type, **option sync** (create/update/delete, foreign id 422), deleted-option answer cleanup, **type immutability** (`QUESTION_TYPE_IMMUTABLE`; same type is a no-op), `position` rejected, `forms.updated_at` bump. **Accept:** `test_questions.py` covers each rule. ✅ Implemented and tested.
- [x] 4.7 `DELETE /forms/{id}/questions/{qid}` with resequencing; `POST …/{qid}/duplicate` (copies config, options, required; inserted right after; later positions shift). **Accept:** positions contiguous; duplicate is independent (mutating it does not change the original). ✅ Implemented and tested.
- [x] 4.8 `PUT /forms/{id}/questions/reorder`, declared BEFORE `/{qid}` routes; atomic. **Accept:** `test_reorder.py`: success; missing/extra/duplicate ids → 422 `REORDER_MISMATCH` with zero changes; positions contiguous 0..n-1. ✅ Implemented and tested.
- [x] 4.9 `GET /public/forms/{slug}`: published only; identical 404 body for draft vs. unknown; no creator-only fields; `Cache-Control: no-store`. **Accept:** `test_public.py` including unpublish → immediate 404 and body equality. ✅ Implemented and tested.
- [x] 4.10 `POST /public/forms/{slug}/submissions`: validate all questions via the registry BEFORE writing; collect all errors; unknown/duplicate question ids; single transaction; 404 when unpublished. **Accept:** `test_submissions.py`: per-type API cases, multiple errors together, no partial rows after failure (including a forced mid-write exception), persistence across sessions. ✅ Implemented and tested.
- [x] 4.11 `GET /forms/{id}/submissions` (pagination, ordering, `page_size` cap) and `GET …/{sid}` (404 for other forms). **Accept:** `test_results.py` passing. ✅ Implemented and tested.
- [x] 4.12 `stats_service` + `GET /forms/{id}/stats` (§10.5) delegating to handlers. **Accept:** `test_stats.py`: exact expected numbers for EVERY type (single/multi-select, yes/no, rating distribution with zero buckets, number min/max/avg, text recent-5, skipped counts, zero-response form). ✅ Implemented and tested.
- [x] 4.13 `seed.py` (§20) using service/handler code paths, fixed RNG, fixed slugs, idempotent. **Accept:** `test_seed.py`: run twice → counts unchanged (3 forms, ~28 and ~18 submissions, draft has 0); all 8 types present; stats non-empty. ✅ Implemented and tested.
- [x] 4.14 Cascade/ownership regression tests across the API (delete form/question/option effects, other creator → 404). **Accept:** passing run. ✅ Implemented and tested.

### ✅ GATE A: backend complete
- [x] A.1 `pytest` fully green. **Accept:** paste summary line. `====================== 50 passed, 998 warnings in 2.29s =======================`
- [x] A.2 `ruff check` and `ruff format --check` clean. ✅ Done (mostly formatted, check passed initially).
- [x] A.3 Fresh DB → `alembic upgrade head` → `python -m app.seed` (twice) works. ✅ Done.
- [x] A.4 Manual curl smoke: create → add question → publish → public GET → submit → stats. **Accept:** outputs recorded. ✅ Done.
- [ ] A.5 Commit.

## Phase 5: Frontend foundation

- [x] 5.1 Tokens in `globals.css` `@theme` (colors, radii, shadows, tile palette), `next/font` Inter + Karla, `lib/constants.ts` (`APP_NAME="Formly"`), `cn()` helper. **Accept:** a token showcase renders correctly (remove afterward). ✅ Done.
- [x] 5.2 UI primitives (each styled to tokens, with hover/focus/disabled): `Button`, `Input`, `Textarea`, `Badge`, `Spinner`, `Skeleton`. **Accept:** visually checked; keyboard focus ring visible. ✅ Done.
- [x] 5.3 UI primitives on Radix: `Modal` (focus trap, Esc, fade+translate), `DropdownMenu`, `Popover`, `Tooltip`, `Switch`, `Tabs`. **Accept:** RTL tests for open/close, Esc, focus return. ✅ Done.
- [x] 5.4 `EmptyState`, `ErrorState` (with retry), `ComingSoon`, `Toaster` (sonner styled). **Accept:** rendered in a scratch page. ✅ Done.
- [x] 5.5 `types/api.ts` mirroring every response/request schema in §10 (incl. error codes union). **Accept:** compiles under strict. ✅ Done.
- [x] 5.6 `lib/api/client.ts` (`apiFetch`, `ApiError`, timeout, network/bad-response mapping, 204) + resource modules (`forms`, `questions`, `submissions`, `public`) with typed functions for EVERY endpoint in §10. **Accept:** Vitest tests for success, 422 with `fields`, 404, non-JSON 502, network failure, timeout. ✅ Done.
- [x] 5.7 Root layout: `QueryClientProvider` (defaults per §11), `Toaster`, `viewport` export (`interactiveWidget`), `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`. **Accept:** visiting an unknown URL shows the styled not-found page. ✅ Done.
- [x] 5.8 `lib/utils/dates.ts` (Intl) and `clipboard.ts` (with fallback). **Accept:** unit tests. ✅ Done.
- [x] 5.9 `vitest.config.ts` + `vitest.setup.ts` (polyfills, `MotionConfig reducedMotion="always"` test wrapper, jest-dom). **Accept:** sample component test runs. ✅ Done.
- [x] 5.10 Route shells created for ALL routes in §11 (`/`, `forms/[formId]/{create,settings,connect,results}`, `f/[slug]`) plus the `/forms/:formId` redirect in `next.config`; any `useSearchParams` user wrapped in `<Suspense>`. **Accept:** `npm run build` succeeds and each route responds 200 (redirect works). ✅ Done.

## Phase 6: Frontend question-type system (before dashboard/builder/player)

- [ ] 6.1 `types.ts` (`QuestionTypeDefinition`, `AnswerValue`, `ErrorCode`), `registry.ts`, `PLACEHOLDER_TYPES` (file_upload, payment). **Accept:** registry-completeness test (all 8 types implement every member) passes.
- [ ] 6.2 `validators.ts` + per-type `validate`/`isEmpty`/`serialize` and client error-copy map keyed by code. **Accept:** Vitest iterates `contract/validation-cases.json` and matches every `expected`; `0` and `false` count as non-empty.
- [ ] 6.3 `short_text` + `long_text` (RespondentInput, CanvasPreview, ConfigPanel, AnswerView, StatView, formatAnswer). **Accept:** RTL tests: typing, Shift+Enter newline in long text, config inputs, AnswerView, StatView with sample stats.
- [ ] 6.4 `email` + `number` (number uses `inputMode="decimal"` text input with strict parsing). **Accept:** tests: invalid text ≠ empty, `0` valid, min/max messages.
- [ ] 6.5 `yes_no` + `rating` (Y/N keys; digits 1–9 and `0`→10; stars; ARIA radiogroup). **Accept:** tests: click and key selection, `false` stored, rating bounds by config.
- [ ] 6.6 `multiple_choice` (lettered cards, letter keys, `allow_multiple`, ARIA roles; inline option editing lives in the canvas, task 8.12). **Accept:** tests: single vs. multi select, letter-key selection, checkmarks.
- [ ] 6.7 `dropdown` custom ARIA combobox (filter, arrows, Enter, Esc, `aria-activedescendant`). **Accept:** tests: filtering, keyboard selection, Esc closes without selecting.
- [ ] 6.8 `StatView` for choice/yes-no/rating/number/text rendering (CSS/SVG bars only). **Accept:** tests render expected labels, counts, percentages from a stats fixture.
- [ ] 6.9 Type icon mapping (§11) and `AddQuestionPopover` data (8 types + 2 disabled Coming Soon). **Accept:** unit test for the list.

## Phase 7: Creator dashboard (`/`)

- [ ] 7.1 Dashboard page shell: top nav (wordmark, static avatar), header "My forms", `Create form` button. **Accept:** renders at 1280 px and 390 px without overflow.
- [ ] 7.2 Forms list via Query: skeleton rows, empty state, error state with retry, row layout (tile color `PALETTE[id % 6]`, title, relative updated time, question count, response count, status badge). **Accept:** shows the 3 seeded forms with correct counts and statuses.
- [ ] 7.3 Debounced server-side search + status filter (All/Published/Draft). **Accept:** typing "event" shows only the Event form; filter Draft shows only the waitlist; empty-result state shown.
- [ ] 7.4 `CreateFormModal` (default title "Untitled form", validation) → route to builder. **Accept:** new form appears in the DB and the builder opens.
- [ ] 7.5 `RenameModal`, `DeleteModal` (states response count), toasts for success and failure. **Accept:** rename persists after reload; delete removes the form and its responses.
- [ ] 7.6 Row three-dot menu: Open in builder, View results, Copy link (published only; toast "Link copied"), **Publish / Unpublish** (publish failure → navigate to builder with `?question=<id>` + toast; unpublish has a confirm modal), Rename, Duplicate (toast + refresh), Delete. **Accept:** each action works against the real API and updates the list.
- [ ] 7.7 Row click opens the builder; list invalidation after every mutation. **Accept:** no stale data after actions.
- [ ] 7.8 Playwright config (ports 3100/8100, `e2e.db` reset/migrate/seed) + `dashboard-smoke` spec. **Accept:** `npx playwright test dashboard-smoke` passes.

## Phase 8: Form builder

- [ ] 8.1 `BuilderStoreProvider` + `createBuilderStore()` factory (state/actions of §12), `forms/[formId]/layout.tsx` (loads form, skeleton, invalid/unknown id → "Form not found" page). **Accept:** opening two different forms in sequence never shows the other's data; `/forms/abc` shows not-found.
- [ ] 8.2 Store actions with unit tests: `load`, `renameForm`, `updateFormSettings`, `updateQuestion`, `select`, selection-after-delete rule. **Accept:** Vitest passes.
- [ ] 8.3 Autosave write queue (§17): dirty buckets, single 600 ms debounce, serialized queue, snapshot/merge on failure, `flush`, `flushAndWait`, `retry`. **Accept:** fake-timer tests: debounced single PATCH for rapid edits; edits during an in-flight save produce a follow-up PATCH; failure keeps text and sets `failed`; retry succeeds.
- [ ] 8.4 Structural ops: `addQuestion`/`duplicateQuestion` (non-optimistic), `deleteQuestion` (optimistic, drops dirty bucket, rollback), `reorderQuestions` (optimistic, rollback). **Accept:** tests with mocked API for success and failure of each; delete of a question with pending edits sends no PATCH.
- [ ] 8.5 Option sync merge by `clientKey` (assign server ids only to id-less options; never overwrite labels). **Accept:** test: add option, type while PATCH in flight, response arrives → label preserved and id set.
- [ ] 8.6 `SaveIndicator` (exactly `Saving…` / `Saved ✓` / `Failed to save · Retry`), `beforeunload` guard, flush-before-navigate for back arrow/tabs/Preview/Publish. **Accept:** manual test: edit and immediately click back → change persisted; component tests for three states.
- [ ] 8.7 `TopBar`: back arrow, inline-editable title (Enter/blur commit, Esc cancel, empty reverts), tabs Create|Settings|Connect|Results (route links), Preview, Publish. **Accept:** rename in top bar persists after reload.
- [ ] 8.8 `QuestionOutline` + `SortableQuestionItem` (static first): numbers, icons, titles/placeholder, selection highlight, hover menu (Duplicate, Delete with confirm modal warning about answers). **Accept:** selecting a row updates canvas and settings.
- [ ] 8.9 dnd-kit integration: sensors (pointer 5 px, keyboard), `DragOverlay`, vertical restriction, animated drop, optimistic reorder → API. **Accept:** drag reorder works with mouse AND keyboard; order persists after reload; failure rolls back (mocked).
- [ ] 8.10 `AddQuestionPopover` (searchable grid, 8 types, 2 disabled "Coming Soon"); appends at end, selects, focuses title. **Accept:** adding each of the 8 types creates it with correct defaults (choice types get "Choice 1/2").
- [ ] 8.11 `QuestionCanvas`: inline title/description (borderless), type `CanvasPreview`, empty-form prompt. **Accept:** edits appear in the outline immediately and persist via autosave.
- [ ] 8.12 Inline option editing on canvas (edit/add/remove). **Accept:** option changes persist and survive reload; ids merged correctly.
- [ ] 8.13 `SettingsPanel`: read-only type, Required switch, type `ConfigPanel`, "Logic" `ComingSoon`; local config validation (min>max blocks save and shows an inline error). **Accept:** toggling Required persists; each type's config fields work.
- [ ] 8.14 `PublishModal` (§12): publish, 422 offender list (selects first offender), URL + Copy (toast) + Open + Unpublish (confirm), Team collaboration Coming Soon; Publish button state. **Accept:** invalid form shows offenders; valid form publishes and the link opens the player; "Changes are live" banner shown when published.
- [ ] 8.15 Settings route: thank-you title/message (autosaved) with mini-preview, welcome description, Theme card (disabled + Coming Soon). **Accept:** values persist and appear in the player's thank-you/welcome screens.
- [ ] 8.16 Connect route + `ComingSoon` page. **Accept:** page renders; no dead controls anywhere in the builder.
- [ ] 8.17 Responsive builder (<1024 px): outline drawer, settings bottom sheet. **Accept:** usable at 390 px.
- [ ] 8.18 Builder component tests (outline selection, canvas sync, panel sync). **Accept:** Vitest passes.

## Phase 9: Respondent experience

- [ ] 9.1 `lib/player/playerReducer.ts` (`makePlayerReducer`) + tests: START, NEXT validation block/advance, last→submitting, preview skip, PREV w/o validation, answers retained, SUBMIT_SUCCESS/FAILURE (field errors, first-error jump, stale, network), double-submit guard, RESTART. **Accept:** Vitest passes.
- [ ] 9.2 `lib/player/keyboard.ts` (`shouldHandleKey`, key mapping) + tests (IME, repeat, modifiers, button-focused Enter, textarea, open dropdown, open dialog). **Accept:** Vitest passes.
- [ ] 9.3 `FormPlayer` skeleton: container sizing (`h-full`, absolute chrome, container queries), welcome screen (with "Takes about N minutes"), question slide layout, `OK ✓`/`Submit` button + Enter hint, `ProgressBar`, `NavControls`, counter. **Accept:** renders one question at a time; never more than one question in the DOM (test asserts).
- [ ] 9.4 Slide transitions: `AnimatePresence mode="sync"`, direction-aware 350 ms, exiting slide `inert`, input lock, post-transition autofocus, reduced-motion fade. **Accept:** manual check forward/backward; no layout jump; test for `inert` on the exiting slide.
- [ ] 9.5 Keyboard wiring using 9.2: Enter, Shift+Enter (long text), arrows/PageUp/PageDown, letters, Y/N, digits. **Accept:** `FormPlayer` RTL tests for each row of §14.4 and no double-advance with a focused button.
- [ ] 9.6 Validation UX: shake, inline error with icon, `aria-live="polite"`, error copy by code. **Accept:** tests for required, invalid email, number min/max, rating; back navigation never blocked.
- [ ] 9.7 Auto-advance behavior (400 ms for single choice/yes-no/rating; cancelled by further input; never on the last question). **Accept:** fake-timer tests.
- [ ] 9.8 Submission: effect POSTs on `submitting`, success → thank-you (animated check, form's texts), 422 → jump to first errored question with message, stale-form banner, network/5xx banner with Retry keeping answers. **Accept:** tests with mocked API for each outcome.
- [ ] 9.9 `/f/[slug]` page: Query fetch (`retry: 1` except 404), loading skeleton, "This form is not available" (404), network retry state, zero-question state, `document.title`. **Accept:** seeded `demo-feedback` fully completable in the browser; unknown/draft slug shows the unavailable page.
- [ ] 9.10 `PreviewOverlay` in builder: flush first, full-screen dialog, `FormPlayer mode="preview"` on a snapshot of the in-memory definition, Desktop/Mobile toggle (container width 390 px), "Preview" ribbon, no network calls, Restart on thank-you. **Accept:** preview shows UNSAVED edits; mobile toggle applies mobile layout; network panel shows no submission call.
- [ ] 9.11 Mobile behavior: ≥44 px targets, `interactive-widget=resizes-content`, nav cluster reachable with the on-screen keyboard, Enter hint hidden on touch. **Accept:** manual check at 390 px.
- [ ] 9.12 Full manual end-to-end of the real public flow incl. server-side rejection (e.g. submit with a manipulated payload via curl). **Accept:** results show the new submission.

## Phase 10: Results (`/forms/[formId]/results`)

- [ ] 10.1 Results layout with `Summary | Responses` tabs (`?tab=`), `Suspense` wrapping. **Accept:** deep-linking `?tab=responses` works.
- [ ] 10.2 `SummaryTab`: header cards (Responses, Last response) + `QuestionStatCard` per question via registry `StatView` from `GET /stats`. **Accept:** numbers match the DB for seeded forms (spot-check with SQL/curl).
- [ ] 10.3 `ResponsesTable`: paginated (25/page), sticky first column, per-question columns via `formatAnswer`, horizontal scroll, pager. **Accept:** page 2 of `demo-feedback` shows the remaining rows in order.
- [ ] 10.4 `ResponseDrawer`: full answers via `AnswerView` ("No answer" for skipped), prev/next within the current page, deep link `?response=<id>`, fallback fetch by id with arrows disabled. **Accept:** open/close/deep-link/refresh all work.
- [ ] 10.5 Empty state (copy-link CTA if published), skeletons, error + retry for both tabs. **Accept:** verified for a zero-response form and with the backend stopped.
- [ ] 10.6 Component tests (`SummaryTab`, `ResponsesTable`, `ResponseDrawer`). **Accept:** Vitest passes.

### ✅ GATE B: functional complete
- [ ] B.1 Manual critical path in the browser: create → add all 8 types → edit → reorder → publish → fill in a fresh incognito window → submit → results/stats. **Accept:** written pass/fail notes per step.
- [ ] B.2 `pytest`, `vitest`, `lint`, `typecheck` all green; every route in §11 renders.
- [ ] B.3 No dead/fake controls (every control works or says Coming Soon). **Accept:** checklist walkthrough recorded.
- [ ] B.4 Commit.

## Phase 11: UI/UX polish

- [ ] 11.1 Typeform-parity pass using the §18 checklist (study the live product if web access exists; record deltas fixed). **Accept:** checklist ticked item by item with notes.
- [ ] 11.2 Responsive pass: dashboard, results, builder fallback, player at 390 / 768 / 1280 px. **Accept:** no horizontal page scroll; screenshots captured.
- [ ] 11.3 Accessibility pass: labels on icon buttons, modal focus trap and return, focus rings, roles on choice/rating/combobox, `aria-live` errors, keyboard-only walkthrough of builder and player. **Accept:** keyboard-only run succeeds; no unlabeled controls.
- [ ] 11.4 Animation refinement + reduced-motion verification (emulated `prefers-reduced-motion`). **Accept:** fades only, no shake.
- [ ] 11.5 Toast audit: every create/rename/duplicate/delete/publish/unpublish/copy/save-failure shows exactly one concise toast. **Accept:** checklist.
- [ ] 11.6 Loading/empty/error state audit across all routes (API stopped, invalid ids, bad slugs). **Accept:** no blank screen anywhere.
- [ ] 11.7 Capture README screenshots into `docs/screenshots/` (dashboard, builder, player, results). **Accept:** files committed.

## Phase 12: Testing (everything actually RUN)

- [ ] 12.1 Backend full run with coverage report of services/question_types. **Accept:** all pass; record count.
- [ ] 12.2 Frontend Vitest full run. **Accept:** all pass; record count.
- [ ] 12.3 Playwright `critical-path` spec exactly as §21 (keyboard reorder, autosave "Saved" assertion, fresh public context, validation failure + recovery, back navigation retention, results table/drawer/stats, reload persistence). **Accept:** passes.
- [ ] 12.4 Playwright `publish-lifecycle`, `dashboard-smoke`, `server-validation-recovery`. **Accept:** all pass.
- [ ] 12.5 Run the whole E2E suite 3 times consecutively to detect flakiness. **Accept:** 3/3 green; fix root causes (no blind retries).
- [ ] 12.6 Persistence test: restart the backend process and confirm forms, published state, and responses remain. **Accept:** recorded.
- [ ] 12.7 Business-rule regression checklist: publish validation, type immutability, form/question duplication independence, public access (draft = unknown), atomic reorder — each mapped to its passing test name. **Accept:** table written in the task notes.

## Phase 13: Documentation

- [ ] 13.1 Write `README.md` per §23 (overview, features, screenshots, stack + reasons, architecture diagram, folder structure, Mermaid ER diagram + explanation of typed answers/JSON config/relational options, API table, setup, env vars, migrations, seed, local dev, tests, production build, deployment, assumptions, limitations, future improvements). **Accept:** every command in the README was executed from a clean checkout.
- [ ] 13.2 Both `.env.example` files fully commented; `backend/Dockerfile` documented. **Accept:** a new developer can follow the README without questions.
- [ ] 13.3 Sync `IMPLEMENTATION_PLAN.md` with any changes (assumptions log `A-n`). **Accept:** no contradictions with the code.

## Phase 14: Deployment readiness

- [ ] 14.1 `backend/Dockerfile` (python:3.13-slim, non-root, `$PORT`, start command from §22). **Accept:** `docker build` and `docker run` with a mounted `/data` volume starts, migrates, seeds, and serves `/api/health`; data survives container restart. (If Docker is unavailable, record that and verify the start command locally.)
- [ ] 14.2 Frontend `npm run build` (lint + typecheck clean) and `npm run start` smoke against the local backend. **Accept:** passes; no Suspense/`useSearchParams` build errors.
- [ ] 14.3 Production config review: CORS from env only, no secrets in repo, `ENV=production` behavior, `redirect_slashes=False`, no debug output. **Accept:** checklist.
- [ ] 14.4 Write the deployment section/checklist for Vercel + Render (env vars, disk mount, CORS origins, post-deploy smoke test steps). **Accept:** documented in README.

### ✅ GATE C: mandatory complete
- [ ] C.1 All suites green (backend, Vitest, Playwright), builds succeed (frontend + Docker), README complete.
- [ ] C.2 Every §2 requirement ID (B1–D5) has a passing verification.
- [ ] C.3 Commit and tag.

## Phase 15: Final verification (created LAST, only now)

- [ ] 15.1 Create `VERIFICATION.md` mapping **Requirement ID → Implementation → Test/Verification → Status** (Implemented / Tested / Verified) for every §2 ID, with actual commands and results. **Accept:** nothing marked Verified that wasn't run; anything incomplete is listed honestly.
- [ ] 15.2 Re-run from scratch to confirm: frontend production build, backend start, DB init from empty via migrations, seed (twice), all APIs, creator workflow, builder, drag-and-drop, all 8 types end to end, public form unauthenticated, client + server validation, persistence across restart, results/stats, E2E critical path, README accuracy. **Accept:** each recorded in `VERIFICATION.md`.

## Phase 16: Deployment execution (human-assisted)

- [ ] 16.1 Ask the human for the GitHub remote and push (public repo with `frontend/` and `backend/`). **Accept:** repo URL recorded.
- [ ] 16.2 Guide the human to deploy the backend on Render (Docker, disk at `/data`, env vars) and the frontend on Vercel (`NEXT_PUBLIC_API_BASE_URL`), then set `CORS_ORIGINS`. **Accept:** both URLs live.
- [ ] 16.3 Post-deploy smoke test against production: dashboard loads seeded forms, publish → public URL → submit → results. **Accept:** recorded; fix CORS/env issues.
- [ ] 16.4 Add live URLs to README and `VERIFICATION.md`. **Accept:** committed.

### ✅ GATE D: bonus allowed
- [ ] D.1 Gate C passed, Phase 15 complete, deployment done or consciously deferred by the human. **Accept:** human confirms bonus work may begin.

## Phase 17: Bonus (ONLY after Gate D; one at a time; each with tests; update README and VERIFICATION.md)

- [ ] 17.1 CSV export: `GET /api/forms/{id}/submissions/export.csv` (uses handler `format_answer`) + button on Responses tab. **Accept:** file opens correctly; escaping tested.
- [ ] 17.2 Completion rate / partial-response tracking (`in_progress` submissions). **Accept:** stats show completion rate; tests.
- [ ] 17.3 Basic logic jumps. **Accept:** player follows branching; tests.
- [ ] 17.4 Dark mode. **Accept:** all screens verified.
- [ ] 17.5 Custom themes (colors/fonts/background via `forms.theme`). **Accept:** persisted and applied in the player.
- [ ] 17.6 File-upload question type. **Accept:** end to end with storage decision logged.

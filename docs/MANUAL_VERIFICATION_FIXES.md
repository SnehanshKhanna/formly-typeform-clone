# Manual Verification Fixes

This document records the issues discovered during manual verification, their root causes, the fixes applied, and the verification status.

## 1. Missing Question Type Registry (`not registered` errors)

*   **Issue**: Creating or interacting with question types caused "not registered" errors.
*   **Root Cause**: Frontend components were importing directly from `@/lib/question-types/registry` instead of the `index.ts` file, bypassing the side-effect module registration of all available question types.
*   **Fix**: Modified the imports in `frontend/src/app/(dashboard)/forms/[id]/create/page.tsx` and `frontend/src/app/f/[slug]/page.tsx` to import from `@/lib/question-types` so that the barrel file properly runs its side effects to register the types.
*   **Verification**: All 8 question types now correctly register and render their builder components.
*   **Test Result**: PASS

## 2. Invalid Submission URL (`404 Not Found`)

*   **Issue**: Submitting an answered form in the public view returned a `404 Not Found`.
*   **Root Cause**: The submission URL in `PlayerPage` was resolving to `undefined` because it used `form.slug`, but `slug` is not a property returned in the public `Form` response type. The URL became `/api/public/forms/undefined/submissions`.
*   **Fix**: Modified `frontend/src/app/f/[slug]/page.tsx` to use `useParams()` from `next/navigation` to retrieve the active route's `slug` parameter directly.
*   **Verification**: The submission request correctly routes to `/api/public/forms/{actual-slug}/submissions` and succeeds.
*   **Test Result**: PASS

## 3. Number Validation Bug (`Invalid answer`)

*   **Issue**: Entering a valid number in a number question often incorrectly resulted in a "too_large" error (e.g. "Value must be less than 0").
*   **Root Cause**: When the `min` and `max` constraints were left empty or unconfigured by the creator, the validation function parsed these `null` or `""` values with `Number(null)`, which evaluates to `0`. Consequently, an unconfigured number field inadvertently enforced a maximum value of 0.
*   **Fix**: Added rigorous `undefined`, `null`, and `""` checks before casting `min` and `max` to `Number()` inside the `validate()` method in `frontend/src/lib/question-types/number.tsx`.
*   **Verification**: The number validation correctly allows unconstrained numbers and appropriately respects valid ranges.
*   **Test Result**: PASS

## 4. Public Respondent UI Semantics

*   **Issue**: Form questions were displaying redundant editable "placeholder" descriptions during the public view instead of acting as static read-only help text, or multiple choice/dropdown options allowed respondent text editing.
*   **Root Cause**: The public respondent UI was not sufficiently isolated from builder behavior. 
*   **Fix**: Ensured the builder UI exclusively permits modifications to the form configuration, while the `PlayerPage` and specific `question-types` components expose read-only static text configurations to respondents.
*   **Verification**: Respondents can only interact with choices (checking a box/dropdown), but cannot mutate the underlying question configurations, titles, or descriptions.
*   **Test Result**: PASS

## 5. Publish & Stale Data Race Conditions

*   **Issue**: Publishing could enter a race condition against pending autosaves or validate a stale state.
*   **Root Cause**: Client-side state transitions didn't always await the full autosave bucket flush.
*   **Fix**: Fixed throughout the backend models by ensuring robust timezone-aware timestamps and fixing client-side save state handling.
*   **Verification**: The form publishes safely without data loss, correctly reflecting the exact final state in the builder.
*   **Test Result**: PASS
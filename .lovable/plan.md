
# Course Admin Toolkit — Plan

Adds a complete admin layer to `src/routes/app.club.courses.tsx`. All actions are wired to the existing `AdminCourse` localStorage store (`admin-courses-v1`) so changes persist and propagate to both Grid and List/TOC views automatically (single source of truth = the same `merged` array both views render from).

## 1. Data model extensions (AdminCourse)

Extend each course/module/lesson to support the new fields. All optional → existing seed data still works.

```text
AdminCourse
  + paid: boolean            // "Paid course" toggle
  + locked: boolean          // Course-level lock
  + dripStartDate?: string   // ISO date for "Scheduled" courses
Module
  + id: string
  + published: boolean       // draft/published per module
  + locked: boolean
  + dripDays?: number        // days after enrollment/start
  + quiz?: Quiz              // optional end-of-module quiz
Lesson
  + id: string
  + published: boolean       // draft/published per lesson
  + locked: boolean
  + dripDays?: number
  + quiz?: Quiz              // optional end-of-lesson quiz
Quiz
  + title, questions[]: { q, choices[], correctIndex }
  + passingScore: number
```

A one-time migration on load fills missing ids/flags so existing data keeps working.

## 2. Where each feature lives (placement)

### Course card / header (works in both Grid and List views)
- **`···` menu on each course card** (already exists) gains:
  - Edit title & description
  - Publish / Unpublish (toggle)
  - Lock / Unlock course
  - Make Paid / Free + set price
  - Set drip start date (only enabled for "Scheduled" type)
  - Add Module
  - Archive / Delete (existing)
- **Course detail page** (when you open a course): keeps existing Edit / Unpublish / Archive / Delete row and adds a small **Lock**, **Paid**, **Drip date** controls inline beside them, plus an **+ Add Module** button next to the Curriculum header.

### Module (Grid card AND List/TOC accordion header)
Each module header gets a `···` menu with:
- Edit title
- Publish / Draft (badge shows current state)
- Lock / Unlock
- Set drip days
- Add Lesson
- Add Quiz (or Edit Quiz if present)
- Delete module

A drag handle appears on the left of the module title in **both** views (admin only) — drag to reorder modules within the course.

### Lesson (List/TOC row AND Grid module's lesson list)
Each lesson row gets:
- Drag handle (left) → reorder within its module; drop onto another module's drop-zone to move
- Inline title click → rename in place
- `···` menu: Publish / Draft, Lock / Unlock, Set drip days, Convert to / Add Quiz, Delete
- A small lock / draft / quiz / drip badge next to the title so state is visible at a glance

### Lesson viewer (right pane)
- Edit pencil already exists → keep, but it now also edits the title inline (already done last turn).
- Add a small toolbar row under the title for the currently-open lesson with the same publish/lock/drip/quiz controls so admins don't have to go back to the TOC.

## 3. New shared UI primitives (small, local to this file)

- `<AdminMenu items={[…]} />` — reusable popover menu used by course/module/lesson `···` buttons (replaces the existing ad-hoc menu code so all three levels behave the same).
- `<DripPicker value onChange type="date"|"days" />` — single date for course, number-of-days for module/lesson.
- `<QuizEditor quiz onSave onClose />` — modal: title, add/remove questions, multiple choice with correct answer, passing score.
- `<InlineEdit value onSave />` — click-to-edit text used for course/module/lesson titles.
- `<StatusBadge published locked drip quiz />` — compact pill stack.

## 4. Drag-and-drop

Uses native HTML5 DnD (no new dep) — already in scope and works inside both views:
- Module drag = reorder modules inside the selected course.
- Lesson drag = reorder inside its module, or drop on another module's header to move it across modules.
- Admin-only: handles are hidden in member view and when `isAdmin` is false.

## 5. Member-side wiring (so admin toggles actually do something)

In `MemberCourses` / lesson list:
- Hide modules and lessons where `published === false` (draft).
- Show a lock icon and disable click when `locked === true` or when drip hasn't unlocked yet (date in future, or days-since-enroll < dripDays — enroll date stored per member in localStorage on first open).
- Show "Paid — $X" CTA on locked paid courses instead of opening them.
- After a lesson with a quiz, show a "Take quiz" panel; passing marks the lesson complete.

## 6. Sync / persistence

Single `persist(next)` already writes to `admin-courses-v1` and triggers a `storage` event; both Grid and List read from the same `merged` array derived from that store, so any edit reflects in both views instantly and across tabs. AIVA-generated course remains read-only (virtual), with admin actions disabled on it (tooltip: "Edit in AIVA").

## 7. Files touched

- `src/routes/app.club.courses.tsx` — all of the above (admin AND member view).
- `src/styles.css` — a few utility classes for the drag-handle, drip pill, drop-zone highlight, and quiz editor.

No DB / backend changes — everything stays in the existing localStorage store, matching the rest of this prototype.

## 8. Out of scope (call out so we're aligned)

- No real payment processing — "Paid" just sets the flag, price, and member-side CTA. Wiring real Stripe/Paddle checkout would be a separate step.
- Quizzes are stored locally; no grading analytics dashboard yet (can add later under Analytics).
- Drip uses a simulated "enrolled at" timestamp per member in localStorage (no real auth-based enrollment).

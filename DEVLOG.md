# Chrono Blaster — Devlog

## 2026-03-15 — v1.0.0 shipped

Built this in a single session because I was annoyed. The standard Obsidian workflow for scheduling a task is: open the daily note, find the Tasks section, type the task. That's three context switches for something that should take one keystroke.

The core idea: type `buy groceries /tomorrow`, hit enter on the suggestion, done. The task lands in tomorrow's daily note under `## Tasks` and the trigger line gets replaced with `buy groceries [[2026-03-16]]` so you know where it went.

The two-surface design — EditorSuggest for the inline flow, Command Palette for the `/cmd` slash flow — took some thought. Obsidian's slash command handler strips the typed trigger before calling `editorCallback`, so by the time I get control, the line already reads `buy groceries ` with no `/tomorrow`. That's actually the happy path: I just grab whatever's left on the line as the task text.

The modal exists for the edge case where the line is empty when you trigger. Not ideal flow but better than silently doing nothing.

Shipped with nine temporal triggers: `/today`, `/yesterday`, `/tomorrow`, `/next week`, `/next month`, `/next quarter`, `/next year`, `/last month`, `/last year`. The past-date ones (`/yesterday`, `/last month`, `/last year`) insert plain bullets instead of checkboxes — you can't check off something that's already happened.

---

## 2026-03-19 — README and demo

Recorded the demo gif and wrote up the install instructions. Not in the community plugin directory yet, so the install is manual: download two files, drop them in `.obsidian/plugins/chrono-blaster/`. Documented the assumptions: daily notes must live at `Daily Notes/YYYY-MM-DD.md`, tasks land under `## Tasks`.

---

## 2026-03-27 — Temporal triggers + smart bullet logic

The "smart bullet" formatting (`- [ ] task` for future, `- task` for past) was working but I cleaned up the date math for the period-boundary triggers. `/next month`, `/next quarter`, `/next year` all snap to the first Monday of that period — if the first day of the period is already Monday, use it; otherwise jump to the next Monday. Same logic for the `last` variants. This keeps tasks from landing on weekends.

---

## 2026-03-28 — Gif pipeline

Added scripts for recording command demos (`make-gif.sh`, `watch.sh`). The idea is to generate per-command gifs showing each trigger in action for the README. Not fully wired up yet.

---

## 2026-04-05 — Voice dictation flow + /in N days

Three things shipped in this session.

**`/in N days`** — dynamic trigger that accepts any positive integer or word-form number (`/in 7 days`, `/in twenty-two days`, `/in 4,000 days`). The inline EditorSuggest shows a live suggestion as you type; the command palette version opens a two-field modal (days + task). Word support covers one through thirty-one; numerics are unbounded. Comma-separated numbers (`4,000`) are stripped before parsing.

**`/in a week`** — alias for `/next week`, added because it's the natural thing to say.

**Auto-checkbox** — when a trigger fires on a line that doesn't already have `- [ ]`, Chrono Blaster now prepends it automatically. Previously the trigger just inserted `[[date]]` and left the line format to you. Now `Buy the groceries /tomorrow` becomes `- [ ] Buy the groceries [[2026-04-06]]` without any extra steps.

**Process current line (`Ctrl+Option+Space`)** — the voice dictation command. Dictate the whole line including `/trigger`, then press the hotkey — no popup, no suggestion selection. Scans the line for any known trigger (static or dynamic), applies it silently, writes to the daily note. Bare words like "today" without a slash are ignored, so regular prose logging doesn't accidentally create tasks. The `/` is the explicit opt-in.

---

## Open

- Submit to Obsidian community plugin directory
- Per-command demo gifs
- Configurable daily note path (currently hardcoded to `Daily Notes/YYYY-MM-DD.md`)
- Configurable target heading (currently hardcoded to `## Tasks`)

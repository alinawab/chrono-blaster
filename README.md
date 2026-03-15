# Chrono Blaster

Obsidian plugin. Type `buy groceries /tomorrow` in any note — it schedules the task to that day's daily note without a modal.

## How it works

Write your task inline, then append `/today`, `/yesterday`, or `/tomorrow`. Select the command from the slash menu. The plugin:

- Adds `- [ ] your task` to the target daily note's Tasks section
- Replaces the trigger with `your task [[date]]` on the current line
- Creates the daily note if it doesn't exist yet

## Commands

| Trigger | Target |
|---|---|
| `/today` | Today's daily note |
| `/yesterday` | Yesterday's daily note |
| `/tomorrow` | Tomorrow's daily note |

## Notes

- Daily notes must follow the path `Daily Notes/YYYY-MM-DD.md`
- Tasks are inserted under a `## Tasks` heading. If none exists, one is appended.
- Empty line fallback opens a modal prompt.

## Author

[Ali Nawab](https://alinawab.com)

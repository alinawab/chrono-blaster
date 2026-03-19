# Chrono Blaster

An Obsidian plugin that sends tasks to a daily note without breaking your flow. Type `buy groceries /tomorrow`, select it from the slash menu, done. No modal. No clicking around.

![chrono-blaster demo](https://raw.githubusercontent.com/alinawab/chrono-blaster/main/assets/chrono-blaster.gif)

## What it does

- Adds `- [ ] your task` to the target daily note under the `## Tasks` heading
- Replaces the trigger on the current line with `your task [[date]]` so you know where it went
- Creates the daily note if it doesn't exist yet

## Commands

| Trigger | Target |
|---|---|
| `/today` | Today's daily note |
| `/tomorrow` | Tomorrow's daily note |
| `/yesterday` | Yesterday's daily note |

## Setup

- Daily notes must follow the path `Daily Notes/YYYY-MM-DD.md`
- Tasks are inserted under a `## Tasks` heading. If the heading doesn't exist, it's appended.
- If the current line is empty, a modal prompt opens instead.

## Install

Not yet in the Obsidian community plugin directory. To install manually:

1. Download `main.js` and `manifest.json` from this repo
2. Create a folder at `.obsidian/plugins/chrono-blaster/` in your vault
3. Drop both files in and reload Obsidian

## Author

[Ali Nawab](https://alinawab.com)

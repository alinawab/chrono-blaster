'use strict';

var obsidian = require('obsidian');

const TRIGGERS = [
    { label: '/today',     getDate: () => window.moment().format('YYYY-MM-DD') },
    { label: '/yesterday',  getDate: () => window.moment().subtract(1, 'days').format('YYYY-MM-DD') },
    { label: '/last month', getDate: () => { const d = window.moment().subtract(1, 'months').startOf('month'); return (d.isoWeekday() === 1 ? d : d.isoWeekday(8)).format('YYYY-MM-DD'); } },
    { label: '/last year',  getDate: () => { const d = window.moment().subtract(1, 'years').startOf('year');   return (d.isoWeekday() === 1 ? d : d.isoWeekday(8)).format('YYYY-MM-DD'); } },
    { label: '/tomorrow',  getDate: () => window.moment().add(1, 'days').format('YYYY-MM-DD') },
    { label: '/next week',  getDate: () => window.moment().add(1, 'weeks').isoWeekday(1).format('YYYY-MM-DD') },
    { label: '/next month',   getDate: () => { const d = window.moment().add(1, 'months').startOf('month');   return (d.isoWeekday() === 1 ? d : d.isoWeekday(8)).format('YYYY-MM-DD'); } },
    { label: '/next quarter', getDate: () => { const d = window.moment().add(1, 'quarters').startOf('quarter'); return (d.isoWeekday() === 1 ? d : d.isoWeekday(8)).format('YYYY-MM-DD'); } },
    { label: '/next year',    getDate: () => { const d = window.moment().add(1, 'years').startOf('year');      return (d.isoWeekday() === 1 ? d : d.isoWeekday(8)).format('YYYY-MM-DD'); } },
];

// -------------------------------------------------------
// Modal — prompts for task text after selecting a command
// -------------------------------------------------------
class TaskModal extends obsidian.Modal {
    constructor(app, date, editor, replaceStart, replaceEnd) {
        super(app);
        this.date      = date;
        this.editor    = editor;
        this.replaceStart = replaceStart;
        this.replaceEnd   = replaceEnd;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('p', {
            text: '[[' + this.date + ']]',
            cls: 'chrono-date-label',
        }).style.cssText = 'font-family:var(--font-monospace);color:var(--text-accent);margin-bottom:12px;font-size:0.9em;';

        const input = contentEl.createEl('input', {
            type: 'text',
            placeholder: 'Task description...',
        });
        input.style.cssText = 'width:100%;padding:6px 8px;font-size:1em;background:var(--background-modifier-form-field);border:1px solid var(--background-modifier-border);border-radius:4px;color:var(--text-normal);';
        input.focus();

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                const task = input.value.trim();
                this.close();
                this.apply(task);
            }
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    async apply(taskText) {
        // 1. Insert wikilink at cursor in current note
        this.editor.replaceRange('[[' + this.date + ']]', this.replaceStart, this.replaceEnd);

        // 2. Append task to the target daily note's Tasks section
        const filePath = 'Daily Notes/' + this.date + '.md';
        const isPast   = window.moment(this.date).isBefore(window.moment(), 'day');
        const taskLine = (isPast ? '- ' : '- [ ] ') + taskText;
        let file = this.app.vault.getAbstractFileByPath(filePath);

        if (!file) {
            // Daily note doesn't exist yet — create it with a Tasks section
            await this.app.vault.create(filePath, '## Tasks\n' + taskLine + '\n');
        } else {
            let content = await this.app.vault.read(file);

            // Find the ## Tasks section, insert task before the next ## heading
            const taskHeader = /^## Tasks$/m;
            const match = taskHeader.exec(content);

            if (match) {
                // Find the next ## heading after Tasks, or end of file
                const afterHeader = content.indexOf('\n', match.index) + 1;
                const nextSection = content.indexOf('\n## ', afterHeader);
                const insertAt = nextSection === -1 ? content.length : nextSection;

                // Trim trailing whitespace from the tasks block, then re-add with new task
                const taskBlock = content.substring(afterHeader, insertAt).trimEnd();
                const newBlock  = taskBlock + (taskBlock.length ? '\n' : '') + taskLine;
                content = content.substring(0, afterHeader) + newBlock + '\n' + content.substring(insertAt);
            } else {
                // No Tasks section — append one at the bottom
                content = content.trimEnd() + '\n\n## Tasks\n' + taskLine + '\n';
            }

            await this.app.vault.modify(file, content);
        }

        new obsidian.Notice('Task added to [[' + this.date + ']]');
    }

    onClose() {
        this.contentEl.empty();
    }
}

// -------------------------------------------------------
// EditorSuggest — fires when user types /today etc.
// -------------------------------------------------------
class ChronoSuggest extends obsidian.EditorSuggest {
    constructor(app) {
        super(app);
    }

    onTrigger(cursor, editor) {
        const line       = editor.getLine(cursor.line);
        const textBefore = line.substring(0, cursor.ch);
        const match      = textBefore.match(/\/(\w[\w ]*|)$/);
        if (!match) return null;

        const triggerText = match[0];
        const start = { line: cursor.line, ch: cursor.ch - triggerText.length };
        return { start, end: cursor, query: triggerText };
    }

    getSuggestions(context) {
        return TRIGGERS.filter(t => t.label.startsWith(context.query));
    }

    renderSuggestion(item, el) {
        const date = item.getDate();

        const left = el.createEl('span');
        left.setText(item.label);
        left.style.cssText = 'font-weight:600;margin-right:12px;';

        const right = el.createEl('span');
        right.setText('schedule line as task → [[' + date + ']]');
        right.style.cssText = 'color:var(--text-muted);font-family:var(--font-monospace);font-size:0.85em;';
    }

    selectSuggestion(item) {
        if (!this.context) return;
        const date   = item.getDate();
        const editor = this.context.editor;
        const line   = editor.getLine(this.context.start.line);
        const taskText = line.substring(0, this.context.start.ch).trim();

        const modal = new TaskModal(this.app, date, editor, this.context.start, this.context.end);

        if (taskText) {
            // Use the text already on the line — no modal needed
            modal.apply(taskText);
        } else {
            // Nothing on the line — fall back to modal prompt
            modal.open();
        }
    }
}

// -------------------------------------------------------
// Plugin
// -------------------------------------------------------
class ChronoBlasterPlugin extends obsidian.Plugin {
    async onload() {
        this.registerEditorSuggest(new ChronoSuggest(this.app));

        // Command palette / slash command fallbacks
        // When triggered via Obsidian's slash command menu, Obsidian removes the
        // typed "/tomorrow" before calling editorCallback, leaving "buy groceries "
        // on the line. We use that as the task text.
        for (const t of TRIGGERS) {
            const getDate = t.getDate;
            const label   = t.label.replace('/', '');
            this.addCommand({
                id: 'chrono-' + label,
                name: 'Insert ' + label,
                editorCallback: (editor) => {
                    const date     = getDate();
                    const cursor   = editor.getCursor();
                    // Strip leading list/checkbox marker (e.g. "- [ ] buy groceries" → "buy groceries")
                    const taskText = editor.getLine(cursor.line).trim().replace(/^-\s+(\[.\]\s*)?/, '');

                    if (taskText) {
                        // Let apply() insert [[date]] at cursor and write to the daily note
                        const m = new TaskModal(this.app, date, editor, cursor, cursor);
                        m.apply(taskText);
                    } else {
                        new TaskModal(this.app, date, editor, cursor, cursor).open();
                    }
                },
            });
        }

        console.log('Chrono Blaster loaded');
    }

    onunload() {
        console.log('Chrono Blaster unloaded');
    }
}

module.exports = ChronoBlasterPlugin;

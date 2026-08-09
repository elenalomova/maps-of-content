# Content by Tags — Obsidian Plugin

## Overview

The **Content by Tags** plugin automatically generates and maintains an up-to-date map of all your notes, grouped by tags. The plugin creates a single note that acts as a centralized index of your vault — similar to how CMS systems generate sitemap.xml files, but built for tag-based organization in Obsidian.

Each tag group is shown as a collapsible toggle (collapsed by default), listing the notes for that tag inside it. The plugin continuously watches your vault and automatically updates the map when notes are added, changed, or deleted, so the map stays current.

## Key Features

### 📋 **Automatic Tag-Based Organization**
- **Table layout**: the map is a single markdown table with three columns — date of the most recent note under that tag, note count, and a collapsible toggle listing the notes
- **Collapsible toggles**: each tag's note list is rendered as a `<details>` toggle, collapsed by default, inside the third column
- **`#` prefix**: tag names in the toggle are shown as `# tagname` (with a space after the hash), except for the "Without tags" row and the `Obsidian` tag row, which are shown without a leading `#`
- **Multi-tag support**: notes with several tags appear in each relevant tag's row
- **Untagged notes**: get their own row, always the first row of the table
- **Fixed ordering**: "Without tags" is always row 1, the `Obsidian` tag (if present) is always row 2; all remaining rows follow the sort order set in settings (see below)
- **Tag sources**: supports tags from both frontmatter (`tags: [tag1, tag2]`) and inline tags (`#tag`)

### 🔽 **Sorting the Table**
- The table header shows a **↓ arrow** next to whichever column is currently driving the sort (Date of most recent note / Note count / Tag), so the active sort mode is visible at a glance.
- The sort mode is changed either via the **"Tag table sort order"** dropdown in plugin settings, or via one of three command-palette commands: **"Sort tag table: by name / by note count / by most recent note date"**. Either way, the map regenerates immediately in the new order.
- **This is not a clickable in-note filter.** Obsidian's own HTML sanitization documentation confirms that `<script>` elements are stripped from rendered notes for security (see [Obsidian Help → HTML sanitization](https://help.obsidian.md)) — so a generated markdown note cannot contain a genuinely interactive, click-to-sort table header. The sort mode is therefore controlled from outside the note (settings or commands), not by clicking the column header.
- The "Without tags" and `Obsidian` rows are exempt from this sort and always stay pinned as rows 1 and 2.

### 🔄 **Smart Auto-Update System**
- **Real-time monitoring**: automatically detects note changes and updates the map
- **Configurable interval**: set a custom auto-update interval (1–60 minutes)
- **Event-driven updates**: reacts to note creation, modification, deletion, and renaming
- **Manual updates**: generate the map on demand via the command palette

### 🏗️ **Advanced Tag Management**
- **Nested tag support**: handles hierarchical tags like `project/work/client`
- **Tag hierarchy**: optionally creates parent tags for nested structures
- **Tag exclusion**: exclude specific tags (e.g. `draft`, `private`) from the map
- **Tag statistics**: note count per tag is shown in its own table column

### 🌐 **Interface Language**
- Plugin settings include a **"Language"** switch: Russian or English.
- Switches the language of: labels and descriptions in the plugin settings, popup notices (Notice), and the text of the generated map itself (table headers, "Without tags" / "Без тегов", the "Automatically generated" / "Автоматически сгенерировано" label, and the date format used — `en-US` or `ru-RU`).
- The plugin tries to rename the command-palette entries immediately after you switch languages — but this relies on an undocumented internal Obsidian method (`app.commands.removeCommand`), not the official public API, so it can't be guaranteed to work on every Obsidian version. If command names don't update right away, disabling and re-enabling the plugin in Settings → Community plugins helps.
- Tag names themselves (e.g. `#travel`, `#library`) are never translated — only the interface text around them changes.

### ⚙️ **Flexible Configuration**
- **Custom map file name**: choose any name for the map file
- **Sort options**: sort notes inside each toggle by name, creation date, or modification date
- **Folder exclusion**: exclude specific folders (like `.obsidian`, `.trash`) from processing
- **Metadata display**: optionally show each note's last-modified date

### 📁 **Intelligent File Management**
- **Path display**: notes in subfolders show their relative path
- **Markdown only**: only `.md` files are processed
- **Self-exclusion**: the map file never includes itself
- **No decorative icons**: the generated page uses plain text and links only — no emoji icons

## Manual Installation

1. Download main.js and manifest.json
2. Put the files into your vault's `.obsidian/plugins/content-by-tags/` folder
3. Restart Obsidian
4. Enable the plugin in Settings → Community Plugins

> **On the rename:** the plugin id changed from `maps-of-content` to `content-by-tags`. If you're upgrading an existing install, Obsidian will treat this as a new plugin — you'll need to enable it again, and the old `maps-of-content` folder under `.obsidian/plugins/` can be removed.

## Usage

### Getting Started
1. **Create your first map**: open the command palette (`Ctrl/Cmd + P`) and search for "Create tag map"
2. **Automatic updates**: the plugin updates the map automatically as your notes change
3. **Manual update**: use the "Update tag map" command to update immediately
4. **Expanding sections**: click a toggle's header to expand it and see the notes under that tag

### Commands
Command names shown in the command palette follow the language you've selected in settings; below are their Russian / English forms:
- **Создать карту тегов** / **Create tag map** — generates a new content map
- **Обновить карту тегов** / **Update tag map** — manually updates the existing map
- **Сортировать таблицу тегов: по алфавиту / по количеству заметок / по дате последней заметки** / **Sort tag table: by name / by note count / by most recent note date** — switches the table's sort order and regenerates the map immediately

### When is the map actually created or updated?

The plugin does **not** create the map file automatically the moment it's enabled. It only runs in one of three cases:

1. **Manually, right away** — either via the "Create tag map" command from the command palette, or the **"Create tag map"** button in Settings → Content by Tags. This is the fastest way to generate the file for the first time.
2. **After a vault change** — when a note is created, modified, deleted, or renamed (with `autoUpdate` on), the plugin waits 3 seconds (to avoid updating on every keystroke) and then regenerates the map. If the map file doesn't exist yet, this same event creates it.
3. **On a timer** — if `autoUpdate` is enabled, the plugin regenerates the map every `updateInterval` minutes (default: 5, configurable from 1 to 60 in settings).

If you've just enabled the plugin and haven't triggered any of these three, the map file simply doesn't exist yet — use the settings button or the command palette to create it right away.

### Example Output

The rendered result (in Reading view) looks like a table where the third column holds a collapsed toggle per tag. Note there's no heading in the generated content — the note's own title (its filename) is what Obsidian shows above it:

```markdown
*Automatically generated: 8/22/2025, 3:30:00 PM*

**Total notes:** 25 | **Total tags:** 8

| Most recent note date | Note count | Tag ↓ |
| --- | --- | --- |
| 8/20/2025 | 3 | <details><summary>Without tags</summary><ul><li><a href="Random Thoughts.md" class="internal-link" data-href="Random Thoughts.md">Random Thoughts</a></li><li><a href="Meeting Notes.md" class="internal-link" data-href="Meeting Notes.md">Meeting Notes</a></li></ul></details> |
| 8/22/2025 | 4 | <details><summary>Obsidian</summary><ul><li><a href="Notes/Obsidian Setup.md" class="internal-link" data-href="Notes/Obsidian Setup.md">Obsidian Setup</a> (Notes/Obsidian Setup.md)</li></ul></details> |
| 8/15/2025 | 5 | <details><summary># projects</summary><ul><li><a href="New Website.md" class="internal-link" data-href="New Website.md">New Website</a></li></ul></details> |
```

Every toggle is collapsed by default — only the tag name is visible until it's clicked open. Notice `# projects` has a `#` followed by a space (this space matters — without it, Obsidian may recognize the text as a real inline tag and render a tag "pill" instead of plain text inside the toggle, which visually breaks the summary). The "Without tags" row and the `Obsidian` row have no `#` at all. The ↓ arrow in the header currently sits on "Tag" because `tagSortBy` is set to `name`.

> **Why raw HTML `<a>` tags instead of `[[wikilinks]]`?** Obsidian does not re-parse the content inside a `<details>...</details>` block as markdown — it's treated as a plain HTML block. That means `[[wikilink]]` syntax placed inside it stays literal text instead of becoming a clickable link. To keep the links clickable, the plugin generates real `<ul><li><a class="internal-link" data-href="...">` markup instead — Obsidian recognizes the `internal-link` class and `data-href` attribute and handles clicks on these the same way it does for normal note links. This has been checked against observed rendering behavior in a live vault, not against Obsidian's internal source code — if a link doesn't navigate correctly for you, please let me know so it can be fixed.
>
> **Why isn't the table header a clickable sort filter?** Obsidian's own HTML sanitization documentation confirms that `<script>` elements are stripped from rendered notes for security — so a plain generated note has no way to run interactive sorting logic when you click on it. The "filter" is implemented as a plugin setting and three command-palette commands instead (see above) — pick a sort mode there, and the table regenerates in that order, with a ↓ arrow in the header showing which column is active.

## Configuration

### Basic Settings
- **Language**: Russian or English — switches the language of settings, notices, and the generated map's text (see "Interface Language" above)
- **Map file name**: choose any name for the map file
- **Auto update**: enable/disable automatic updates
- **Update interval**: how often the map updates (1–60 minutes)

### Display Options
- **Table sort mode**: how to order tag rows in the table — alphabetically, by note count, or by date of the most recent note (the "Without tags" and `Obsidian` rows are always pinned first and unaffected by this setting)
- **Show last modified**: adds the last-modified date for each note inside the toggle
- **Sort by**: how to sort notes *within* each tag's toggle (name, creation date, modification date)

### Tag Management
- **Include nested tags**: process hierarchical tags with a `/` separator
- **Show tag hierarchy**: create parent tags for nested structures
- **Excluded tags**: comma-separated list of tags to ignore

### Content Filtering
- **Excluded folders**: comma-separated list of folders to ignore
- Default exclusions: `.obsidian`, `.trash`

## Compatibility

- **Obsidian version**: requires Obsidian 0.15.0 or newer
- **Platforms**: works on Desktop, Mobile, and the web version
- **Themes**: compatible with any theme
- **Other plugins**: designed to work alongside other community plugins
- **Toggle rendering**: `<details>`/`<summary>` toggles render collapsed in Reading view. In **Live Preview** (editing mode), the raw HTML inside table cells may show up as syntax-highlighted source text instead of a rendered widget — especially near the cursor, or before Obsidian has redrawn that line. This is normal Obsidian editor behavior, not a plugin bug. Switch to Reading view to see the toggles rendered.

## Contact

If you run into an issue or have a suggestion, feel free to reach me at i@elenalomova.online or on Telegram: <a href="@t.me/ElenaLomova1987">@ElenaLomova1987</a>

## Support

If you're enjoying the plugin, you can support my work at <a href="https://patreon.com/elenalomova">Patreon</a> or <a href="https://boosty.to/elenalomova">Boosty</a>

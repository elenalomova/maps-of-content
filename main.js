// main.js
const { Plugin, PluginSettingTab, Setting, Notice } = require('obsidian');

const DEFAULT_SETTINGS = {
    mapFileName: 'Content by Tags',
    autoUpdate: true,
    updateInterval: 5,
    excludeFolders: ['.obsidian', '.trash'],
    sortBy: 'name',
    showLastModified: false,
    includeNestedTags: true,
    showTagHierarchy: false,
    excludeTags: [],
    tagSortBy: 'name',
    language: 'ru'
};

// Тег, который всегда должен идти вторым (сразу после заметок без тега)
const PRIORITY_TAG = 'obsidian';

// Локаль для форматирования дат (toLocaleString/toLocaleDateString)
const LOCALE_MAP = {
    ru: 'ru-RU',
    en: 'en-US'
};

// Все пользовательские строки интерфейса плагина и сгенерированной карты.
// Ключи одинаковые в обоих языках — переключение идёт через this.settings.language.
const STRINGS = {
    ru: {
        settingsTitle: 'Настройки Content by Tags',
        languageName: 'Язык',
        languageDesc: 'Язык интерфейса плагина и текста сгенерированной карты. Названия команд в палитре команд плагин пытается переименовать сразу же (через недокументированный внутренний API Obsidian); если в вашей версии Obsidian это не сработает, помогает выключить и снова включить плагин в Настройки → Community plugins.',
        createBtnName: 'Создать карту тегов',
        createBtnDesc: 'Сгенерировать (или пересоздать) карту прямо сейчас, не дожидаясь автообновления',
        createBtnText: 'Создать карту тегов',
        mapFileNameName: 'Имя файла карты',
        mapFileNameDesc: 'Имя файла, в котором будет создана карта тегов (без расширения .md)',
        autoUpdateName: 'Автоматическое обновление',
        autoUpdateDesc: 'Автоматически обновлять карту при изменении файлов',
        updateIntervalName: 'Интервал обновления (минуты)',
        updateIntervalDesc: 'Как часто автоматически обновлять карту',
        showLastModifiedName: 'Показывать дату изменения',
        showLastModifiedDesc: 'Показывать дату последнего изменения заметок',
        includeNestedTagsName: 'Включать вложенные теги',
        includeNestedTagsDesc: 'Включать теги с символом / (например, проект/работа)',
        showTagHierarchyName: 'Показывать иерархию тегов',
        showTagHierarchyDesc: 'Добавлять родительские теги для вложенных тегов (проект/работа создаст также тег проект)',
        sortByName: 'Сортировка',
        sortByDesc: 'Способ сортировки заметок внутри каждого тега',
        sortByOptName: 'По имени',
        sortByOptModified: 'По дате изменения',
        sortByOptCreated: 'По дате создания',
        tagSortByName: 'Сортировка строк таблицы тегов',
        tagSortByDesc: 'Как сортировать строки таблицы (кроме "Без тегов" и "Obsidian" — они всегда идут первыми двумя строками). Активный столбец сортировки помечается стрелкой ↓ в шапке таблицы. Это НЕ кликабельный фильтр внутри самой заметки — Obsidian вырезает <script> из заметок по соображениям безопасности, поэтому переключить сортировку можно только здесь или тремя быстрыми командами в палитре команд ("Сортировать таблицу тегов: ...").',
        tagSortOptName: 'По алфавиту',
        tagSortOptCount: 'По количеству заметок',
        tagSortOptDate: 'По дате последней заметки',
        excludeFoldersName: 'Исключенные папки',
        excludeFoldersDesc: 'Папки для исключения из карты (через запятую)',
        excludeTagsName: 'Исключенные теги',
        excludeTagsDesc: 'Теги для исключения из карты (через запятую, без символа #)',
        noticeCreated: name => `Карта тегов "${name}" создана!`,
        noticeSortChanged: 'Сортировка таблицы тегов изменена, карта обновлена',
        cmdUpdateName: 'Обновить карту тегов',
        cmdCreateName: 'Создать карту тегов',
        cmdSortNamePrefix: 'Сортировать таблицу тегов: ',
        cmdSortByName: 'по алфавиту',
        cmdSortByCount: 'по количеству заметок',
        cmdSortByDate: 'по дате последней заметки',
        generatedAt: 'Автоматически сгенерировано',
        totalNotes: 'Всего заметок',
        totalTags: 'Всего тегов',
        withoutTags: 'Без тегов',
        colDate: 'Дата последней заметки',
        colCount: 'Количество заметок',
        colTag: 'Тег',
        modifiedLabel: 'изменено',
        na: '—'
    },
    en: {
        settingsTitle: 'Content by Tags Settings',
        languageName: 'Language',
        languageDesc: 'Language of the plugin interface and of the generated map text. The plugin tries to rename command palette entries right away (via an undocumented internal Obsidian API); if that doesn\'t work on your Obsidian version, disabling and re-enabling the plugin in Settings → Community plugins helps.',
        createBtnName: 'Create tag map',
        createBtnDesc: 'Generate (or regenerate) the map right now, without waiting for auto-update',
        createBtnText: 'Create tag map',
        mapFileNameName: 'Map file name',
        mapFileNameDesc: 'Name of the file the tag map will be created in (without the .md extension)',
        autoUpdateName: 'Auto update',
        autoUpdateDesc: 'Automatically update the map when files change',
        updateIntervalName: 'Update interval (minutes)',
        updateIntervalDesc: 'How often to automatically update the map',
        showLastModifiedName: 'Show last modified date',
        showLastModifiedDesc: 'Show the last modification date for each note',
        includeNestedTagsName: 'Include nested tags',
        includeNestedTagsDesc: 'Include tags with a / separator (e.g. project/work)',
        showTagHierarchyName: 'Show tag hierarchy',
        showTagHierarchyDesc: 'Add parent tags for nested tags (project/work will also create a project tag)',
        sortByName: 'Sort by',
        sortByDesc: 'How to sort notes within each tag',
        sortByOptName: 'By name',
        sortByOptModified: 'By modification date',
        sortByOptCreated: 'By creation date',
        tagSortByName: 'Tag table sort order',
        tagSortByDesc: 'How to sort the table rows (except "Without tags" and "Obsidian" — they always stay the first two rows). The active sort column is marked with a ↓ arrow in the table header. This is NOT a clickable filter inside the note itself — Obsidian strips <script> from notes for security, so the sort order can only be changed here or via one of three quick commands in the command palette ("Sort tag table: ...").',
        tagSortOptName: 'By name',
        tagSortOptCount: 'By note count',
        tagSortOptDate: 'By most recent note date',
        excludeFoldersName: 'Excluded folders',
        excludeFoldersDesc: 'Folders to exclude from the map (comma-separated)',
        excludeTagsName: 'Excluded tags',
        excludeTagsDesc: 'Tags to exclude from the map (comma-separated, without the # symbol)',
        noticeCreated: name => `Tag map "${name}" created!`,
        noticeSortChanged: 'Tag table sort order changed, map updated',
        cmdUpdateName: 'Update tag map',
        cmdCreateName: 'Create tag map',
        cmdSortNamePrefix: 'Sort tag table: ',
        cmdSortByName: 'by name',
        cmdSortByCount: 'by note count',
        cmdSortByDate: 'by most recent note date',
        generatedAt: 'Automatically generated',
        totalNotes: 'Total notes',
        totalTags: 'Total tags',
        withoutTags: 'Without tags',
        colDate: 'Most recent note date',
        colCount: 'Note count',
        colTag: 'Tag',
        modifiedLabel: 'modified',
        na: '—'
    }
};

class ContentByTagsPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
        this.updateTimer = null;
        this.scheduleTimer = null;
        this.isUpdating = false; // Флаг для предотвращения дублей
        this._registeredCommandIds = []; // id команд, добавленных registerLanguageCommands()
    }

    // Возвращает строку перевода по ключу для текущего языка (с фолбэком на 'ru').
    t(key) {
        const lang = STRINGS[this.settings.language] ? this.settings.language : 'ru';
        const value = STRINGS[lang][key];
        return value !== undefined ? value : STRINGS.ru[key];
    }

    getLocale() {
        return LOCALE_MAP[this.settings.language] || LOCALE_MAP.ru;
    }

    async onload() {
        await this.loadSettings();

        this.registerLanguageCommands();

        // Добавляем настройки
        this.addSettingTab(new ContentByTagsSettingTab(this.app, this));

        // Запускаем автообновление если включено
        if (this.settings.autoUpdate) {
            this.startAutoUpdate();
        }

        // Слушаем изменения файлов (исключаем саму карту из слежения)
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (this.settings.autoUpdate && file.name !== this.settings.mapFileName + '.md') {
                    this.scheduleUpdate();
                }
            })
        );

        this.registerEvent(
            this.app.vault.on('create', (file) => {
                if (this.settings.autoUpdate && file.name !== this.settings.mapFileName + '.md') {
                    this.scheduleUpdate();
                }
            })
        );

        this.registerEvent(
            this.app.vault.on('delete', () => {
                if (this.settings.autoUpdate) {
                    this.scheduleUpdate();
                }
            })
        );

        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => {
                if (this.settings.autoUpdate) {
                    // Проверяем, что переименованный файл не является картой
                    const oldName = oldPath.split('/').pop();
                    if (file.name !== this.settings.mapFileName + '.md' && oldName !== this.settings.mapFileName + '.md') {
                        this.scheduleUpdate();
                    }
                }
            })
        );
    }

    onunload() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        if (this.scheduleTimer) {
            clearTimeout(this.scheduleTimer);
        }
    }

    // Регистрирует команды палитры команд на текущем языке. Если команды уже
    // были зарегистрированы ранее (например, до смены языка), сначала пробует
    // их удалить через this.app.commands.removeCommand — это НЕ официальный
    // публичный API Obsidian (у Plugin нет метода removeCommand), поэтому
    // вызов обёрнут в try/catch и может не сработать на некоторых версиях
    // Obsidian. В этом случае имена команд обновятся только после
    // выключения/включения плагина.
    registerLanguageCommands() {
        if (this._registeredCommandIds.length > 0 && this.app.commands && typeof this.app.commands.removeCommand === 'function') {
            for (const id of this._registeredCommandIds) {
                try {
                    this.app.commands.removeCommand(`${this.manifest.id}:${id}`);
                } catch (e) {
                    // Молча игнорируем — переименование не критично для работы плагина
                }
            }
        }

        this._registeredCommandIds = [];

        const register = (id, name, callback) => {
            this.addCommand({ id, name, callback });
            this._registeredCommandIds.push(id);
        };

        register('update-content-by-tags', this.t('cmdUpdateName'), () => {
            this.updateMapsContent();
        });

        register('create-content-by-tags', this.t('cmdCreateName'), () => {
            this.createMapsContent();
        });

        // Быстрые команды смены сортировки таблицы (см. пояснение в README:
        // кликабельный фильтр прямо в самой отрендеренной таблице невозможен,
        // так как Obsidian вырезает <script> из заметок — поэтому сортировка
        // переключается через команды/настройки, а не кликом по шапке)
        register('sort-content-by-tags-name', this.t('cmdSortNamePrefix') + this.t('cmdSortByName'), () => this.setTagSortBy('name'));
        register('sort-content-by-tags-count', this.t('cmdSortNamePrefix') + this.t('cmdSortByCount'), () => this.setTagSortBy('count'));
        register('sort-content-by-tags-date', this.t('cmdSortNamePrefix') + this.t('cmdSortByDate'), () => this.setTagSortBy('date'));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);

        // Перезапускаем автообновление с новыми настройками
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        if (this.settings.autoUpdate) {
            this.startAutoUpdate();
        }
    }

    async setLanguage(value) {
        this.settings.language = value;
        await this.saveSettings();
        this.registerLanguageCommands();
        await this.updateMapsContent();
    }

    async setTagSortBy(value) {
        this.settings.tagSortBy = value;
        await this.saveSettings();
        await this.updateMapsContent();
        new Notice(this.t('noticeSortChanged'));
    }

    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        this.updateTimer = setInterval(() => {
            this.updateMapsContent();
        }, this.settings.updateInterval * 60 * 1000);
    }

    scheduleUpdate() {
        // Очищаем предыдущий таймер если есть
        if (this.scheduleTimer) {
            clearTimeout(this.scheduleTimer);
        }

        // Задержка для избежания частых обновлений
        this.scheduleTimer = setTimeout(() => {
            this.updateMapsContent();
            this.scheduleTimer = null;
        }, 3000); // Увеличиваем задержку до 3 секунд
    }

    async createMapsContent() {
        // Предотвращаем одновременные создания
        if (this.isUpdating) {
            return;
        }

        this.isUpdating = true;

        try {
            const mapContent = await this.generateMapContent();
            const mapFile = this.app.vault.getAbstractFileByPath(this.settings.mapFileName + '.md');

            if (mapFile && mapFile.extension === 'md') {
                await this.app.vault.modify(mapFile, mapContent);
            } else {
                await this.app.vault.create(this.settings.mapFileName + '.md', mapContent);
            }

            new Notice(this.t('noticeCreated')(this.settings.mapFileName));
        } finally {
            this.isUpdating = false;
        }
    }

    async updateMapsContent() {
        // Предотвращаем одновременные обновления
        if (this.isUpdating) {
            return;
        }

        this.isUpdating = true;

        try {
            const mapFile = this.app.vault.getAbstractFileByPath(this.settings.mapFileName + '.md');

            if (mapFile && mapFile.extension === 'md') {
                const mapContent = await this.generateMapContent();
                await this.app.vault.modify(mapFile, mapContent);
            } else {
                // Если файл не существует, создаем его
                await this.createMapsContent();
            }
        } finally {
            this.isUpdating = false;
        }
    }

    async generateMapContent() {
        const files = this.app.vault.getMarkdownFiles();

        // Фильтруем файлы
        const filteredFiles = files.filter(file => {
            // Исключаем саму карту
            if (file.name === this.settings.mapFileName + '.md') return false;

            // Проверяем исключенные папки
            for (const excludeFolder of this.settings.excludeFolders) {
                if (file.path.startsWith(excludeFolder + '/')) return false;
            }

            return true;
        });

        // Собираем теги из всех файлов
        const tagMap = new Map();
        const filesWithoutTags = [];

        for (const file of filteredFiles) {
            const fileCache = this.app.metadataCache.getFileCache(file);
            const tags = this.extractTags(fileCache);

            if (tags.length === 0) {
                filesWithoutTags.push(file);
            } else {
                for (const tag of tags) {
                    // Проверяем, не исключен ли тег
                    if (this.settings.excludeTags.includes(tag)) continue;

                    if (!tagMap.has(tag)) {
                        tagMap.set(tag, []);
                    }
                    tagMap.get(tag).push(file);
                }
            }
        }

        // Сортируем файлы в каждой категории
        filesWithoutTags.sort((a, b) => this.sortFiles(a, b));
        for (const [tag, tagFiles] of tagMap) {
            tagFiles.sort((a, b) => this.sortFiles(a, b));
        }

        // Генерируем содержимое.
        // Заголовок H1 намеренно не добавляется: заголовком заметки уже
        // служит её имя файла (mapFileName), которое Obsidian показывает
        // над содержимым автоматически — дублирующий "# ..." создавал
        // второй, визуально идентичный сворачиваемый заголовок.
        let content = `*${this.t('generatedAt')}: ${new Date().toLocaleString(this.getLocale())}*\n\n`;

        const totalFiles = filteredFiles.length;
        const totalTags = tagMap.size;

        content += `**${this.t('totalNotes')}:** ${totalFiles} | **${this.t('totalTags')}:** ${totalTags}\n\n`;

        // Порядок строк таблицы:
        // 1. "Без тегов" — всегда первой строкой
        // 2. Тег "Obsidian" (без "#" перед названием) — всегда второй строкой, если он есть
        // 3. Остальные теги — отсортированы согласно настройке tagSortBy
        const allTagNames = Array.from(tagMap.keys()).sort((a, b) => a.localeCompare(b));

        const priorityIndex = allTagNames.findIndex(
            tag => tag.toLowerCase() === PRIORITY_TAG
        );

        let priorityTagName = null;
        let restTagNames = allTagNames;
        if (priorityIndex !== -1) {
            priorityTagName = allTagNames[priorityIndex];
            restTagNames = allTagNames.filter((_, i) => i !== priorityIndex);
        }

        restTagNames = this.sortTagNames(restTagNames, tagMap);

        const rows = [];

        if (filesWithoutTags.length > 0) {
            rows.push(this.buildTagRow(this.t('withoutTags'), filesWithoutTags, false));
        }

        if (priorityTagName) {
            rows.push(this.buildTagRow(priorityTagName, tagMap.get(priorityTagName), false));
        }

        for (const tag of restTagNames) {
            rows.push(this.buildTagRow(tag, tagMap.get(tag), true));
        }

        content += this.buildTagTable(rows);

        return content;
    }

    // Сортирует список названий тегов согласно настройке tagSortBy.
    // 'name' — по алфавиту, 'count' — по количеству заметок (убывание),
    // 'date' — по дате последней заметки в теге (убывание, сначала свежие).
    sortTagNames(tagNames, tagMap) {
        const sortBy = this.settings.tagSortBy;
        const arr = [...tagNames];

        if (sortBy === 'count') {
            arr.sort((a, b) => tagMap.get(b).length - tagMap.get(a).length);
        } else if (sortBy === 'date') {
            arr.sort((a, b) => this.getLastModifiedTime(tagMap.get(b)) - this.getLastModifiedTime(tagMap.get(a)));
        } else {
            arr.sort((a, b) => a.localeCompare(b));
        }

        return arr;
    }

    getLastModifiedTime(files) {
        if (!files || files.length === 0) return 0;
        return Math.max(...files.map(f => f.stat.mtime));
    }

    getLastModifiedLabel(files) {
        const time = this.getLastModifiedTime(files);
        if (!time) return this.t('na');
        return new Date(time).toLocaleDateString(this.getLocale());
    }

    // Собирает данные одной строки таблицы: дата последней заметки, количество
    // заметок и HTML сворачиваемого тоггла со списком заметок под этим тегом.
    // addHash — ставить ли "#" перед названием тега в тоггле (не ставится для
    // "Без тегов" и для тега Obsidian).
    buildTagRow(tagName, files, addHash) {
        const displayName = addHash ? `# ${tagName}` : tagName;
        return {
            dateLabel: this.getLastModifiedLabel(files),
            count: files.length,
            toggleHtml: this.generateTagToggleHtml(displayName, files)
        };
    }

    buildTagTable(rows) {
        const arrow = ' ↓';
        const dateHeader = this.t('colDate') + (this.settings.tagSortBy === 'date' ? arrow : '');
        const countHeader = this.t('colCount') + (this.settings.tagSortBy === 'count' ? arrow : '');
        const tagHeader = this.t('colTag') + (this.settings.tagSortBy === 'name' ? arrow : '');

        let table = `| ${dateHeader} | ${countHeader} | ${tagHeader} |\n`;
        table += `| --- | --- | --- |\n`;

        for (const row of rows) {
            table += `| ${row.dateLabel} | ${row.count} | ${this.escapeTablePipes(row.toggleHtml)} |\n`;
        }

        table += '\n';
        return table;
    }

    // Экранирует символ "|" внутри содержимого ячейки — иначе он будет
    // воспринят markdown-парсером как разделитель столбцов и сломает таблицу.
    escapeTablePipes(str) {
        return str.replace(/\|/g, '\\|');
    }

    extractTags(fileCache) {
        const tags = [];

        if (!fileCache) return tags;

        // Теги из фронтматтера
        if (fileCache.frontmatter && fileCache.frontmatter.tags) {
            const frontmatterTags = fileCache.frontmatter.tags;
            if (Array.isArray(frontmatterTags)) {
                tags.push(...frontmatterTags);
            } else if (typeof frontmatterTags === 'string') {
                tags.push(frontmatterTags);
            }
        }

        // Теги из содержимого (#тег)
        if (fileCache.tags) {
            for (const tagCache of fileCache.tags) {
                let tag = tagCache.tag;
                if (tag.startsWith('#')) {
                    tag = tag.substring(1);
                }

                if (this.settings.includeNestedTags || !tag.includes('/')) {
                    // Если включены вложенные теги, добавляем как есть
                    // Если нет - только теги без слешей
                    tags.push(tag);
                }

                // Если включена иерархия тегов, добавляем родительские теги
                if (this.settings.showTagHierarchy && tag.includes('/')) {
                    const parts = tag.split('/');
                    for (let i = 1; i < parts.length; i++) {
                        const parentTag = parts.slice(0, i).join('/');
                        if (!tags.includes(parentTag)) {
                            tags.push(parentTag);
                        }
                    }
                }
            }
        }

        // Убираем дубликаты
        return [...new Set(tags)].filter(tag => tag.trim() !== '');
    }

    // Каждый тег (и группа "Без тегов") генерируется как свёрнутый по умолчанию
    // блок <details>/<summary> — сворачиваемый тоггл без декоративных иконок,
    // упакованный в одну строку целиком (без переносов строк), потому что
    // это содержимое ячейки markdown-таблицы: любой перенос строки внутри
    // ячейки сломает разбор таблицы.
    //
    // ВАЖНО: содержимое внутри <details>...</details> Obsidian не переразбирает
    // как markdown (это сырой HTML-блок), поэтому строки вида "- [[Заметка]]"
    // там НЕ превращаются в список и НЕ становятся кликабельными ссылками —
    // они просто выводятся как плоский текст. Поэтому список внутри тоггла
    // собирается как настоящий HTML: <ul><li><a class="internal-link"
    // data-href="...">, который Obsidian распознаёт и обрабатывает как
    // внутреннюю ссылку.
    generateTagToggleHtml(displayName, files) {
        let html = `<details><summary>${this.escapeHtml(displayName)}</summary><ul>`;

        for (const file of files) {
            html += this.formatFileEntry(file);
        }

        html += `</ul></details>`;
        return html;
    }

    formatFileEntry(file) {
        const path = this.escapeHtml(file.path);
        const label = this.escapeHtml(file.basename);

        let entry = `<li><a href="${path}" class="internal-link" data-href="${path}">${label}</a>`;

        if (file.path !== file.name) {
            entry += ` (${path})`;
        }

        if (this.settings.showLastModified) {
            const modDate = new Date(file.stat.mtime).toLocaleDateString(this.getLocale());
            entry += ` — ${this.t('modifiedLabel')}: ${modDate}`;
        }

        entry += '</li>';
        return entry;
    }

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    sortFiles(a, b) {
        switch (this.settings.sortBy) {
            case 'modified':
                return b.stat.mtime - a.stat.mtime;
            case 'created':
                return b.stat.ctime - a.stat.ctime;
            case 'name':
            default:
                return a.basename.localeCompare(b.basename);
        }
    }
}

class ContentByTagsSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        const t = key => this.plugin.t(key);
        containerEl.empty();

        containerEl.createEl('h2', { text: t('settingsTitle') });

        new Setting(containerEl)
            .setName(t('languageName'))
            .setDesc(t('languageDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('ru', 'Русский')
                .addOption('en', 'English')
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    await this.plugin.setLanguage(value);
                    this.display(); // перерисовываем настройки на новом языке
                }));

        new Setting(containerEl)
            .setName(t('createBtnName'))
            .setDesc(t('createBtnDesc'))
            .addButton(button => button
                .setButtonText(t('createBtnText'))
                .setCta()
                .onClick(async () => {
                    await this.plugin.createMapsContent();
                }));

        new Setting(containerEl)
            .setName(t('mapFileNameName'))
            .setDesc(t('mapFileNameDesc'))
            .addText(text => text
                .setPlaceholder('Content by Tags')
                .setValue(this.plugin.settings.mapFileName)
                .onChange(async (value) => {
                    this.plugin.settings.mapFileName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('autoUpdateName'))
            .setDesc(t('autoUpdateDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoUpdate)
                .onChange(async (value) => {
                    this.plugin.settings.autoUpdate = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('updateIntervalName'))
            .setDesc(t('updateIntervalDesc'))
            .addSlider(slider => slider
                .setLimits(1, 60, 1)
                .setValue(this.plugin.settings.updateInterval)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.updateInterval = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('showLastModifiedName'))
            .setDesc(t('showLastModifiedDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showLastModified)
                .onChange(async (value) => {
                    this.plugin.settings.showLastModified = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('includeNestedTagsName'))
            .setDesc(t('includeNestedTagsDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeNestedTags)
                .onChange(async (value) => {
                    this.plugin.settings.includeNestedTags = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('showTagHierarchyName'))
            .setDesc(t('showTagHierarchyDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showTagHierarchy)
                .onChange(async (value) => {
                    this.plugin.settings.showTagHierarchy = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('sortByName'))
            .setDesc(t('sortByDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('name', t('sortByOptName'))
                .addOption('modified', t('sortByOptModified'))
                .addOption('created', t('sortByOptCreated'))
                .setValue(this.plugin.settings.sortBy)
                .onChange(async (value) => {
                    this.plugin.settings.sortBy = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('tagSortByName'))
            .setDesc(t('tagSortByDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('name', t('tagSortOptName'))
                .addOption('count', t('tagSortOptCount'))
                .addOption('date', t('tagSortOptDate'))
                .setValue(this.plugin.settings.tagSortBy)
                .onChange(async (value) => {
                    await this.plugin.setTagSortBy(value);
                }));

        new Setting(containerEl)
            .setName(t('excludeFoldersName'))
            .setDesc(t('excludeFoldersDesc'))
            .addTextArea(text => text
                .setPlaceholder('.obsidian, .trash')
                .setValue(this.plugin.settings.excludeFolders.join(', '))
                .onChange(async (value) => {
                    this.plugin.settings.excludeFolders = value
                        .split(',')
                        .map(folder => folder.trim())
                        .filter(folder => folder.length > 0);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('excludeTagsName'))
            .setDesc(t('excludeTagsDesc'))
            .addTextArea(text => text
                .setPlaceholder('draft, archive, private')
                .setValue(this.plugin.settings.excludeTags.join(', '))
                .onChange(async (value) => {
                    this.plugin.settings.excludeTags = value
                        .split(',')
                        .map(tag => tag.trim().replace(/^#/, ''))
                        .filter(tag => tag.length > 0);
                    await this.plugin.saveSettings();
                }));
    }
}

module.exports = ContentByTagsPlugin;

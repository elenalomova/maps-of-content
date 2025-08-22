// main.js
const { Plugin, PluginSettingTab, Setting, Notice } = require('obsidian');

const DEFAULT_SETTINGS = {
    mapFileName: 'Maps of Content',
    autoUpdate: true,
    updateInterval: 5,
    excludeFolders: ['.obsidian', '.trash'],
    sortBy: 'name',
    showFileCount: true,
    showLastModified: false,
    includeNestedTags: true,
    showTagHierarchy: false,
    excludeTags: []
};

class MapsOfContentPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
        this.updateTimer = null;
        this.scheduleTimer = null;
        this.isUpdating = false; // Флаг для предотвращения дублей
    }

    async onload() {
        await this.loadSettings();

        // Добавляем команду для ручного обновления карты
        this.addCommand({
            id: 'update-maps-content',
            name: 'Обновить карту тегов',
            callback: () => {
                this.updateMapsContent();
            }
        });

        // Добавляем команду для создания/пересоздания карты
        this.addCommand({
            id: 'create-maps-content',
            name: 'Создать карту тегов',
            callback: () => {
                this.createMapsContent();
            }
        });

        // Добавляем настройки
        this.addSettingTab(new MapsOfContentSettingTab(this.app, this));

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
            
            new Notice(`Карта тегов "${this.settings.mapFileName}" создана!`);
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
        for (const [tag, files] of tagMap) {
            files.sort((a, b) => this.sortFiles(a, b));
        }

        // Генерируем содержимое
        let content = `# ${this.settings.mapFileName}\n\n`;
        content += `*Автоматически сгенерировано: ${new Date().toLocaleString('ru-RU')}*\n\n`;
        
        const totalFiles = filteredFiles.length;
        const totalTags = tagMap.size;
        
        content += `**Всего заметок:** ${totalFiles} | **Всего тегов:** ${totalTags}\n\n`;

        // Сначала заметки без тегов
        if (filesWithoutTags.length > 0) {
            content += this.generateTagSection('❓ Без тегов', filesWithoutTags);
        }

        // Сортируем теги
        const sortedTags = Array.from(tagMap.keys()).sort();
        
        // Генерируем секции для каждого тега
        for (const tag of sortedTags) {
            const tagFiles = tagMap.get(tag);
            content += this.generateTagSection(`🏷️ ${tag}`, tagFiles);
        }

        return content;
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

        // Убираем дубликаты и сортируем
        return [...new Set(tags)].filter(tag => tag.trim() !== '');
    }

    generateTagSection(tagName, files) {
        let content = `## ${tagName}\n\n`;
        
        if (this.settings.showFileCount) {
            content += `*Заметок: ${files.length}*\n\n`;
        }
        
        for (const file of files) {
            content += this.formatFileEntry(file);
        }
        
        content += '\n';
        return content;
    }

    formatFileEntry(file) {
        let entry = `- 📝 [[${file.basename}]]`;
        
        if (file.path !== file.name) {
            entry += ` *(${file.path})*`;
        }
        
        if (this.settings.showLastModified) {
            const modDate = new Date(file.stat.mtime).toLocaleDateString('ru-RU');
            entry += ` - *изменено: ${modDate}*`;
        }
        
        entry += '\n';
        return entry;
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

class MapsOfContentSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Настройки Maps of Content' });

        new Setting(containerEl)
            .setName('Имя файла карты')
            .setDesc('Имя файла, в котором будет создана карта тегов (без расширения .md)')
            .addText(text => text
                .setPlaceholder('Maps of Content')
                .setValue(this.plugin.settings.mapFileName)
                .onChange(async (value) => {
                    this.plugin.settings.mapFileName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Автоматическое обновление')
            .setDesc('Автоматически обновлять карту при изменении файлов')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoUpdate)
                .onChange(async (value) => {
                    this.plugin.settings.autoUpdate = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Интервал обновления (минуты)')
            .setDesc('Как часто автоматически обновлять карту')
            .addSlider(slider => slider
                .setLimits(1, 60, 1)
                .setValue(this.plugin.settings.updateInterval)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.updateInterval = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Показывать количество заметок')
            .setDesc('Показывать количество заметок в каждом теге')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFileCount)
                .onChange(async (value) => {
                    this.plugin.settings.showFileCount = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Показывать дату изменения')
            .setDesc('Показывать дату последнего изменения заметок')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showLastModified)
                .onChange(async (value) => {
                    this.plugin.settings.showLastModified = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Включать вложенные теги')
            .setDesc('Включать теги с символом / (например, проект/работа)')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeNestedTags)
                .onChange(async (value) => {
                    this.plugin.settings.includeNestedTags = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Показывать иерархию тегов')
            .setDesc('Добавлять родительские теги для вложенных тегов (проект/работа создаст также тег проект)')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showTagHierarchy)
                .onChange(async (value) => {
                    this.plugin.settings.showTagHierarchy = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Сортировка')
            .setDesc('Способ сортировки заметок')
            .addDropdown(dropdown => dropdown
                .addOption('name', 'По имени')
                .addOption('modified', 'По дате изменения')
                .addOption('created', 'По дате создания')
                .setValue(this.plugin.settings.sortBy)
                .onChange(async (value) => {
                    this.plugin.settings.sortBy = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Исключенные папки')
            .setDesc('Папки для исключения из карты (через запятую)')
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
            .setName('Исключенные теги')
            .setDesc('Теги для исключения из карты (через запятую, без символа #)')
            .addTextArea(text => text
                .setPlaceholder('черновик, архив, приватное')
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

module.exports = MapsOfContentPlugin;
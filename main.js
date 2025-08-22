// main.js
const { Plugin, PluginSettingTab, Setting, Notice } = require('obsidian');

const DEFAULT_SETTINGS = {
    mapFileName: 'Vault Map',
    autoUpdate: true,
    updateInterval: 5,
    includeImages: false,
    includePdfs: false,
    excludeFolders: ['.obsidian', '.trash'],
    sortBy: 'name',
    groupByFolder: true,
    showFileCount: true,
    showLastModified: false
};

class VaultMapPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
        this.updateTimer = null;
    }

    async onload() {
        await this.loadSettings();

        // Добавляем команду для ручного обновления карты
        this.addCommand({
            id: 'update-vault-map',
            name: 'Обновить карту vault',
            callback: () => {
                this.updateVaultMap();
            }
        });

        // Добавляем команду для создания/пересоздания карты
        this.addCommand({
            id: 'create-vault-map',
            name: 'Создать карту vault',
            callback: () => {
                this.createVaultMap();
            }
        });

        // Добавляем настройки
        this.addSettingTab(new VaultMapSettingTab(this.app, this));

        // Запускаем автообновление если включено
        if (this.settings.autoUpdate) {
            this.startAutoUpdate();
        }

        // Слушаем изменения файлов
        this.registerEvent(
            this.app.vault.on('create', () => {
                if (this.settings.autoUpdate) {
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
            this.app.vault.on('rename', () => {
                if (this.settings.autoUpdate) {
                    this.scheduleUpdate();
                }
            })
        );
    }

    onunload() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
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
            this.updateVaultMap();
        }, this.settings.updateInterval * 60 * 1000);
    }

    scheduleUpdate() {
        // Задержка для избежания частых обновлений
        setTimeout(() => {
            this.updateVaultMap();
        }, 2000);
    }

    async createVaultMap() {
        const mapContent = await this.generateMapContent();
        const mapFile = this.app.vault.getAbstractFileByPath(this.settings.mapFileName + '.md');
        
        if (mapFile && mapFile.extension === 'md') {
            await this.app.vault.modify(mapFile, mapContent);
        } else {
            await this.app.vault.create(this.settings.mapFileName + '.md', mapContent);
        }
        
        new Notice(`Карта vault "${this.settings.mapFileName}" создана!`);
    }

    async updateVaultMap() {
        const mapFile = this.app.vault.getAbstractFileByPath(this.settings.mapFileName + '.md');
        
        if (mapFile && mapFile.extension === 'md') {
            const mapContent = await this.generateMapContent();
            await this.app.vault.modify(mapFile, mapContent);
        } else {
            // Если файл не существует, создаем его
            await this.createVaultMap();
        }
    }

    async generateMapContent() {
        const files = this.app.vault.getFiles();
        const folders = this.app.vault.getAllLoadedFiles().filter(f => f.children !== undefined);
        
        // Фильтруем файлы
        const filteredFiles = files.filter(file => {
            // Исключаем саму карту
            if (file.name === this.settings.mapFileName + '.md') return false;
            
            // Проверяем исключенные папки
            for (const excludeFolder of this.settings.excludeFolders) {
                if (file.path.startsWith(excludeFolder + '/')) return false;
            }
            
            // Проверяем типы файлов
            const extension = file.extension.toLowerCase();
            if (!this.settings.includeImages && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
                return false;
            }
            if (!this.settings.includePdfs && extension === 'pdf') {
                return false;
            }
            
            return true;
        });

        // Сортируем файлы
        filteredFiles.sort((a, b) => {
            switch (this.settings.sortBy) {
                case 'modified':
                    return b.stat.mtime - a.stat.mtime;
                case 'created':
                    return b.stat.ctime - a.stat.ctime;
                case 'name':
                default:
                    return a.basename.localeCompare(b.basename);
            }
        });

        let content = `# ${this.settings.mapFileName}\n\n`;
        content += `*Автоматически сгенерировано: ${new Date().toLocaleString('ru-RU')}*\n\n`;
        
        if (this.settings.showFileCount) {
            content += `**Всего файлов:** ${filteredFiles.length}\n\n`;
        }

        if (this.settings.groupByFolder) {
            content += this.generateFolderStructure(filteredFiles, folders);
        } else {
            content += this.generateFlatList(filteredFiles);
        }

        return content;
    }

    generateFolderStructure(files, folders) {
        let content = '';
        
        // Создаем структуру папок
        const folderStructure = {};
        
        // Группируем файлы по папкам
        files.forEach(file => {
            const folderPath = file.parent?.path || 'Root';
            if (!folderStructure[folderPath]) {
                folderStructure[folderPath] = [];
            }
            folderStructure[folderPath].push(file);
        });

        // Сортируем папки
        const sortedFolders = Object.keys(folderStructure).sort();

        sortedFolders.forEach(folderPath => {
            const folderFiles = folderStructure[folderPath];
            const folderName = folderPath === 'Root' ? '📁 Корневая папка' : `📁 ${folderPath}`;
            
            content += `## ${folderName}\n\n`;
            
            if (this.settings.showFileCount) {
                content += `*Файлов: ${folderFiles.length}*\n\n`;
            }
            
            folderFiles.forEach(file => {
                content += this.formatFileEntry(file);
            });
            
            content += '\n';
        });

        return content;
    }

    generateFlatList(files) {
        let content = '## Все файлы\n\n';
        
        files.forEach(file => {
            content += this.formatFileEntry(file);
        });

        return content;
    }

    formatFileEntry(file) {
        const icon = this.getFileIcon(file.extension);
        let entry = `- ${icon} [[${file.basename}]]`;
        
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

    getFileIcon(extension) {
        const icons = {
            'md': '📝',
            'png': '🖼️',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'gif': '🖼️',
            'svg': '🖼️',
            'webp': '🖼️',
            'pdf': '📄',
            'txt': '📄',
            'docx': '📄',
            'xlsx': '📊',
            'pptx': '📊',
            'mp3': '🎵',
            'mp4': '🎬',
            'zip': '🗜️',
            'json': '⚙️',
            'js': '⚙️',
            'ts': '⚙️',
            'css': '🎨',
            'html': '🌐'
        };
        
        return icons[extension.toLowerCase()] || '📄';
    }
}

class VaultMapSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Настройки карты Vault' });

        new Setting(containerEl)
            .setName('Имя файла карты')
            .setDesc('Имя файла, в котором будет создана карта (без расширения .md)')
            .addText(text => text
                .setPlaceholder('Vault Map')
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
            .setName('Группировать по папкам')
            .setDesc('Группировать файлы по папкам вместо плоского списка')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.groupByFolder)
                .onChange(async (value) => {
                    this.plugin.settings.groupByFolder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Показывать количество файлов')
            .setDesc('Показывать количество файлов в каждой папке')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFileCount)
                .onChange(async (value) => {
                    this.plugin.settings.showFileCount = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Показывать дату изменения')
            .setDesc('Показывать дату последнего изменения файлов')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showLastModified)
                .onChange(async (value) => {
                    this.plugin.settings.showLastModified = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Включать изображения')
            .setDesc('Включать изображения в карту vault')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeImages)
                .onChange(async (value) => {
                    this.plugin.settings.includeImages = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Включать PDF файлы')
            .setDesc('Включать PDF файлы в карту vault')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includePdfs)
                .onChange(async (value) => {
                    this.plugin.settings.includePdfs = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Сортировка')
            .setDesc('Способ сортировки файлов')
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
    }
}

module.exports = VaultMapPlugin;
# Maps of Content Plugin for Obsidian

## Overview

The **Maps of Content** plugin automatically generates and maintains a comprehensive map of all your notes, organized by tags. This plugin creates a single note that serves as a centralized index of your vault, similar to how CMS systems generate sitemap.xml files, but specifically designed for tag-based organization in Obsidian.

The plugin continuously monitors your vault and updates the map automatically when you add, modify, or delete notes, ensuring your content map is always up-to-date.

![Maps of Content Demo](images/demo.png)

## Key Features

### 📋 **Automatic Tag-Based Organization**
- **Tag Grouping**: All notes are automatically grouped by their tags
- **Multi-Tag Support**: Notes with multiple tags appear under each relevant tag section
- **Untagged Notes**: Notes without tags are listed in a dedicated "Without Tags" section at the top
- **Tag Sources**: Supports tags from both frontmatter (`tags: [tag1, tag2]`) and inline tags (`#tag`)

### 🔄 **Smart Auto-Update System**
- **Real-Time Monitoring**: Automatically detects changes to notes and updates the map
- **Configurable Intervals**: Set custom auto-update intervals (1-60 minutes)
- **Event-Driven Updates**: Responds to file creation, modification, deletion, and renaming
- **Manual Updates**: Generate maps on-demand using command palette

### 🏗️ **Advanced Tag Management**
- **Nested Tag Support**: Handle hierarchical tags like `project/work/client`
- **Tag Hierarchy**: Optionally create parent tags for nested structures
- **Tag Exclusion**: Exclude specific tags (e.g., `draft`, `private`) from the map
- **Tag Statistics**: Display tag count and file count per tag

### ⚙️ **Flexible Configuration**
- **Custom Map Name**: Choose any name for your content map file
- **Sorting Options**: Sort notes by name, creation date, or modification date
- **Folder Exclusion**: Exclude specific folders (like `.obsidian`, `.trash`) from processing
- **Metadata Display**: Optionally show file counts and last modified dates

### 📁 **Intelligent File Management**
- **Path Display**: Show relative paths for files in subfolders
- **Markdown Focus**: Processes only Markdown files (`.md` extension)
- **Self-Exclusion**: Prevents the map file from including itself

## Installation

### Manual Installation
1. Download the latest release from the [Releases](https://github.com/yourusername/maps-of-content/releases) page
2. Extract the files to your vault's `.obsidian/plugins/maps-of-content/` directory
3. Restart Obsidian
4. Enable the plugin in Settings → Community Plugins

### Development Setup
1. Clone the repository into your vault's plugins folder:
   ```bash
   cd /path/to/your/vault/.obsidian/plugins
   git clone https://github.com/yourusername/maps-of-content.git
   ```
2. Navigate to the plugin directory and install dependencies:
   ```bash
   cd maps-of-content
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. Restart Obsidian and enable the plugin

## Usage

### Getting Started
1. **Create Your First Map**: Use the command palette (`Ctrl/Cmd + P`) and search for "Create Maps of Content"
2. **Automatic Updates**: The plugin will automatically update your map as you modify notes
3. **Manual Updates**: Use "Update Maps of Content" command for immediate updates

### Commands
- **Create Maps of Content**: Generate a new content map
- **Update Maps of Content**: Manually update the existing map

### Example Output
```markdown
# Maps of Content

*Automatically generated: 22.08.2025, 15:30:00*

**Total notes:** 25 | **Total tags:** 8

## ❓ Without Tags

*Notes: 3*

- 📝 [[Random Thoughts]]
- 📝 [[Meeting Notes]]
- 📝 [[Todo List]]

## 🏷️ projects

*Notes: 5*

- 📝 [[New Website]] - *modified: 22.08.2025*
- 📝 [[Mobile App Development]]
- 📝 [[Client Presentation]]

## 🏷️ work/meetings

*Notes: 4*

- 📝 [[Weekly Standup]]
- 📝 [[Project Review]]
```

## Configuration

### Basic Settings
- **Map File Name**: Customize the name of your content map file
- **Auto Update**: Enable/disable automatic updates
- **Update Interval**: Set how frequently the map updates (1-60 minutes)

### Display Options
- **Show File Count**: Display number of files under each tag
- **Show Last Modified**: Include modification dates for each file
- **Sort By**: Choose sorting method (name, creation date, modification date)

### Tag Management
- **Include Nested Tags**: Process hierarchical tags with `/` separator
- **Show Tag Hierarchy**: Create parent tags for nested structures
- **Exclude Tags**: Specify tags to ignore (comma-separated list)

### Content Filtering
- **Exclude Folders**: Specify folders to ignore (comma-separated list)
- Default exclusions: `.obsidian`, `.trash`

## Use Cases

### 📚 **Knowledge Management**
- Create topic-based overviews of your research
- Track progress across different projects
- Maintain reading lists and resources by subject

### 📝 **Content Creation**
- Organize blog posts by category
- Track writing projects and drafts
- Manage content calendars and publication schedules

### 💼 **Project Management**
- Monitor project deliverables and milestones
- Organize meeting notes and action items
- Track client work and communications

### 🎓 **Academic Research**
- Categorize research papers and citations
- Organize course materials and lecture notes
- Track thesis chapters and research progress

## Compatibility

- **Obsidian Version**: Requires Obsidian 0.15.0 or higher
- **Platform**: Works on Desktop, Mobile, and Web versions
- **Themes**: Compatible with all themes
- **Other Plugins**: Designed to work alongside other community plugins

## Support & Feedback

If you encounter any issues or have suggestions for improvements:

- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/maps-of-content/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/maps-of-content/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/maps-of-content/wiki)

## Contributing

Contributions are welcome! Please feel free to submit pull requests, report bugs, or suggest new features.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and updates.

---

**Enjoy organizing your knowledge with Maps of Content!** 🗺️📚

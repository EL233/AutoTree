<div align="center">

<img src="img/icon.png" width="120" height="120" alt="AutoTree Icon">

# 🌲 AutoTree - Project Structure Generator  

AutoTree - A lightweight yet powerful VS Code extension that automatically generates project structure documentation.  

[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visualstudiocode)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

</div>

---
### 📖 Description

AutoTree is a simple yet powerful VS Code extension that automatically generates a Markdown file (PROJECT_TREE.md) representing your project's folder and file structure.
It supports custom ignore lists, custom recursion depth, and smart configuration management with manual setup prompts.

### ✨ Features

🚀 Automatic Generation - Quickly generate project structure with a single command
⚙️ Flexible Configuration - Customize ignore patterns, depth limits, and output filename
🧠 Smart Configuration Management - Automatically detects and resolves configuration conflicts
🌍 Multi-language Support - Full English and Chinese interface
📊 Depth Control - Limit recursion depth to focus on relevant project structure
🔧 Multiple Configuration Sources - Supports project, workspace, and user settings

### 🖼️ Plugin Preview

![preview1](img/usersetting.png)
![preview2](img/userignore.png)
![preview3](img/userremind.png)

### 🛠 Installation

Open VS Code
Go to Extensions (Ctrl+Shift+X)
Search for "AutoTree"
Click Install

### 💡 Usage

Method 1: Command Palette

Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
Type "AutoTree: Generate Project Tree"
Press Enter
Method 2: Manual Configuration

If no configuration is found, the extension will guide you through manual setup:

Enter files/folders to ignore
Set recursion depth (or unlimited)
Specify output filename

### ⚙️ Configuration

Add these settings to your VS Code settings.json:

```json
{
  "autotree.ignore": ["node_modules", ".git", "dist", "build"],
  "autotree.maxDepth": 3,
  "autotree.outputFile": "PROJECT_TREE.md"
}
```

Configuration Priority

The extension follows this priority order:

Project Settings (.vscode/settings.json) - Highest priority
Workspace Settings
User Settings (Global) - Lowest priority

### 🎯 Configuration Options

Setting	Type	Default	Description
autotree.ignore	string[]	["node_modules", ".git"]	Files/folders to exclude from tree
autotree.maxDepth	number	undefined (unlimited)	Maximum recursion depth (positive integer)
autotree.outputFile	string	"PROJECT_TREE.md"	Output filename
### 📁 Example Output
```plaintext
my-project/
├── src/
│   ├── components/
│   │   ├── Button.js
│   │   └── Header.js
│   ├── utils/
│   │   └── helpers.js
│   └── index.js
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
├── README.md
└── .gitignore
```

### 🔄 Workflow

Configuration Detection - Checks project, workspace, and user settings
Conflict Resolution - Prompts user if multiple configurations exist
Depth Validation - Ensures depth doesn't exceed project limits
Tree Generation - Creates structured tree representation
File Output - Saves to specified Markdown file

### 🚨 Notes

When maxDepth ≤ 0, no files will be generated
If input depth exceeds project's actual depth, it will be automatically adjusted
Empty depth input means unlimited recursion
The extension uses plain text tree format for better compatibility

### 🐛 Troubleshooting

No workspace folder found

Ensure you have a folder open in VS Code
Use File > Open Folder to open your project
Configuration not working

Check configuration priority: Project > Workspace > User
Verify JSON syntax in settings.json
Tree generation fails

Check file permissions in your project directory
Ensure output file is not open in another program

### 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### 📜 License

MIT License © 2025 EL233
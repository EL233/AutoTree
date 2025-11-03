<div align="center">

<img src="img/icon.png" width="120" height="120" alt="AutoTree Icon">

# 🌲 AutoTree - Project Structure Generator  

[English Version](./README.md) | [中文版](./README_CN.md)

_AutoTree —— 一个能自动生成项目结构文档的轻量级 VS Code 插件。_

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/EL233.autopjtree?label=Marketplace&logo=visualstudiocode&color=blue)](https://marketplace.visualstudio.com/items?itemName=EL233.autopjtree)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/EL233.autopjtree?color=brightgreen)](https://marketplace.visualstudio.com/items?itemName=EL233.autopjtree)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---
### 📖 插件简介

AutoTree 是一个轻量又实用的 VS Code 插件，用于自动生成项目结构文件（PROJECT_TREE.md），帮助你快速查看或展示项目目录结构。
支持 自定义忽略文件、递归深度控制、智能配置管理 和手动设置提示。

### ✨ 功能特性

🚀 自动生成 - 一键生成项目目录结构树
⚙️ 灵活配置 - 自定义忽略模式、深度限制和输出文件名
🧠 智能配置管理 - 自动检测并解决配置冲突
🌍 多语言支持 - 完整的中英文界面
📊 深度控制 - 限制递归深度，聚焦相关项目结构
🔧 多配置源支持 - 支持项目、工作区和用户设置

### 插件预览

![preview1](img/usersetting.png)
![preview2](img/userignore.png)
![preview3](img/userremind.png)

### 🛠 安装方法

打开 VS Code
进入扩展面板 (Ctrl+Shift+X)
搜索 "AutoTree"
点击安装

### 💡 使用方法

方法一：命令面板

打开命令面板 (Ctrl+Shift+P / Cmd+Shift+P)
输入 "AutoTree: Generate Project Tree"
按回车键
方法二：手动配置

如果未找到配置，扩展将引导您进行手动设置：

输入要忽略的文件/文件夹
设置递归深度（或选择无限）
指定输出文件名

### ⚙️ 配置说明

将以下设置添加到 VS Code 的 settings.json 中：
```json
{
  "autotree.ignore": ["node_modules", ".git", "dist", "build"],
  "autotree.maxDepth": 3,
  "autotree.outputFile": "PROJECT_TREE.md"
}
```
配置优先级

扩展遵循以下优先级顺序：

项目设置 (.vscode/settings.json) - 最高优先级
工作区设置
用户设置 (全局) - 最低优先级

### 🎯 配置选项

设置项	类型	默认值	描述
autotree.ignore	string[]	["node_modules", ".git"]	从树中排除的文件/文件夹
autotree.maxDepth	number	undefined (无限制)	最大递归深度（正整数）
autotree.outputFile	string	"PROJECT_TREE.md"	输出文件名

### 📁 输出示例
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

### 🔄 工作流程

配置检测 - 检查项目、工作区和用户设置
冲突解决 - 如果存在多个配置，提示用户选择
深度验证 - 确保深度不超过项目实际限制
树生成 - 创建结构化树形表示
文件输出 - 保存到指定的 Markdown 文件

### 🚨 注意事项

当 maxDepth ≤ 0 时，不会生成文件
如果输入深度超过项目实际深度，将自动调整
空深度输入表示无限递归
扩展使用纯文本树格式以获得更好的兼容性

### 🐛 故障排除

未检测到工作区文件夹

确保在 VS Code 中打开了文件夹
使用 文件 > 打开文件夹 打开项目
配置不生效

检查配置优先级：项目 > 工作区 > 用户
验证 settings.json 中的 JSON 语法
树生成失败

检查项目目录中的文件权限
确保输出文件未在其他程序中打开

### 🤝 贡献指南

欢迎贡献代码！请随时提交 Pull Request 或为 Bug 和功能请求创建 Issue。

### 📜 License

MIT License © 2025 EL233
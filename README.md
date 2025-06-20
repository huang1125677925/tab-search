# Tab Search Chrome 插件

一个用于搜索和管理当前Chrome窗口所有标签页的插件。

## 功能特性

- 📋 显示当前窗口的所有标签页
- 🔍 实时搜索标签页（支持标题和URL搜索）
- 🎯 点击标签页直接跳转
- ⌨️ 键盘快捷键支持
  - `Enter`: 跳转到第一个搜索结果
  - `Esc`: 关闭弹窗
- 🎨 现代化的用户界面

## 安装方法

1. 打开 Chrome 浏览器
2. 在地址栏输入 `chrome://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本项目文件夹
6. 插件安装完成！

## 使用方法

1. 点击浏览器工具栏中的插件图标
2. 在搜索框中输入关键词来过滤标签页
3. 点击任意标签页即可跳转
4. 使用键盘快捷键提高效率

## 文件结构

```
tab-search/
├── manifest.json    # 插件配置文件
├── popup.html       # 弹窗界面
├── popup.js         # 核心功能脚本
└── README.md        # 说明文档
```

## 技术实现

- 使用 Chrome Extensions Manifest V3
- 利用 `chrome.tabs` API 获取标签页信息
- 实现实时搜索和过滤功能
- 响应式设计，支持不同屏幕尺寸

## 权限说明

- `tabs`: 用于获取和操作标签页
- `activeTab`: 用于访问当前活动标签页

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- 其他基于 Chromium 的浏览器
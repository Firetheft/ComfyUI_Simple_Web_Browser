<div align="center">
<img width="1810" height="1019" alt="QQ20250915-232019" src="https://github.com/user-attachments/assets/12065c06-6f32-4860-b438-fde9aa4a05b8" />

# Simple Web Browser for ComfyUI
</div>

This is a custom node for ComfyUI that embeds a simple web browser directly into the interface. It allows you to browse websites, find inspiration, and load images directly, which can help streamline your workflow.

**Please note:** Due to the limitations of embedding a browser within another application, some websites may not display or function as expected. We encourage you to explore and see which sites work for you.

## ✨ Features

* **Embedded Browser**: Offers a basic web browsing experience within your ComfyUI workflow. It's a journey of discovery to see which of your favorite sites are compatible.
* **Homepage Function**:
    * Click the 🏠 icon to quickly navigate to your homepage.
    * The default homepage is the powerful online image editor, [Photopea](https://www.photopea.com).
    * **Right-click** the 🏠 icon to set a custom homepage URL.
* **Powerful Bookmark System**:
    * Organize your bookmarks by category.
    * Add, edit, and delete categories and individual bookmarks.
    * Easily reorder bookmarks with drag-and-drop functionality.
    * Bookmark data is saved locally in the `browser_bookmarks.json` file within the plugin directory.
* **Image Loading**:
    * Copy an image URL from the web, paste it into the input field at the bottom, and load it directly into ComfyUI.
    * If you are browsing Photopea, you can click the "From Photopea" button to directly import the current canvas image.

## 📦 Installation

1.  Open your terminal or command prompt.
2.  Navigate to your ComfyUI custom nodes directory: `cd ComfyUI/custom_nodes/`.
3.  Clone this repository: `git clone https://github.com/Firetheft/ComfyUI_Simple_Web_Browser`.
4.  Restart ComfyUI.
5.  Or install it directly from the ComfyUI Manager.

## 📖 How to Use

1.  In ComfyUI, double-click or right-click to select `Add Node`.
2.  Go to the `📜Asset Gallery/Utils` category and choose `Simple Web Browser` to add the node.
3.  **Browsing the Web**:
    * Click the 🏠 **Homepage Icon** to go to your designated homepage.
    * Type a URL into the top address bar and click `Go` or press `Enter` to navigate.
4.  **Managing Bookmarks**:
    * Click the ★ **Star Icon** to open the bookmark menu.
    * Here you can add the current URL as a bookmark and manage your categories and favorites.
5.  **Loading Images**:
    * **From URL**: Find an image online, right-click it, and copy the image address. Paste the URL into the "Paste the image url here..." input field at the bottom, then click the `Loading pictures from url` button. The `image` output of the node can then be connected to any other node that requires an image input.
    * **From Photopea**: Ensure the browser is on the Photopea website and you have an image on the canvas. Click the `From Photopea` button, and the plugin will automatically export and load the image from the canvas.

#

# 🇨🇳 中文

这是一个为 ComfyUI 设计的自定义节点，它可以在界面中嵌入一个简单的网页浏览器。它允许您浏览网站、寻找灵感并直接加载图片，有助于简化您的工作流程。

**请注意：** 由于在应用程序中嵌入浏览器的限制，部分网站可能无法正常显示或工作。我们鼓励您自行探索，找到可以兼容的网站。

## ✨ 功能特性

* **内置浏览器**：在您的 ComfyUI 工作流中提供基础的网页浏览体验。哪些您喜爱的网站能够兼容，还需要您亲自探索发现。
* **主页功能**：
    * 点击 🏠 图标可快速跳转到您的主页。
    * 默认主页是强大的在线图片编辑器 [Photopea](https://www.photopea.com)。
    * **右键点击** 🏠 图标可自定义您的主页网址。
* **强大的书签系统**：
    * 按分类管理您的书签。
    * 支持添加、编辑和删除分类及单个书签。
    * 通过拖拽轻松为书签排序。
    * 书签数据会保存在插件目录下的 `browser_bookmarks.json` 文件中。
* **图片加载**：
    * 从网上复制图片地址，粘贴到底部的输入框，即可直接将其加载到 ComfyUI 中。
    * 如果您正在浏览 Photopea 网站，可以点击 “From Photopea” 按钮，直接导入当前画布中的图像。

## 📦 安装

1.  打开您的终端或命令行提示符。
2.  进入 ComfyUI 的自定义节点目录：`cd ComfyUI/custom_nodes/`。
3.  克隆本仓库：`git clone https://github.com/Firetheft/ComfyUI_Simple_Web_Browser`。
4.  重启 ComfyUI。
5.  或者直接从comfyui管理器安装。

## 📖 使用方法

1.  在 ComfyUI 中，双击或右键选择 `Add Node`。
2.  找到 `📜Asset Gallery/Utils` 分类，然后选择 `Simple Web Browser` 来添加节点。
3.  **浏览网页**：
    * 点击 🏠 **主页图标** 前往您设定的主页。
    * 在顶部的地址栏输入网址，然后点击 `Go` 按钮或按 `Enter` 键进行导航。
4.  **管理书签**：
    * 点击 ★ **星形图标** 打开书签菜单。
    * 在这里您可以添加当前网址为书签，并管理您的分类和收藏。
5.  **加载图片**：
    * **从 URL 加载**：在网上找到图片，右键点击并复制图片地址。将 URL 粘贴到底部的 "Paste the image url here..." 输入框中，然后点击 `Loading pictures from url` 按钮。节点的 `image` 输出接口即可连接到其他需要图像输入的节点。
    * **从 Photopea 导入**：确保浏览器当前页面是 Photopea，并且画布上有图像。点击 `From Photopea` 按钮，插件会自动从画布中导出并加载图像。

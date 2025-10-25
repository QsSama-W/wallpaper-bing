# Wallpaper-Bing
**必应每日壁纸**

## 项目介绍

Wallpaper-Bing 是一个自动化的必应每日壁纸获取与展示系统，能够自动下载必应官网每日更新的精美壁纸，并通过网页界面进行展示。该项目支持定时任务，确保您的壁纸库始终保持最新。

## 🚀 核心功能
- **自动下载**：每日自动获取必应最新壁纸
- **高清质量**：获取最高分辨率的壁纸图片
- **网页展示**：美观的网页界面展示所有壁纸
- **定时更新**：支持自定义时间间隔自动更新

### 📦 安装步骤

#### 宝塔面板部署（推荐）

1. **下载源码**
```bash
https://github.com/QsSama-W/wallpaper-bing/archive/refs/heads/main.zip
```

2. **上传文件**
   - 下载压缩包并上传到网站目录
   - 解压文件到网站根目录

3. **修改配置**
```bash
# 编辑shell脚本配置
./static/sh/wallpaper.sh

# 修改以下配置项
config_path="/www/wwwroot/yourdomain.com/img/wallpaper_urls.json"  # 壁纸配置文件保存路径
```

4. **设置定时任务**
   - 登录宝塔面板
   - 进入「计划任务」
   - 添加新任务：`bash /www/wwwroot/yourdomain.com/static/sh/wallpaper.sh`
   - 设置执行时间：建议每天凌晨0点30分

>PS：仅在宝塔面板部署使用过，其他环境请自测

## **效果展示**

**点击[Wallpaper-Bing](https://qssama-w.github.io/wallpaper-bing/)访问演示站**

**今日壁纸**
<img src="https://github.com/QsSama-W/wallpaper-bing/blob/main/image_2025-09-19_200243_701.png" style="zoom:50%;" />

**历史壁纸**
<img src="https://github.com/QsSama-W/wallpaper-bing/blob/main/image_2025-09-19_200247_532.png" style="zoom:50%;" />


## 联系作者

- **项目地址**：https://github.com/QsSama-W/wallpaper-bing
- **问题反馈**：https://github.com/QsSama-W/wallpaper-bing/issues
- **功能建议**：欢迎提交Pull Request

---

**⭐ 如果觉得这个项目有用，请给我一个Star！⭐**


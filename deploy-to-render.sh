#!/bin/bash

# 指南针设计教学平台 - 快速部署脚本
# 使用方法: ./deploy-to-render.sh

echo "=========================================="
echo "  指南针设计教学平台 - 部署助手"
echo "=========================================="
echo ""

# 检查是否安装了 git
if ! command -v git &> /dev/null; then
    echo "❌ 请先安装 Git: https://git-scm.com/downloads"
    exit 1
fi

# 提示用户输入 GitHub 仓库地址
echo "📋 部署步骤："
echo ""
echo "1. 在 GitHub 创建一个新仓库（名称：compass-design-api）"
echo "   访问: https://github.com/new"
echo ""
echo "2. 创建完成后，输入仓库地址："
read -p "   仓库地址 (例如: https://github.com/username/compass-design-api.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ 仓库地址不能为空"
    exit 1
fi

# 初始化 git
echo ""
echo "🚀 开始部署..."
echo ""

if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加所有文件
echo "📁 添加文件到 Git..."
git add .

# 提交
echo "💾 提交代码..."
git commit -m "Deploy to Render" || echo "没有需要提交的更改"

# 添加远程仓库
echo "🔗 连接远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# 推送代码
echo "☁️  推送到 GitHub..."
git branch -M main
git push -u origin main -f

echo ""
echo "✅ 代码已推送到 GitHub！"
echo ""
echo "=========================================="
echo "  下一步：在 Render 上部署"
echo "=========================================="
echo ""
echo "1. 访问: https://dashboard.render.com"
echo "2. 点击 'New +' → 'Web Service'"
echo "3. 选择 'Build and deploy from a Git repository'"
echo "4. 连接 GitHub，选择 compass-design-api 仓库"
echo "5. 配置："
echo "   - Name: compass-design-api"
echo "   - Region: Singapore"
echo "   - Build Command: cd server && npm install"
echo "   - Start Command: cd server && npm start"
echo "   - Plan: Free"
echo "6. 点击 'Create Web Service'"
echo ""
echo "⏳ 等待部署完成（约 2-3 分钟）"
echo ""
echo "📌 部署完成后，你会得到一个 URL，例如："
echo "   https://compass-design-api.onrender.com"
echo ""
echo "📌 然后修改前端代码 src/store/api.ts 中的 RENDER_API_URL"
echo "   重新构建并部署前端即可"
echo ""

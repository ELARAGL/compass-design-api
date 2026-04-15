# 指南针设计教学平台 - 后端部署指南

## 部署到 Render.com（免费）

### 方法一：通过 GitHub 部署（推荐）

#### 步骤 1：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 登录账号
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`compass-design-api`
4. 选择 "Public" 或 "Private"
5. 点击 "Create repository"

#### 步骤 2：上传代码

在本地项目目录执行：

```bash
# 初始化 git
git init

# 添加文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/compass-design-api.git

# 推送代码
git push -u origin main
```

#### 步骤 3：在 Render 上部署

1. 访问 [Render Dashboard](https://dashboard.render.com)
2. 点击 "New +" → "Web Service"
3. 选择 "Build and deploy from a Git repository"
4. 连接你的 GitHub 账号，选择 `compass-design-api` 仓库
5. 配置如下：

| 配置项 | 值 |
|--------|-----|
| Name | compass-design-api |
| Region | Singapore (最接近中国) |
| Branch | main |
| Runtime | Node |
| Build Command | `cd server && npm install` |
| Start Command | `cd server && npm start` |
| Plan | Free |

6. 点击 "Create Web Service"
7. 等待部署完成（约 2-3 分钟）

#### 步骤 4：获取 API 地址

部署完成后，Render 会分配一个 URL，例如：
```
https://compass-design-api.onrender.com
```

### 方法二：直接上传部署

如果不使用 GitHub，可以将代码打包上传：

1. 将 `server` 文件夹打包成 zip
2. 访问 [Render Dashboard](https://dashboard.render.com)
3. 点击 "New +" → "Web Service"
4. 选择 "Upload your code"
5. 上传 zip 文件
6. 配置同上

---

## 更新前端 API 地址

部署完成后，需要更新前端的 API 地址：

### 步骤 1：修改 api.ts

打开 `src/store/api.ts`，更新 `RENDER_API_URL`：

```typescript
// 替换为你的 Render 服务地址
const RENDER_API_URL = 'https://compass-design-api.onrender.com/api';
```

### 步骤 2：重新构建部署

```bash
npm run build
```

然后将 `dist` 文件夹部署到前端托管服务。

---

## 验证部署

### 测试后端是否正常运行

在浏览器访问：
```
https://你的-render-地址/api/health
```

应该返回：
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 测试数据同步

1. 在一台电脑上提交设计作品
2. 在另一台电脑上刷新页面
3. 应该能看到刚才提交的作品

---

## 常见问题

### 1. Render 免费版的限制

- **休眠**：15分钟无访问会自动休眠，下次访问需要等待 30 秒启动
- **流量**：每月 100GB 带宽
- **存储**：数据存储在 `/tmp` 目录，服务重启后会清空

**解决方案**：定期备份数据，或使用付费版

### 2. 数据持久化

Render 免费版的数据存储在内存中，服务重启后会丢失。如需持久化：

1. 升级到付费版（$7/月）
2. 或使用外部数据库（如 MongoDB Atlas 免费版）

### 3. CORS 跨域问题

如果前端无法访问后端，检查：
- 后端 CORS 配置是否正确
- 前端 API 地址是否正确

---

## 备份数据

教师可以在管理看板导出数据：

1. 打开浏览器开发者工具 (F12)
2. 在 Console 执行：
```javascript
localStorage.getItem('compass-design-data')
```
3. 复制输出的 JSON 数据保存

---

## 技术支持

如有问题，请检查：
1. Render 服务日志（Dashboard → Logs）
2. 浏览器开发者工具 Network 标签
3. 后端健康检查接口 `/api/health`

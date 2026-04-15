# 指南针设计平台后端 API

## 快速开始

### 本地开发

```bash
cd server
npm install
npm start
```

服务将在 http://localhost:3001 启动

### API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/designs | 获取所有设计 |
| POST | /api/designs | 创建/更新设计 |
| DELETE | /api/designs/:id | 删除设计 |
| POST | /api/designs/:id/evaluations | 添加评价 |
| POST | /api/designs/:id/teamwork | 设置团队评分 |

## 部署到 Render

### 1. 创建 GitHub 仓库

```bash
# 在 GitHub 创建仓库后执行
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/compass-design-api.git
git push -u origin main
```

### 2. 在 Render 部署

1. 访问 https://dashboard.render.com
2. New + → Web Service
3. 选择 GitHub 仓库
4. 配置：
   - **Name**: compass-design-api
   - **Region**: Singapore
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

### 3. 获取 API 地址

部署完成后，你会得到类似：
```
https://compass-design-api.onrender.com
```

### 4. 更新前端

修改 `src/store/api.ts`：
```typescript
const RENDER_API_URL = 'https://compass-design-api.onrender.com/api';
```

## 注意事项

- Render 免费版 15 分钟无访问会休眠
- 数据存储在 `/tmp`，服务重启后清空
- 建议定期备份数据

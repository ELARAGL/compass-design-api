import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置 - 允许所有来源
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// 数据文件路径 - 使用项目目录（Render 允许写入）
const DATA_FILE = path.join(__dirname, 'data.json');

// 内存缓存
let memoryData = { designs: [] };
let dataLoaded = false;

// 从文件加载数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      memoryData = JSON.parse(content);
      dataLoaded = true;
      console.log(`Loaded ${memoryData.designs.length} designs from file`);
      return;
    }
  } catch (error) {
    console.error('Failed to load data from file:', error);
  }
  
  // 文件不存在或读取失败，使用空数据
  memoryData = { designs: [] };
  dataLoaded = true;
  saveData();
}

// 保存数据到文件
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryData, null, 2));
    console.log(`Saved ${memoryData.designs.length} designs to file`);
  } catch (error) {
    console.error('Failed to save data to file:', error);
  }
}

// 初始化时加载数据
loadData();

// 获取所有设计作品
app.get('/api/designs', (req, res) => {
  try {
    // 每次都从文件重新加载，确保数据最新
    loadData();
    res.json({ success: true, designs: memoryData.designs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个设计作品
app.get('/api/designs/:id', (req, res) => {
  try {
    loadData();
    const design = memoryData.designs.find(d => d.id === req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }
    res.json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建/更新设计作品
app.post('/api/designs', (req, res) => {
  try {
    loadData();
    
    const newDesign = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      submitTime: req.body.submitTime || new Date().toISOString(),
      studentEvaluations: req.body.studentEvaluations || [],
      teamworkScore: req.body.teamworkScore,
      teamworkEvaluation: req.body.teamworkEvaluation,
    };
    
    // 检查是否已存在该小组的设计
    const existingIndex = memoryData.designs.findIndex(d => d.groupId === newDesign.groupId);
    if (existingIndex >= 0) {
      // 保留原有的 teamworkScore 和 teamworkEvaluation
      const existingDesign = memoryData.designs[existingIndex];
      memoryData.designs[existingIndex] = { 
        ...existingDesign, 
        ...newDesign,
        teamworkScore: newDesign.teamworkScore !== undefined ? newDesign.teamworkScore : existingDesign.teamworkScore,
        teamworkEvaluation: newDesign.teamworkEvaluation !== undefined ? newDesign.teamworkEvaluation : existingDesign.teamworkEvaluation,
      };
    } else {
      memoryData.designs.push(newDesign);
    }
    
    saveData();
    res.json({ success: true, design: memoryData.designs[existingIndex >= 0 ? existingIndex : memoryData.designs.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新设计作品
app.put('/api/designs/:id', (req, res) => {
  try {
    loadData();
    const index = memoryData.designs.findIndex(d => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }
    
    memoryData.designs[index] = { ...memoryData.designs[index], ...req.body };
    saveData();
    res.json({ success: true, design: memoryData.designs[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除设计作品
app.delete('/api/designs/:id', (req, res) => {
  try {
    loadData();
    const index = memoryData.designs.findIndex(d => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }
    
    const deletedDesign = memoryData.designs.splice(index, 1)[0];
    saveData();
    res.json({ success: true, design: deletedDesign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加评价
app.post('/api/designs/:id/evaluations', (req, res) => {
  try {
    loadData();
    const design = memoryData.designs.find(d => d.id === req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }
    
    if (!design.studentEvaluations) {
      design.studentEvaluations = [];
    }
    
    // 检查是否已有该评价者的评价
    const existingIndex = design.studentEvaluations.findIndex(
      e => e.evaluatorGroupId === req.body.evaluatorGroupId
    );
    
    if (existingIndex >= 0) {
      design.studentEvaluations[existingIndex] = req.body;
    } else {
      design.studentEvaluations.push(req.body);
    }
    
    saveData();
    res.json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 设置团队协作评分
app.post('/api/designs/:id/teamwork', (req, res) => {
  try {
    loadData();
    const design = memoryData.designs.find(d => d.id === req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, error: 'Design not found' });
    }
    
    design.teamworkScore = req.body.score;
    design.teamworkEvaluation = req.body.evaluation;
    
    saveData();
    res.json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 清空所有数据（教师端使用）
app.delete('/api/designs', (req, res) => {
  try {
    memoryData = { designs: [] };
    saveData();
    res.json({ success: true, message: 'All designs deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    designsCount: memoryData.designs.length 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
  console.log(`Current designs count: ${memoryData.designs.length}`);
});

export default app;

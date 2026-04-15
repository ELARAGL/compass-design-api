import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// 内存存储
let designs = [];

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.get('/api/designs', (req, res) => {
  res.json({ success: true, designs });
});

app.post('/api/designs', (req, res) => {
  const newDesign = {
    ...req.body,
    id: req.body.id || Date.now().toString(),
    submitTime: new Date().toISOString(),
  };
  
  const existingIndex = designs.findIndex(d => d.groupId === newDesign.groupId);
  if (existingIndex >= 0) {
    designs[existingIndex] = { ...designs[existingIndex], ...newDesign };
  } else {
    designs.push(newDesign);
  }
  
  res.json({ success: true, design: newDesign });
});

app.delete('/api/designs/:id', (req, res) => {
  designs = designs.filter(d => d.id !== req.params.id);
  res.json({ success: true });
});

app.post('/api/designs/:id/evaluations', (req, res) => {
  const design = designs.find(d => d.id === req.params.id);
  if (!design) return res.status(404).json({ success: false });
  
  if (!design.studentEvaluations) design.studentEvaluations = [];
  
  const idx = design.studentEvaluations.findIndex(e => e.evaluatorGroupId === req.body.evaluatorGroupId);
  if (idx >= 0) {
    design.studentEvaluations[idx] = req.body;
  } else {
    design.studentEvaluations.push(req.body);
  }
  
  res.json({ success: true, design });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
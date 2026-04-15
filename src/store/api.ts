// API 基础配置
// 本地开发时使用 localhost，生产环境使用云端地址
const isProduction = import.meta.env.PROD;

// 默认使用 Render 部署的地址（需要替换为实际的 Render 服务 URL）
const RENDER_API_URL = 'https://compass-design-api.onrender.com/api';

// 本地开发地址
const LOCAL_API_URL = 'http://localhost:3001/api';

// 根据环境选择 API 地址
export const API_BASE_URL = isProduction ? RENDER_API_URL : LOCAL_API_URL;

// 通用请求函数
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// 设计作品 API
export const designAPI = {
  // 获取所有设计作品
  getAll: () => fetchAPI<{ success: boolean; designs: any[] }>('/designs'),
  
  // 获取单个设计作品
  getById: (id: string) => fetchAPI<{ success: boolean; design: any }>(`/designs/${id}`),
  
  // 创建设计作品
  create: (design: any) => fetchAPI<{ success: boolean; design: any }>('/designs', {
    method: 'POST',
    body: JSON.stringify(design),
  }),
  
  // 更新设计作品
  update: (id: string, design: any) => fetchAPI<{ success: boolean; design: any }>(`/designs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(design),
  }),
  
  // 删除设计作品
  delete: (id: string) => fetchAPI<{ success: boolean; design: any }>(`/designs/${id}`, {
    method: 'DELETE',
  }),
  
  // 添加评价
  addEvaluation: (id: string, evaluation: any) => fetchAPI<{ success: boolean; design: any }>(`/designs/${id}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(evaluation),
  }),
  
  // 设置团队协作评分
  setTeamwork: (id: string, score: number, evaluation: string) => fetchAPI<{ success: boolean; design: any }>(`/designs/${id}/teamwork`, {
    method: 'POST',
    body: JSON.stringify({ score, evaluation }),
  }),
  
  // 清空所有数据
  clearAll: () => fetchAPI<{ success: boolean }>('/designs', {
    method: 'DELETE',
  }),
};

// 健康检查
export const healthAPI = {
  check: () => fetchAPI<{ success: boolean; message: string }>('/health'),
};

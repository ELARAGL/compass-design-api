import { create } from 'zustand';
import type { AppState, Design, DesignType, StudentEvaluation, EvaluationScores } from '@/types';
import { designAPI, healthAPI } from './api';

interface AppStore extends AppState {
  // 登录相关
  loginAsStudent: (groupId: string, groupName: string) => void;
  loginAsTeacher: () => void;
  logout: () => void;
  
  // 材料选择
  toggleMaterial: (materialId: string) => void;
  clearMaterials: () => void;
  
  // 设计相关
  setDesignType: (type: DesignType) => void;
  setDesignSketch: (image: string | null) => void;
  setRenderImage: (image: string | null) => void;
  setDesignDescription: (description: string) => void;
  submitDesign: () => Promise<Design | null>;
  
  // 查询
  getCurrentGroupDesign: () => Design | undefined;
  hasSubmitted: () => boolean;
  getAllDesigns: () => Design[];
  clearCurrentDesign: () => void;
  
  // 评价
  addStudentEvaluation: (designId: string, evaluation: StudentEvaluation) => Promise<void>;
  getStudentEvaluation: (designId: string, evaluatorGroupId: string) => StudentEvaluation | undefined;
  hasEvaluated: (designId: string, evaluatorGroupId: string) => boolean;
  getEvaluationScores: (designId: string) => { self: EvaluationScores | null; others: EvaluationScores | null };
  
  // 教师评分
  rateTeamwork: (designId: string, score: number, evaluation: string) => Promise<void>;
  
  // 计算总分
  getTotalScore: (designId: string) => { self: number; others: number; teamwork: number; total: number } | null;
  
  // 删除
  deleteDesign: (designId: string) => Promise<void>;
  
  // 数据同步
  syncDesigns: () => Promise<void>;
  
  // 视图
  setCurrentViewingDesign: (design: Design | null) => void;
  
  // 后端状态
  isBackendAvailable: boolean;
  checkBackend: () => Promise<boolean>;
}

const initialState: AppState = {
  currentUser: { type: null },
  selectedMaterials: [],
  selectedDesignType: null,
  designSketch: null,
  renderImage: null,
  designDescription: '',
  designs: [],
  currentViewingDesign: null,
};

// 从 localStorage 加载数据
function loadFromLocalStorage(): Design[] {
  try {
    const stored = localStorage.getItem('compass-design-data');
    if (stored) {
      const data = JSON.parse(stored);
      return data.designs || [];
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return [];
}

// 保存到 localStorage
function saveToLocalStorage(designs: Design[]) {
  try {
    localStorage.setItem('compass-design-data', JSON.stringify({ designs, lastSync: Date.now() }));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const useAppStore = create<AppStore>()(
  (set, get) => ({
    ...initialState,
    isBackendAvailable: false,
    
    // 检查后端是否可用
    checkBackend: async () => {
      try {
        const response = await healthAPI.check();
        const available = response.success;
        set({ isBackendAvailable: available });
        return available;
      } catch (error) {
        console.log('Backend not available, using localStorage mode');
        set({ isBackendAvailable: false });
        return false;
      }
    },
    
    // 登录相关
    loginAsStudent: (groupId: string, groupName: string) => {
      set({ currentUser: { type: 'student', groupId, groupName } });
      // 登录后同步数据
      get().syncDesigns();
    },
    
    loginAsTeacher: () => {
      set({ currentUser: { type: 'teacher' } });
      // 登录后同步数据
      get().syncDesigns();
    },
    
    logout: () => {
      set({
        currentUser: { type: null },
        selectedMaterials: [],
        selectedDesignType: null,
        designSketch: null,
        renderImage: null,
        designDescription: '',
      });
    },
    
    // 同步数据
    syncDesigns: async () => {
      const isAvailable = await get().checkBackend();
      
      if (isAvailable) {
        // 后端可用，从后端获取数据
        try {
          const response = await designAPI.getAll();
          if (response.success) {
            set({ designs: response.designs });
            // 同时保存到 localStorage 作为备份
            saveToLocalStorage(response.designs);
          }
        } catch (error) {
          console.error('Failed to sync from backend:', error);
          // 回退到 localStorage
          const localDesigns = loadFromLocalStorage();
          set({ designs: localDesigns });
        }
      } else {
        // 后端不可用，使用 localStorage
        const localDesigns = loadFromLocalStorage();
        set({ designs: localDesigns });
      }
    },
    
    // 材料选择
    toggleMaterial: (materialId: string) => {
      const { selectedMaterials } = get();
      if (selectedMaterials.includes(materialId)) {
        set({ selectedMaterials: selectedMaterials.filter(id => id !== materialId) });
      } else {
        set({ selectedMaterials: [...selectedMaterials, materialId] });
      }
    },
    
    clearMaterials: () => {
      set({ selectedMaterials: [] });
    },
    
    // 设计相关
    setDesignType: (type: DesignType) => {
      set({ selectedDesignType: type });
    },
    
    setDesignSketch: (image: string | null) => {
      set({ designSketch: image });
    },
    
    setRenderImage: (image: string | null) => {
      set({ renderImage: image });
    },
    
    setDesignDescription: (description: string) => {
      set({ designDescription: description });
    },
    
    submitDesign: async () => {
      const { currentUser, selectedMaterials, selectedDesignType, designSketch, renderImage, designDescription, designs, isBackendAvailable } = get();
      
      if (!currentUser.groupId || !selectedDesignType || !designSketch) {
        return null;
      }
      
      const designTypeNames: Record<string, string> = {
        floating: '水浮式指南针',
        support: '支撑式指南针',
        hanging: '悬挂式指南针',
      };
      
      // 查找是否已有该小组的设计
      const existingDesign = designs.find(d => d.groupId === currentUser.groupId);
      
      const designData = {
        id: existingDesign?.id || Date.now().toString(),
        groupId: currentUser.groupId,
        groupName: currentUser.groupName || '',
        materials: selectedMaterials,
        designType: selectedDesignType,
        designTypeName: designTypeNames[selectedDesignType],
        designSketch,
        renderImage,
        description: designDescription,
        submitTime: new Date().toISOString(),
        studentEvaluations: existingDesign?.studentEvaluations || [],
        teamworkScore: existingDesign?.teamworkScore,
        teamworkEvaluation: existingDesign?.teamworkEvaluation,
      };
      
      if (isBackendAvailable) {
        // 后端可用，提交到后端
        try {
          const response = await designAPI.create(designData);
          if (response.success) {
            await get().syncDesigns();
            return response.design;
          }
        } catch (error) {
          console.error('Failed to submit to backend:', error);
        }
      }
      
      // 后端不可用或提交失败，保存到 localStorage
      const existingIndex = designs.findIndex(d => d.groupId === currentUser.groupId);
      let newDesigns;
      if (existingIndex >= 0) {
        newDesigns = [...designs];
        newDesigns[existingIndex] = designData;
      } else {
        newDesigns = [...designs, designData];
      }
      
      set({ designs: newDesigns });
      saveToLocalStorage(newDesigns);
      
      return designData;
    },
    
    // 查询
    getCurrentGroupDesign: () => {
      const { currentUser, designs } = get();
      if (!currentUser.groupId) return undefined;
      return designs.find(d => d.groupId === currentUser.groupId);
    },
    
    hasSubmitted: () => {
      const { currentUser, designs } = get();
      if (!currentUser.groupId) return false;
      return designs.some(d => d.groupId === currentUser.groupId);
    },
    
    getAllDesigns: () => {
      return get().designs;
    },
    
    clearCurrentDesign: () => {
      set({
        selectedMaterials: [],
        selectedDesignType: null,
        designSketch: null,
        renderImage: null,
        designDescription: '',
      });
    },
    
    // 评价
    addStudentEvaluation: async (designId: string, evaluation: StudentEvaluation) => {
      const { designs, isBackendAvailable } = get();
      
      if (isBackendAvailable) {
        try {
          await designAPI.addEvaluation(designId, evaluation);
          await get().syncDesigns();
          return;
        } catch (error) {
          console.error('Failed to add evaluation to backend:', error);
        }
      }
      
      // 后端不可用，保存到 localStorage
      const design = designs.find(d => d.id === designId);
      if (!design) return;
      
      if (!design.studentEvaluations) {
        design.studentEvaluations = [];
      }
      
      const existingIndex = design.studentEvaluations.findIndex(
        e => e.evaluatorGroupId === evaluation.evaluatorGroupId
      );
      
      if (existingIndex >= 0) {
        design.studentEvaluations[existingIndex] = evaluation;
      } else {
        design.studentEvaluations.push(evaluation);
      }
      
      const newDesigns = [...designs];
      set({ designs: newDesigns });
      saveToLocalStorage(newDesigns);
    },
    
    getStudentEvaluation: (designId: string, evaluatorGroupId: string) => {
      const { designs } = get();
      const design = designs.find(d => d.id === designId);
      if (!design || !design.studentEvaluations) return undefined;
      return design.studentEvaluations.find(e => e.evaluatorGroupId === evaluatorGroupId);
    },
    
    hasEvaluated: (designId: string, evaluatorGroupId: string) => {
      return !!get().getStudentEvaluation(designId, evaluatorGroupId);
    },
    
    getEvaluationScores: (designId: string) => {
      const { designs } = get();
      const design = designs.find(d => d.id === designId);
      if (!design || !design.studentEvaluations || design.studentEvaluations.length === 0) {
        return { self: null, others: null };
      }
      
      const selfEval = design.studentEvaluations.find(e => e.evaluatorGroupId === design.groupId);
      const otherEvals = design.studentEvaluations.filter(e => e.evaluatorGroupId !== design.groupId);
      
      const calcScore = (evaluations: StudentEvaluation[]): EvaluationScores => {
        const scientific = evaluations.reduce((sum, e) => 
          sum + (e.scientific.pointsNorthSouth ? 1 : 0) + (e.scientific.rotatesFreely ? 1 : 0) + (e.scientific.hasCompassDial ? 1 : 0), 0) / evaluations.length;
        const feasibility = evaluations.reduce((sum, e) => 
          sum + (e.feasibility.materialsAvailable ? 1 : 0) + (e.feasibility.lowCost ? 1 : 0) + (e.feasibility.easyToProcess ? 1 : 0), 0) / evaluations.length;
        const practicality = evaluations.reduce((sum, e) => 
          sum + (e.practicality.compactSize ? 1 : 0) + (e.practicality.portable ? 1 : 0) + (e.practicality.easyToUse ? 1 : 0), 0) / evaluations.length;
        
        return {
          scientific: Math.round(scientific),
          feasibility: Math.round(feasibility),
          practicality: Math.round(practicality),
          total: Math.round(scientific) + Math.round(feasibility) + Math.round(practicality),
        };
      };
      
      return {
        self: selfEval ? calcScore([selfEval]) : null,
        others: otherEvals.length > 0 ? calcScore(otherEvals) : null,
      };
    },
    
    // 教师评分
    rateTeamwork: async (designId: string, score: number, evaluation: string) => {
      const { designs, isBackendAvailable } = get();
      
      if (isBackendAvailable) {
        try {
          await designAPI.setTeamwork(designId, score, evaluation);
          await get().syncDesigns();
          return;
        } catch (error) {
          console.error('Failed to rate teamwork on backend:', error);
        }
      }
      
      // 后端不可用，保存到 localStorage
      const design = designs.find(d => d.id === designId);
      if (!design) return;
      
      design.teamworkScore = score;
      design.teamworkEvaluation = evaluation;
      
      const newDesigns = [...designs];
      set({ designs: newDesigns });
      saveToLocalStorage(newDesigns);
    },
    
    // 计算总分
    getTotalScore: (designId: string) => {
      const { designs } = get();
      const design = designs.find(d => d.id === designId);
      if (!design) return null;
      
      const scores = get().getEvaluationScores(designId);
      const selfScore = scores.self?.total || 0;
      const othersScore = scores.others?.total || 0;
      const teamworkScore = design.teamworkScore || 0;
      
      return {
        self: selfScore,
        others: othersScore,
        teamwork: teamworkScore,
        total: selfScore + othersScore + teamworkScore,
      };
    },
    
    // 删除
    deleteDesign: async (designId: string) => {
      const { designs, isBackendAvailable } = get();
      
      if (isBackendAvailable) {
        try {
          await designAPI.delete(designId);
          await get().syncDesigns();
          return;
        } catch (error) {
          console.error('Failed to delete from backend:', error);
        }
      }
      
      // 后端不可用，从 localStorage 删除
      const newDesigns = designs.filter(d => d.id !== designId);
      set({ designs: newDesigns });
      saveToLocalStorage(newDesigns);
    },
    
    // 视图
    setCurrentViewingDesign: (design: Design | null) => {
      set({ currentViewingDesign: design });
    },
  })
);

// 定期同步数据（每5秒）
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useAppStore.getState();
    if (store.currentUser.type) {
      store.syncDesigns();
    }
  }, 5000);
  
  // 监听 storage 变化（其他标签页的更新）
  window.addEventListener('storage', (e) => {
    if (e.key === 'compass-design-data' && e.newValue) {
      const store = useAppStore.getState();
      store.syncDesigns();
    }
  });
}

// 用户类型
export type UserType = 'student' | 'teacher' | null;

// 当前用户信息
export interface CurrentUser {
  type: UserType;
  groupId?: string;
  groupName?: string;
}

// 材料类型
export interface Material {
  id: string;
  name: string;
  icon: string;
  category: 'basic' | 'magnetic' | 'support' | 'other';
}

// 设计类型
export type DesignType = 'floating' | 'hanging' | 'support' | null;

// 学生评价（自评或他评）
export interface StudentEvaluation {
  evaluatorGroupId: string;
  evaluatorGroupName: string;
  evaluateTime: string;
  // 科学性：能指示南北、能灵活转动、有方向盘且有8个方位
  scientific: {
    pointsNorthSouth: boolean; // 能指示南北
    rotatesFreely: boolean;    // 能灵活转动
    hasCompassDial: boolean;   // 有方向盘且有8个方位
  };
  // 可行性：材料易得、成本低、便于加工
  feasibility: {
    materialsAvailable: boolean; // 材料易得
    lowCost: boolean;            // 成本低
    easyToProcess: boolean;      // 便于加工
  };
  // 实用性：体积较小、便于携带、方便使用
  practicality: {
    compactSize: boolean;   // 体积较小
    portable: boolean;      // 便于携带
    easyToUse: boolean;     // 方便使用
  };
}

// 设计作品
export interface Design {
  id: string;
  groupId: string;
  groupName: string;
  materials: string[];
  designType: DesignType;
  designTypeName: string;
  designSketch: string;
  renderImage: string | null;
  description: string;
  submitTime: string;
  // 学生评价（包括自评和他评）
  studentEvaluations?: StudentEvaluation[];
  // 教师团队协作评分（0-2分）
  teamworkScore?: number;
  teamworkEvaluation?: string;
}

// 评价维度分数
export interface EvaluationScores {
  scientific: number;   // 科学性分数 (0-3)
  feasibility: number;  // 可行性分数 (0-3)
  practicality: number; // 实用性分数 (0-3)
  total: number;        // 总分 (0-9)
}

// 教师评价标准（保留原有）
export interface EvaluationCriteria {
  scientific: number;
  creativity: number;
  practicality: number;
  aesthetics: number;
}

// 应用状态
export interface AppState {
  currentUser: CurrentUser;
  selectedMaterials: string[];
  selectedDesignType: DesignType;
  designSketch: string | null;
  renderImage: string | null;
  designDescription: string;
  designs: Design[];
  currentViewingDesign: Design | null;
}

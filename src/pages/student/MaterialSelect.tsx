import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Info, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// 材料数据 - 按类别组织
const materials = [
  // 指针部分
  {
    id: 'steel_needle',
    name: '钢针',
    icon: '🪡',
    category: 'pointer',
    description: '细长的钢制针，可被磁铁磁化后作为指南针的指针使用',
    function: '作为磁针，指向南北方向',
  },
  {
    id: 'small_nail',
    name: '细铁钉',
    icon: '📌',
    category: 'pointer',
    description: '细小的铁制钉子，可被磁化作为指针',
    function: '作为磁针，指向南北方向',
  },
  {
    id: 'paperclip',
    name: '回形针',
    icon: '📎',
    category: 'pointer',
    description: '铁丝弯成的回形针，可被磁化后拉直作为指针',
    function: '拉直后作为磁针使用',
  },
  {
    id: 'push_pin',
    name: '大头针',
    icon: '📍',
    category: 'pointer',
    description: '带有圆头的小铁针，可被磁化作为指针',
    function: '作为磁针，指向南北方向',
  },
  // 支架/浮力部分
  {
    id: 'foam_ball',
    name: '泡沫小球',
    icon: '⚪',
    category: 'support',
    description: '轻质泡沫制成的小球，密度小于水可漂浮',
    function: '水浮式：提供浮力托住磁针',
  },
  {
    id: 'foam_sheet',
    name: '吹塑纸',
    icon: '🟦',
    category: 'support',
    description: '轻质的泡沫塑料片，可剪裁成各种形状',
    function: '水浮式：剪成小块提供浮力',
  },
  {
    id: 'cork',
    name: '软木塞',
    icon: '🍾',
    category: 'support',
    description: '天然软木制成，密度小可漂浮在水面',
    function: '水浮式：提供浮力托住磁针',
  },
  {
    id: 'bottle_cap',
    name: '塑料瓶盖',
    icon: '🧢',
    category: 'support',
    description: '塑料制成的瓶盖，可漂浮在水面',
    function: '水浮式：倒置后作为浮台',
  },
  {
    id: 'string',
    name: '细线',
    icon: '🧵',
    category: 'support',
    description: '细棉线或尼龙线，用于悬挂磁针',
    function: '悬挂式：悬挂磁针使其自由转动',
  },
  {
    id: 'support_stand',
    name: '支撑架',
    icon: '🏗️',
    category: 'support',
    description: '可折叠或固定的支架，用于支撑磁针',
    function: '支撑式/悬挂式：提供支撑点',
  },
  // 底座部分
  {
    id: 'glass_bowl',
    name: '透明碗',
    icon: '🥣',
    category: 'base',
    description: '透明玻璃或塑料碗，用于盛水',
    function: '水浮式：盛装清水让磁针漂浮',
  },
  {
    id: 'glass_cup',
    name: '玻璃杯',
    icon: '🥛',
    category: 'base',
    description: '透明玻璃杯，可用于盛水',
    function: '水浮式：盛装清水',
  },
  {
    id: 'pencil',
    name: '铅笔',
    icon: '✏️',
    category: 'base',
    description: '木质铅笔，可削尖作为支撑点',
    function: '支撑式：削尖后作为支撑尖端',
  },
  {
    id: 'wood_block',
    name: '木块',
    icon: '🪵',
    category: 'base',
    description: '小块木头，可作为底座或支撑',
    function: '支撑式：作为底座固定支撑架',
  },
  {
    id: 'wood_stick',
    name: '木棒',
    icon: '🦯',
    category: 'base',
    description: '细长的木棍，可作为支架或底座',
    function: '悬挂式/支撑式：搭建支架结构',
  },
  // 辅助材料
  {
    id: 'white_paper',
    name: '白纸',
    icon: '📄',
    category: 'auxiliary',
    description: '普通白纸，用于标注和装饰',
    function: '标注N/S极、制作刻度盘',
  },
  {
    id: 'sticker',
    name: '贴纸（标N、S极）',
    icon: '🏷️',
    category: 'auxiliary',
    description: '带有N、S标记的贴纸',
    function: '标注磁针的南北极',
  },
  {
    id: 'compass',
    name: '指南针',
    icon: '🧭',
    category: 'auxiliary',
    description: '标准指南针，用于确定南北方向',
    function: '确定南北方向，验证自制指南针',
  },
  {
    id: 'bar_magnet',
    name: '条形磁铁',
    icon: '🧲',
    category: 'auxiliary',
    description: '长条形的磁铁，用于磁化指针',
    function: '磁化钢针等指针材料',
  },
  {
    id: 'tape',
    name: '胶带',
    icon: '🩹',
    category: 'auxiliary',
    description: '透明胶带或双面胶',
    function: '固定材料、粘贴贴纸',
  },
  {
    id: 'scissors',
    name: '剪刀',
    icon: '✂️',
    category: 'auxiliary',
    description: '用于剪裁材料',
    function: '剪裁吹塑纸等材料',
  },
  {
    id: 'marker',
    name: '记号笔',
    icon: '🖊️',
    category: 'auxiliary',
    description: '用于标记和书写',
    function: '标注方向、做记号',
  },
  {
    id: 'water',
    name: '清水',
    icon: '💧',
    category: 'auxiliary',
    description: '普通自来水或矿泉水',
    function: '水浮式：提供浮力环境',
  },
  {
    id: 'clay',
    name: '橡皮泥',
    icon: '🟤',
    category: 'auxiliary',
    description: '可塑形的橡皮泥或黏土',
    function: '固定底座、调整平衡',
  },
];

const categories: Record<string, { name: string; color: string; bgColor: string; description: string }> = {
  pointer: { 
    name: '指针材料', 
    color: 'bg-red-100 text-red-700 border-red-200', 
    bgColor: 'bg-red-50',
    description: '选择一种可被磁化的材料作为指南针的指针'
  },
  support: { 
    name: '支架/浮力材料', 
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    bgColor: 'bg-blue-50',
    description: '根据设计方案选择合适的支撑或浮力材料'
  },
  base: { 
    name: '底座材料', 
    color: 'bg-green-100 text-green-700 border-green-200', 
    bgColor: 'bg-green-50',
    description: '选择稳固的底座或盛水容器'
  },
  auxiliary: { 
    name: '辅助材料', 
    color: 'bg-gray-100 text-gray-700 border-gray-200', 
    bgColor: 'bg-gray-50',
    description: '根据需要选择辅助工具和材料'
  },
};

// 每种设计方案的材料建议
const designMaterialSuggestions: Record<string, {
  required: string[];
  recommended: string[];
  optional: string[];
  incompatible: string[];
}> = {
  floating: {
    required: ['pointer', 'support', 'base', 'auxiliary'],
    recommended: ['foam_ball', 'foam_sheet', 'cork', 'bottle_cap', 'glass_bowl', 'glass_cup', 'water'],
    optional: ['white_paper', 'sticker', 'compass', 'bar_magnet', 'tape', 'marker'],
    incompatible: ['support_stand'],
  },
  support: {
    required: ['pointer', 'support', 'base'],
    recommended: ['support_stand', 'wood_block', 'wood_stick', 'pencil'],
    optional: ['white_paper', 'sticker', 'compass', 'bar_magnet', 'tape', 'clay'],
    incompatible: ['foam_ball', 'foam_sheet', 'cork', 'bottle_cap', 'water', 'glass_bowl', 'glass_cup', 'string'],
  },
  hanging: {
    required: ['pointer', 'support', 'base'],
    recommended: ['string', 'support_stand', 'wood_stick', 'wood_block'],
    optional: ['white_paper', 'sticker', 'compass', 'bar_magnet', 'tape', 'clay'],
    incompatible: ['foam_ball', 'foam_sheet', 'cork', 'bottle_cap', 'water', 'glass_bowl', 'glass_cup', 'pencil'],
  },
};

export default function MaterialSelect() {
  const navigate = useNavigate();
  const { selectedMaterials, toggleMaterial, selectedDesignType } = useAppStore();
  const [selectedMaterialInfo, setSelectedMaterialInfo] = useState<typeof materials[0] | null>(null);
  
  const suggestions = selectedDesignType ? designMaterialSuggestions[selectedDesignType] : null;
  
  const designTypeName = useMemo(() => {
    const names: Record<string, string> = {
      floating: '水浮式指南针',
      support: '支撑式指南针',
      hanging: '悬挂式指南针',
    };
    return names[selectedDesignType || ''] || '';
  }, [selectedDesignType]);
  
  const getMaterialSuitability = (materialId: string) => {
    if (!suggestions) return 'neutral';
    if (suggestions.recommended.includes(materialId)) return 'recommended';
    if (suggestions.incompatible.includes(materialId)) return 'incompatible';
    return 'neutral';
  };
  
  const getSelectionAdvice = () => {
    const pointerSelected = selectedMaterials.some(id => materials.find(m => m.id === id)?.category === 'pointer');
    const supportSelected = selectedMaterials.some(id => materials.find(m => m.id === id)?.category === 'support');
    const baseSelected = selectedMaterials.some(id => materials.find(m => m.id === id)?.category === 'base');
    
    if (!pointerSelected) {
      return { type: 'warning', message: '⚠️ 请先选择一种指针材料（钢针、细铁钉等）' };
    }
    if (!supportSelected) {
      if (selectedDesignType === 'floating') {
        return { type: 'warning', message: '⚠️ 水浮式需要选择浮力材料（泡沫小球、软木塞等）' };
      } else if (selectedDesignType === 'support') {
        return { type: 'warning', message: '⚠️ 支撑式需要选择支撑材料（支撑架、铅笔等）' };
      } else if (selectedDesignType === 'hanging') {
        return { type: 'warning', message: '⚠️ 悬挂式需要选择细线和支架' };
      }
    }
    if (!baseSelected) {
      if (selectedDesignType === 'floating') {
        return { type: 'warning', message: '⚠️ 请选择盛水容器（透明碗、玻璃杯）' };
      } else {
        return { type: 'warning', message: '⚠️ 请选择底座材料' };
      }
    }
    
    const incompatibleSelected = selectedMaterials.filter(id => suggestions?.incompatible.includes(id));
    if (incompatibleSelected.length > 0) {
      const names = incompatibleSelected.map(id => materials.find(m => m.id === id)?.name).join('、');
      return { type: 'error', message: `❌ ${designTypeName}不适合使用：${names}` };
    }
    
    return { type: 'success', message: '✅ 材料选择合理，可以继续下一步' };
  };
  
  const advice = getSelectionAdvice();
  const canProceed = advice.type === 'success';
  
  const handleNext = () => {
    if (!canProceed) {
      toast.error(advice.message);
      return;
    }
    navigate('/student/design-result');
  };
  
  const selectedCount = selectedMaterials.length;
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">选择制作材料</h1>
        <p className="text-gray-600">
          为「{designTypeName}」选择合适的材料。系统会根据您的选择给出建议。
        </p>
      </div>
      
      <div className={`mb-6 p-4 rounded-lg border ${
        advice.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
        advice.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
        'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        <div className="flex items-center gap-2">
          {advice.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           advice.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
           <Lightbulb className="w-5 h-5" />}
          <span className="font-medium">{advice.message}</span>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-gray-600">已选择材料：</span>
          <span className="font-semibold text-blue-700">{selectedCount}</span>
          <span className="text-gray-500"> 种</span>
        </div>
        {canProceed && <Badge className="bg-green-500">材料选择完成</Badge>}
      </div>
      
      <div className="space-y-6">
        {Object.entries(categories).map(([categoryId, category]) => (
          <Card key={categoryId} className="overflow-hidden">
            <CardHeader className={`${category.bgColor} pb-3`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={category.color}>{category.name}</Badge>
                </CardTitle>
                <span className="text-sm text-gray-500">{category.description}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {materials
                  .filter((m) => m.category === categoryId)
                  .map((material) => {
                    const suitability = getMaterialSuitability(material.id);
                    const isSelected = selectedMaterials.includes(material.id);
                    const isIncompatible = suitability === 'incompatible';
                    
                    return (
                      <div
                        key={material.id}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : isIncompatible
                            ? 'border-red-200 bg-red-50 opacity-60'
                            : suitability === 'recommended'
                            ? 'border-green-300 bg-green-50 hover:border-green-400'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => !isIncompatible && toggleMaterial(material.id)}
                      >
                        {suitability === 'recommended' && !isSelected && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            推荐
                          </div>
                        )}
                        {isIncompatible && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            不适用
                          </div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            disabled={isIncompatible}
                            onChange={() => {}}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-2xl mb-1">{material.icon}</div>
                            <div className="font-medium text-gray-800 text-sm">{material.name}</div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{material.function}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMaterialInfo(material);
                            }}
                          >
                            <Info className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => navigate('/student/design-type')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回选择方案
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          下一步：上传设计图
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <Dialog open={!!selectedMaterialInfo} onOpenChange={() => setSelectedMaterialInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-3xl">{selectedMaterialInfo?.icon}</span>
              {selectedMaterialInfo?.name}
            </DialogTitle>
            <DialogDescription>{selectedMaterialInfo?.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-sm text-gray-500">功能用途：</span>
              <p className="text-gray-700">{selectedMaterialInfo?.function}</p>
            </div>
            <div>
              <Badge className={categories[selectedMaterialInfo?.category || '']?.color}>
                {categories[selectedMaterialInfo?.category || '']?.name}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

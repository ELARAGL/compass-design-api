import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check, Droplets, CircleDot, Anchor } from 'lucide-react';
import { useAppStore } from '@/store';
import type { DesignType } from '@/types';

// 三种指南针设计方案
const designTypes = [
  {
    id: 'floating' as DesignType,
    name: '水浮式指南针',
    icon: Droplets,
    description: '利用水的浮力使磁针漂浮在水面上，自由旋转指向南北方向。',
    principle: '工作原理：磁针被浮力材料托浮在水面，水面的摩擦力极小，磁针可以自由转动指向地磁南北极。',
    requiredMaterials: ['指针材料', '浮力材料', '盛水容器', '清水'],
    advantages: ['摩擦极小，转动灵敏', '制作简单，成功率高', '现象直观明显'],
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'support' as DesignType,
    name: '支撑式指南针',
    icon: CircleDot,
    description: '将磁针支撑在尖端上，使其能够自由旋转指向南北方向。',
    principle: '工作原理：磁针中心支撑在尖端上，形成点接触，摩擦力小，磁针可自由旋转。',
    requiredMaterials: ['指针材料', '支撑架', '底座'],
    advantages: ['结构稳固耐用', '便于携带保存', '可做成正式指南针'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'hanging' as DesignType,
    name: '悬挂式指南针',
    icon: Anchor,
    description: '用细线将磁针悬挂起来，使其在水平面内自由转动。',
    principle: '工作原理：磁针通过细线悬挂，悬吊点位于重心，可在水平面内自由转动。',
    requiredMaterials: ['指针材料', '细线', '支架/悬挂点'],
    advantages: ['精度较高', '稳定性好', '可长期使用'],
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export default function DesignTypeSelect() {
  const navigate = useNavigate();
  const { selectedDesignType, setDesignType } = useAppStore();
  
  const handleSelect = (type: DesignType) => {
    setDesignType(type);
  };
  
  const handleNext = () => {
    if (!selectedDesignType) return;
    navigate('/student/materials');
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">选择设计方案</h1>
        <p className="text-gray-600">请选择一种指南针设计方案，系统将指导您选择合适的材料。</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {designTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-xl ${
              selectedDesignType === type.id
                ? `ring-2 ring-offset-2 ${type.borderColor.replace('border', 'ring')} shadow-lg`
                : 'hover:border-gray-300'
            }`}
            onClick={() => handleSelect(type.id)}
          >
            <CardHeader className={`${type.bgColor} rounded-t-lg pb-4`}>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 shadow-md`}>
                <type.icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">{type.name}</CardTitle>
              <CardDescription className="text-sm mt-2">{type.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* 优点 */}
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">优点：</p>
                <ul className="space-y-1">
                  {type.advantages.map((adv, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* 选择状态 */}
              {selectedDesignType === type.id && (
                <div className={`flex items-center justify-center gap-2 ${type.color.replace('from-', 'text-').split(' ')[0]} font-medium pt-2 border-t`}>
                  <Check className="w-5 h-5" />
                  已选择此方案
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/login')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回登录
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedDesignType}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          下一步：选择材料
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Upload, Camera, Loader2, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// 豆包API配置
const DOUBAO_API_KEY = 'ba7579db-3ad3-4e86-891a-7a9dad515330';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

// 材料名称映射
const materialNames: Record<string, string> = {
  steel_needle: '钢针', small_nail: '细铁钉', paperclip: '回形针', push_pin: '大头针',
  foam_ball: '泡沫小球', foam_sheet: '吹塑纸', cork: '软木塞', bottle_cap: '塑料瓶盖',
  string: '细线', support_stand: '支撑架',
  glass_bowl: '透明碗', glass_cup: '玻璃杯', pencil: '铅笔', wood_block: '木块', wood_stick: '木棒',
  white_paper: '白纸', sticker: '贴纸', compass: '指南针', bar_magnet: '条形磁铁',
  tape: '胶带', scissors: '剪刀', marker: '记号笔', water: '清水', clay: '橡皮泥',
};

// 材料分类
const materialCategories: Record<string, string[]> = {
  pointer: ['steel_needle', 'small_nail', 'paperclip', 'push_pin'],
  float: ['foam_ball', 'foam_sheet', 'cork', 'bottle_cap'],
  support: ['support_stand', 'pencil', 'wood_block', 'wood_stick'],
  hang: ['string'],
  container: ['glass_bowl', 'glass_cup'],
};

function buildPrompt(designType: string, materials: string[]): string {
  const pointerMat = materials.find(m => materialCategories.pointer.includes(m));
  const floatMat = materials.find(m => materialCategories.float.includes(m));
  const supportMat = materials.find(m => materialCategories.support.includes(m));
  const hangMat = materials.find(m => materialCategories.hang.includes(m));
  const containerMat = materials.find(m => materialCategories.container.includes(m));
  
  const pointerName = pointerMat ? materialNames[pointerMat] : '磁针';
  const floatName = floatMat ? materialNames[floatMat] : '浮力材料';
  const supportName = supportMat ? materialNames[supportMat] : '支撑架';
  const hangName = hangMat ? materialNames[hangMat] : '细线';
  const containerName = containerMat ? materialNames[containerMat] : '透明容器';
  
  let structureDescription = '';
  let workingPrinciple = '';
  
  switch (designType) {
    case 'floating':
      structureDescription = `
A functional floating compass (水浮式指南针) with the following working structure:
- A ${pointerName} (magnetic needle) placed on top of ${floatName} floating in water
- The ${floatName} provides buoyancy to keep the needle afloat
- The needle is free to rotate on the water surface with minimal friction
- ${containerName} filled with clear water serves as the base
- The needle clearly points to north and south directions
- The compass dial with N/S markings is visible below the floating needle`;
      workingPrinciple = 'Water buoyancy allows the magnetic needle to float and rotate freely';
      break;
      
    case 'support':
      structureDescription = `
A functional support-type compass (支撑式指南针) with the following working structure:
- A ${pointerName} (magnetic needle) balanced on a sharp point/support
- The ${supportName} provides a pivot point at the center of the needle
- The needle can rotate horizontally around the support point
- ${containerName} or a wooden base serves as the stable foundation
- The needle clearly points to north and south directions
- A compass dial with 8-direction markings (N, NE, E, SE, S, SW, W, NW) is placed underneath`;
      workingPrinciple = 'The needle is supported at its center, allowing it to rotate freely with minimal friction';
      break;
      
    case 'hanging':
      structureDescription = `
A functional hanging compass (悬挂式指南针) with the following working structure:
- A ${pointerName} (magnetic needle) suspended by ${hangName} from above
- The ${hangName} is attached at the center of gravity of the needle
- The needle hangs horizontally and can rotate freely in the air
- ${supportName} or a frame provides the overhead suspension point
- The needle clearly points to north and south directions
- A compass dial is placed below the hanging needle for reading directions`;
      workingPrinciple = 'The needle is suspended by a string at its center, allowing free rotation in a horizontal plane';
      break;
      
    default:
      structureDescription = 'A functional magnetic compass';
      workingPrinciple = 'Magnetic needle aligns with Earth\'s magnetic field';
  }
  
  const materialsList = materials.map(m => materialNames[m] || m).join('、');
  
  return `A photorealistic product rendering of a working magnetic compass made by elementary school students.

DESIGN TYPE: ${designType === 'floating' ? '水浮式指南针 (Floating Compass)' : designType === 'support' ? '支撑式指南针 (Support Compass)' : '悬挂式指南针 (Hanging Compass)'}

MATERIALS USED: ${materialsList}

STRUCTURE AND WORKING PRINCIPLE:${structureDescription}

Working Principle: ${workingPrinciple}

VISUAL REQUIREMENTS:
- The compass must look FUNCTIONAL and PRACTICAL, not decorative
- The magnetic needle must be clearly visible and pointing in a specific direction (not random)
- The construction must show how the materials are actually assembled
- Realistic materials: metal needle, ${floatName || supportName || hangName}, ${containerName}
- Clean, simple background (white or light gray)
- Professional product photography style
- The compass should look like something a student could actually build and use
- Show the compass from a 3/4 angle to clearly see the structure
- Include the compass dial with N/S markings visible

LIGHTING: Soft studio lighting from the side to show material textures and shadows

STYLE: Educational product photo, realistic, not artistic or abstract`;
}

export default function DesignResult() {
  const navigate = useNavigate();
  const store = useAppStore();
  
  // 直接从 store 读取状态
  const selectedMaterials = store.selectedMaterials;
  const selectedDesignType = store.selectedDesignType;
  const designSketch = store.designSketch;
  const renderImage = store.renderImage;
  const designDescription = store.designDescription;
  const currentUser = store.currentUser;
  const designs = store.designs;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // 检查是否已提交
  const myDesign = designs.find(d => d.groupId === currentUser.groupId);
  const submitted = !!myDesign;
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      store.setDesignSketch(result);
      toast.success('设计草图上传成功！');
    };
    reader.readAsDataURL(file);
  };
  
  const generateRenderImage = async () => {
    if (!designSketch) {
      toast.error('请先上传设计草图');
      return;
    }
    
    if (!selectedDesignType) {
      toast.error('请先选择设计方案');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const prompt = buildPrompt(selectedDesignType, selectedMaterials);
      
      const response = await fetch(DOUBAO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DOUBAO_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'doubao-seedream-5-0-260128',
          prompt: prompt,
          sequential_image_generation: 'disabled',
          response_format: 'url',
          size: '2K',
          stream: false,
          watermark: true,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`生成失败: ${response.status} ${errorData.error?.message || ''}`);
      }
      
      const data = await response.json();
      
      let imageUrl = null;
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        imageUrl = data.data[0].url || data.data[0].b64_json;
      } else if (data.url) {
        imageUrl = data.url;
      } else if (data.image_url) {
        imageUrl = data.image_url;
      } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        imageUrl = data.images[0].url || data.images[0];
      }
      
      if (imageUrl) {
        store.setRenderImage(imageUrl);
        toast.success('渲染图生成成功！');
      } else {
        throw new Error('返回数据格式错误，请联系管理员');
      }
    } catch (error: any) {
      toast.error(error.message || '生成渲染图失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!designSketch) {
      toast.error('请先上传设计草图');
      return;
    }
    if (!designDescription.trim()) {
      toast.error('请填写设计说明');
      return;
    }
    const result = await store.submitDesign();
    if (result) {
      toast.success('设计提交成功！');
      setShowSubmitDialog(true);
    } else {
      toast.error('提交失败，请重试');
    }
  };
  
  const getDesignTypeName = () => {
    const names: Record<string, string> = { floating: '水浮式指南针', support: '支撑式指南针', hanging: '悬挂式指南针' };
    return names[selectedDesignType || ''] || '';
  };
  
  // 如果已提交，显示提交成功页面
  if (submitted && myDesign) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">设计方案</h1>
          <p className="text-gray-600">您已完成设计提交</p>
        </div>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">设计已提交</h2>
            <p className="text-green-600 mb-6">您的小组「{myDesign.groupName}」已成功提交设计作品</p>
            <Button variant="outline" onClick={() => navigate('/student/showcase')}>查看展示交流</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">设计方案</h1>
        <p className="text-gray-600">上传您的手绘设计草图，AI将为您生成精美的渲染效果图。</p>
      </div>
      
      {/* 已选方案与材料 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>当前设计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">设计方案：</span>
            {selectedDesignType ? (
              <Badge className="bg-blue-500">{getDesignTypeName()}</Badge>
            ) : (
              <span className="text-gray-400">未选择</span>
            )}
          </div>
          <div>
            <span className="text-gray-500">已选材料（{selectedMaterials.length}种）：</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMaterials.length > 0 ? (
                selectedMaterials.map((id) => (
                  <Badge key={id} variant="secondary">{materialNames[id] || id}</Badge>
                ))
              ) : (
                <span className="text-gray-400">未选择材料</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 上传草图 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            上传手绘设计草图
          </CardTitle>
          <CardDescription>请拍摄或上传您手绘的指南针设计草图</CardDescription>
        </CardHeader>
        <CardContent>
          {!designSketch ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">点击上传设计草图</p>
              <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={designSketch} 
                alt="设计草图" 
                className="w-full max-h-96 object-contain rounded-lg border" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2 flex items-center gap-1" 
                onClick={() => store.setDesignSketch(null)}
              >
                <X className="w-4 h-4" />
                重新上传
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 生成渲染图 */}
      {designSketch && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI渲染效果图
            </CardTitle>
            <CardDescription>AI将根据您的设计方案和材料生成合理的指南针渲染图</CardDescription>
          </CardHeader>
          <CardContent>
            {!renderImage ? (
              <div className="text-center p-8 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50">
                <p className="text-gray-600 mb-4">点击按钮生成AI渲染效果图</p>
                <Button 
                  onClick={generateRenderImage} 
                  disabled={isGenerating} 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />生成中...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />生成渲染图</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={renderImage} 
                  alt="渲染效果图" 
                  className="w-full max-h-96 object-contain rounded-lg border" 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2" 
                  onClick={generateRenderImage} 
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : '重新生成'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* 设计说明 */}
      {renderImage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>设计说明</CardTitle>
            <CardDescription>请简要说明您的设计思路和工作原理</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="例如：我们小组设计的是水浮式指南针，利用泡沫小球提供浮力，让磁针漂浮在水面上自由转动..." 
              value={designDescription} 
              onChange={(e) => store.setDesignDescription(e.target.value)} 
              rows={4} 
            />
          </CardContent>
        </Card>
      )}
      
      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/student/materials')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回选择材料
        </Button>
        {renderImage && (
          <Button 
            onClick={handleSubmit} 
            disabled={!designDescription.trim()} 
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            提交设计
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
      
      {/* 提交成功对话框 */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 提交成功！</DialogTitle>
            <DialogDescription className="text-center">
              您的设计已成功提交，请前往展示交流页面查看所有作品
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate('/student/showcase')}>前往展示交流</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

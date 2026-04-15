import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trophy, Users, Calendar, ChevronLeft, ChevronRight, CheckCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Design, StudentEvaluation, EvaluationScores } from '@/types';

// 评价维度配置
const evaluationDimensions = [
  {
    key: 'scientific' as const,
    name: '科学性',
    description: '考察指南针的科学原理实现',
    criteria: [
      { key: 'pointsNorthSouth', label: '能指示南北' },
      { key: 'rotatesFreely', label: '能灵活转动' },
      { key: 'hasCompassDial', label: '有方向盘，且有8个方位' },
    ],
  },
  {
    key: 'feasibility' as const,
    name: '可行性',
    description: '考察制作的可行性',
    criteria: [
      { key: 'materialsAvailable', label: '材料易得' },
      { key: 'lowCost', label: '成本低' },
      { key: 'easyToProcess', label: '便于加工' },
    ],
  },
  {
    key: 'practicality' as const,
    name: '实用性',
    description: '考察实际使用效果',
    criteria: [
      { key: 'compactSize', label: '体积较小' },
      { key: 'portable', label: '便于携带' },
      { key: 'easyToUse', label: '方便使用' },
    ],
  },
];

function ScoreDisplay({ label, scores, isAverage = false }: { label: string; scores: EvaluationScores | null; isAverage?: boolean }) {
  if (!scores) return null;
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <Badge className={isAverage ? 'bg-purple-500' : 'bg-blue-500'}>
          总分: {scores.total}/9
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center">
          <div className="text-gray-500">科学性</div>
          <div className="font-semibold">{scores.scientific}/3</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">可行性</div>
          <div className="font-semibold">{scores.feasibility}/3</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">实用性</div>
          <div className="font-semibold">{scores.practicality}/3</div>
        </div>
      </div>
    </div>
  );
}

function EvaluationForm({ 
  design, 
  currentUser, 
  existingEvaluation, 
  onSubmit, 
  onCancel 
}: { 
  design: Design; 
  currentUser: { groupId?: string; groupName?: string };
  existingEvaluation?: StudentEvaluation;
  onSubmit: (evaluation: StudentEvaluation) => void;
  onCancel: () => void;
}) {
  const isSelfEvaluation = design.groupId === currentUser.groupId;
  
  const [scientific, setScientific] = useState({
    pointsNorthSouth: existingEvaluation?.scientific.pointsNorthSouth || false,
    rotatesFreely: existingEvaluation?.scientific.rotatesFreely || false,
    hasCompassDial: existingEvaluation?.scientific.hasCompassDial || false,
  });
  
  const [feasibility, setFeasibility] = useState({
    materialsAvailable: existingEvaluation?.feasibility.materialsAvailable || false,
    lowCost: existingEvaluation?.feasibility.lowCost || false,
    easyToProcess: existingEvaluation?.feasibility.easyToProcess || false,
  });
  
  const [practicality, setPracticality] = useState({
    compactSize: existingEvaluation?.practicality.compactSize || false,
    portable: existingEvaluation?.practicality.portable || false,
    easyToUse: existingEvaluation?.practicality.easyToUse || false,
  });
  
  const handleSubmit = () => {
    const evaluation: StudentEvaluation = {
      evaluatorGroupId: currentUser.groupId!,
      evaluatorGroupName: currentUser.groupName!,
      evaluateTime: new Date().toISOString(),
      scientific,
      feasibility,
      practicality,
    };
    onSubmit(evaluation);
  };
  
  const calcCurrentScore = (): EvaluationScores => {
    const sci = (scientific.pointsNorthSouth ? 1 : 0) + (scientific.rotatesFreely ? 1 : 0) + (scientific.hasCompassDial ? 1 : 0);
    const fea = (feasibility.materialsAvailable ? 1 : 0) + (feasibility.lowCost ? 1 : 0) + (feasibility.easyToProcess ? 1 : 0);
    const pra = (practicality.compactSize ? 1 : 0) + (practicality.portable ? 1 : 0) + (practicality.easyToUse ? 1 : 0);
    return { scientific: sci, feasibility: fea, practicality: pra, total: sci + fea + pra };
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">
          {isSelfEvaluation ? '自评：' : '评价：'}{design.groupName} 的作品
        </p>
        <p className="text-blue-600 text-sm">
          请根据每个维度的标准进行勾选，每项达标得1分
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-800">1. 科学性</h4>
          <span className="text-sm text-gray-500">（考察指南针的科学原理实现）</span>
        </div>
        <div className="space-y-2 pl-4">
          {evaluationDimensions[0].criteria.map((criterion) => (
            <div key={criterion.key} className="flex items-center gap-3">
              <Checkbox
                checked={scientific[criterion.key as keyof typeof scientific]}
                onCheckedChange={(checked) => 
                  setScientific(prev => ({ ...prev, [criterion.key]: checked }))
                }
              />
              <Label className="cursor-pointer">{criterion.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-800">2. 可行性</h4>
          <span className="text-sm text-gray-500">（考察制作的可行性）</span>
        </div>
        <div className="space-y-2 pl-4">
          {evaluationDimensions[1].criteria.map((criterion) => (
            <div key={criterion.key} className="flex items-center gap-3">
              <Checkbox
                checked={feasibility[criterion.key as keyof typeof feasibility]}
                onCheckedChange={(checked) => 
                  setFeasibility(prev => ({ ...prev, [criterion.key]: checked }))
                }
              />
              <Label className="cursor-pointer">{criterion.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-800">3. 实用性</h4>
          <span className="text-sm text-gray-500">（考察实际使用效果）</span>
        </div>
        <div className="space-y-2 pl-4">
          {evaluationDimensions[2].criteria.map((criterion) => (
            <div key={criterion.key} className="flex items-center gap-3">
              <Checkbox
                checked={practicality[criterion.key as keyof typeof practicality]}
                onCheckedChange={(checked) => 
                  setPracticality(prev => ({ ...prev, [criterion.key]: checked }))
                }
              />
              <Label className="cursor-pointer">{criterion.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium">当前得分：</span>
          <div className="flex gap-4 text-sm">
            <span>科学性: {(scientific.pointsNorthSouth ? 1 : 0) + (scientific.rotatesFreely ? 1 : 0) + (scientific.hasCompassDial ? 1 : 0)}/3</span>
            <span>可行性: {(feasibility.materialsAvailable ? 1 : 0) + (feasibility.lowCost ? 1 : 0) + (feasibility.easyToProcess ? 1 : 0)}/3</span>
            <span>实用性: {(practicality.compactSize ? 1 : 0) + (practicality.portable ? 1 : 0) + (practicality.easyToUse ? 1 : 0)}/3</span>
            <span className="font-bold">总分: {calcCurrentScore().total}/9</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>取消</Button>
        <Button className="flex-1" onClick={handleSubmit}>
          {existingEvaluation ? '更新评价' : '提交评价'}
        </Button>
      </div>
    </div>
  );
}

function TotalScoreDisplay({ totalScore }: { totalScore: { self: number; others: number; teamwork: number; total: number } | null }) {
  if (!totalScore) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-800">作品总分</span>
        <Badge className="bg-blue-600 text-lg px-3 py-1">
          {totalScore.total}/20
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-center bg-white p-2 rounded">
          <div className="text-gray-500 text-xs">自评</div>
          <div className="font-semibold text-blue-600">{totalScore.self}</div>
        </div>
        <div className="text-center bg-white p-2 rounded">
          <div className="text-gray-500 text-xs">他评</div>
          <div className="font-semibold text-purple-600">{totalScore.others}</div>
        </div>
        <div className="text-center bg-white p-2 rounded">
          <div className="text-gray-500 text-xs">团队</div>
          <div className="font-semibold text-orange-600">{totalScore.teamwork}</div>
        </div>
      </div>
    </div>
  );
}

export default function Showcase() {
  const { getAllDesigns, currentUser, addStudentEvaluation, getStudentEvaluation, hasEvaluated, getEvaluationScores, getTotalScore } = useAppStore();
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [evaluatingDesign, setEvaluatingDesign] = useState<Design | null>(null);
  
  const designs = getAllDesigns();
  const myDesign = designs.find(d => d.groupId === currentUser.groupId);
  const rankedDesigns = [...designs]
    .filter(d => d.studentEvaluations && d.studentEvaluations.length > 0)
    .sort((a, b) => {
      const totalA = getTotalScore(a.id)?.total || 0;
      const totalB = getTotalScore(b.id)?.total || 0;
      return totalB - totalA;
    });
  
  const myRank = myDesign ? rankedDesigns.findIndex(d => d.id === myDesign.id) + 1 : null;
  
  const openDesignDetail = (design: Design) => {
    setSelectedDesign(design);
    setCurrentImageIndex(0);
  };
  
  const openEvaluation = (design: Design, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEvaluatingDesign(design);
    setShowEvaluationDialog(true);
  };
  
  const handleSubmitEvaluation = async (evaluation: StudentEvaluation) => {
    if (evaluatingDesign) {
      await addStudentEvaluation(evaluatingDesign.id, evaluation);
      const isSelf = evaluatingDesign.groupId === currentUser.groupId;
      toast.success(isSelf ? '自评提交成功！' : '评价提交成功！');
      setShowEvaluationDialog(false);
      setEvaluatingDesign(null);
    }
  };
  
  const getDesignImages = (design: Design) => {
    const images = [];
    if (design.designSketch) images.push({ type: '草图', url: design.designSketch });
    if (design.renderImage) images.push({ type: '渲染图', url: design.renderImage });
    return images;
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">展示交流</h1>
        <p className="text-gray-600">查看所有小组的设计作品，进行自评和互评</p>
      </div>
      
      {myDesign && (
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              我的作品
              {myRank && myRank > 0 && <Badge className="ml-2 bg-yellow-500">排名第 {myRank}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 cursor-pointer" onClick={() => openDesignDetail(myDesign)}>
                <img src={myDesign.renderImage || myDesign.designSketch} alt="我的设计" className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{myDesign.groupName}</span>
                  <Badge variant="secondary">{myDesign.designTypeName}</Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{myDesign.description}</p>
                
                <TotalScoreDisplay totalScore={getTotalScore(myDesign.id)} />
                
                {(() => {
                  const scores = getEvaluationScores(myDesign.id);
                  return (
                    <div className="space-y-3 mt-4">
                      {scores.self && <ScoreDisplay label="自评详情" scores={scores.self} />}
                      {scores.others && <ScoreDisplay label="他评详情" scores={scores.others} isAverage />}
                      {!scores.self && !scores.others && (
                        <p className="text-gray-500 text-sm">暂无评价</p>
                      )}
                    </div>
                  );
                })()}
                
                <Button 
                  size="sm" 
                  className="mt-4" 
                  onClick={(e) => openEvaluation(myDesign, e)}
                >
                  {hasEvaluated(myDesign.id, currentUser.groupId!) ? '修改自评' : '进行自评'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {rankedDesigns.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              评价排行榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankedDesigns.slice(0, 5).map((design, index) => {
                const totalScore = getTotalScore(design.id);
                const scores = getEvaluationScores(design.id);
                
                return (
                  <div key={design.id} className={`flex items-center gap-4 p-3 rounded-lg ${design.groupId === currentUser.groupId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>{index + 1}</div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img src={design.renderImage || design.designSketch} alt={design.groupName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{design.groupName}</span>
                      <span className="text-gray-500 text-sm ml-2">{design.designTypeName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {scores.self && <span className="text-blue-600">自评: {scores.self.total}</span>}
                      {scores.others && <span className="text-purple-600">他评: {scores.others.total}</span>}
                      {totalScore && totalScore.teamwork > 0 && <span className="text-orange-600">团队: {totalScore.teamwork}</span>}
                      <span className="font-bold text-lg">{totalScore ? totalScore.total : '-'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader><CardTitle>全部作品</CardTitle></CardHeader>
        <CardContent>
          {designs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无作品提交</p>
              <p className="text-sm">成为第一个提交设计的小组吧！</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => {
                const isMyDesign = design.groupId === currentUser.groupId;
                const hasEvaluatedThis = hasEvaluated(design.id, currentUser.groupId!);
                const scores = getEvaluationScores(design.id);
                
                return (
                  <Card key={design.id} className={`cursor-pointer hover:shadow-lg transition-shadow ${isMyDesign ? 'ring-2 ring-blue-500' : ''}`} onClick={() => openDesignDetail(design)}>
                    <div className="relative">
                      <img src={design.renderImage || design.designSketch} alt={design.groupName} className="w-full h-48 object-cover rounded-t-lg" />
                      {isMyDesign && <Badge className="absolute top-2 right-2 bg-blue-500">我的作品</Badge>}
                      {hasEvaluatedThis && <Badge className="absolute top-2 left-2 bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已评价</Badge>}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{design.groupName}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs mb-2">{design.designTypeName}</Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(design.submitTime).toLocaleDateString()}
                      </div>
                      
                      {(() => {
                        const totalScore = getTotalScore(design.id);
                        return totalScore && totalScore.total > 0 ? (
                          <div className="text-xs space-y-1 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded border border-blue-100">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">总分</span>
                              <span className="font-bold text-blue-600">{totalScore.total}/20</span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              {scores.self && <span className="text-blue-600">自{scores.self.total}</span>}
                              {scores.others && <span className="text-purple-600">他{scores.others.total}</span>}
                              {totalScore.teamwork > 0 && <span className="text-orange-600">团{totalScore.teamwork}</span>}
                            </div>
                          </div>
                        ) : null;
                      })()}
                      
                      {!isMyDesign && (
                        <Button 
                          size="sm" 
                          variant={hasEvaluatedThis ? "outline" : "default"}
                          className="w-full mt-3"
                          onClick={(e) => openEvaluation(design, e)}
                        >
                          {hasEvaluatedThis ? '修改评价' : '评价此作品'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedDesign} onOpenChange={() => setSelectedDesign(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          {selectedDesign && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedDesign.groupName}
                  {selectedDesign.groupId === currentUser.groupId && <Badge className="bg-blue-500">我的作品</Badge>}
                </DialogTitle>
                <DialogDescription>{selectedDesign.designTypeName} · {new Date(selectedDesign.submitTime).toLocaleString()}</DialogDescription>
              </DialogHeader>
              
              <div className="relative">
                {getDesignImages(selectedDesign).length > 0 && (
                  <>
                    <img src={getDesignImages(selectedDesign)[currentImageIndex]?.url} alt="设计图" className="w-full max-h-96 object-contain rounded-lg" />
                    <Badge className="absolute top-2 left-2">{getDesignImages(selectedDesign)[currentImageIndex]?.type}</Badge>
                    {getDesignImages(selectedDesign).length > 1 && (
                      <>
                        <Button variant="outline" size="sm" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={() => setCurrentImageIndex(prev => prev === 0 ? getDesignImages(selectedDesign).length - 1 : prev - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setCurrentImageIndex(prev => prev === getDesignImages(selectedDesign).length - 1 ? 0 : prev + 1)}><ChevronRight className="w-4 h-4" /></Button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">使用材料：</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDesign.materials.map((materialId) => {
                    const names: Record<string, string> = {
                      steel_needle: '钢针', small_nail: '细铁钉', paperclip: '回形针', push_pin: '大头针',
                      foam_ball: '泡沫小球', foam_sheet: '吹塑纸', cork: '软木塞', bottle_cap: '塑料瓶盖',
                      string: '细线', support_stand: '支撑架',
                      glass_bowl: '透明碗', glass_cup: '玻璃杯', pencil: '铅笔', wood_block: '木块', wood_stick: '木棒',
                      white_paper: '白纸', sticker: '贴纸', compass: '指南针', bar_magnet: '条形磁铁',
                      tape: '胶带', scissors: '剪刀', marker: '记号笔', water: '清水', clay: '橡皮泥',
                    };
                    return <Badge key={materialId} variant="secondary">{names[materialId] || materialId}</Badge>;
                  })}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">设计说明：</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedDesign.description}</p>
              </div>
              
              <TotalScoreDisplay totalScore={getTotalScore(selectedDesign.id)} />
              
              {(() => {
                const scores = getEvaluationScores(selectedDesign.id);
                return (
                  <div className="border-t pt-4 space-y-3">
                    <p className="font-medium text-gray-700">评价详情</p>
                    {scores.self && <ScoreDisplay label="自评详情" scores={scores.self} />}
                    {scores.others && <ScoreDisplay label="他评详情" scores={scores.others} isAverage />}
                    {!scores.self && !scores.others && <p className="text-gray-500 text-sm">暂无评价</p>}
                  </div>
                );
              })()}
              
              {selectedDesign.groupId !== currentUser.groupId && (
                <div className="border-t pt-4">
                  <Button onClick={() => { setSelectedDesign(null); openEvaluation(selectedDesign); }}>
                    {hasEvaluated(selectedDesign.id, currentUser.groupId!) ? '修改评价' : '评价此作品'}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>作品评价</DialogTitle>
          </DialogHeader>
          {evaluatingDesign && (
            <EvaluationForm
              design={evaluatingDesign}
              currentUser={currentUser}
              existingEvaluation={getStudentEvaluation(evaluatingDesign.id, currentUser.groupId!)}
              onSubmit={handleSubmitEvaluation}
              onCancel={() => { setShowEvaluationDialog(false); setEvaluatingDesign(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, ChevronLeft, ChevronRight, TrendingUp, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Design } from '@/types';

// 总分显示组件
function TotalScoreDisplay({ totalScore }: { totalScore: { self: number; others: number; teamwork: number; total: number } | null }) {
  if (!totalScore || totalScore.total === 0) return (
    <div className="text-gray-500 text-sm">暂无评分</div>
  );
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

// 评价详情组件
function EvaluationDetail({ 
  scores 
}: { 
  scores?: { scientific: number; feasibility: number; practicality: number; total: number } 
}) {
  if (!scores) return null;
  return (
    <div className="bg-gray-50 p-3 rounded-lg text-sm">
      <div className="flex justify-between mb-2">
        <span className="text-gray-600">科学性</span>
        <span className="font-medium">{scores.scientific}/3</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-gray-600">可行性</span>
        <span className="font-medium">{scores.feasibility}/3</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">实用性</span>
        <span className="font-medium">{scores.practicality}/3</span>
      </div>
    </div>
  );
}

export default function TeacherShowcase() {
  const { getAllDesigns, getTotalScore, getEvaluationScores } = useAppStore();
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const designs = getAllDesigns();
  
  // 按总分排序
  const rankedDesigns = [...designs]
    .filter(d => {
      const total = getTotalScore(d.id);
      return total && total.total > 0;
    })
    .sort((a, b) => {
      const scoreA = getTotalScore(a.id)?.total || 0;
      const scoreB = getTotalScore(b.id)?.total || 0;
      return scoreB - scoreA;
    });
  
  // 计算平均分
  const averageScore = rankedDesigns.length > 0 
    ? (rankedDesigns.reduce((sum, d) => sum + (getTotalScore(d.id)?.total || 0), 0) / rankedDesigns.length).toFixed(1) 
    : '0';
  
  // 最高分
  const highestScore = rankedDesigns.length > 0 ? getTotalScore(rankedDesigns[0].id)?.total || 0 : 0;
  
  // 已评分数量
  const ratedCount = designs.filter(d => {
    const total = getTotalScore(d.id);
    return total && total.total > 0;
  }).length;
  
  const openDesignDetail = (design: Design) => {
    setSelectedDesign(design);
    setCurrentImageIndex(0);
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
        <p className="text-gray-600">查看所有小组的设计作品，了解学生的学习成果</p>
      </div>
      
      {/* 统计概览 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-sm text-gray-500">总作品数</p><p className="text-xl font-bold">{designs.length}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-sm text-gray-500">平均分</p><p className="text-xl font-bold">{averageScore}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Trophy className="w-5 h-5 text-yellow-600" /></div>
              <div><p className="text-sm text-gray-500">最高分</p><p className="text-xl font-bold">{highestScore}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
              <div><p className="text-sm text-gray-500">已评分</p><p className="text-xl font-bold">{ratedCount}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 排行榜 */}
      {rankedDesigns.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              作品排行榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankedDesigns.slice(0, 10).map((design, index) => {
                const totalScore = getTotalScore(design.id);
                const evalScores = getEvaluationScores(design.id);
                
                return (
                  <div key={design.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
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
                      {evalScores.self && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">自评</div>
                          <div className="text-blue-600 font-medium">{evalScores.self.total}</div>
                        </div>
                      )}
                      {evalScores.others && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">他评</div>
                          <div className="text-purple-600 font-medium">{evalScores.others.total}</div>
                        </div>
                      )}
                      {totalScore && totalScore.teamwork > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500">团队</div>
                          <div className="text-orange-600 font-medium">{totalScore.teamwork}</div>
                        </div>
                      )}
                      <div className="text-center min-w-[60px]">
                        <div className="text-xs text-gray-500">总分</div>
                        <div className="text-xl font-bold text-blue-600">{totalScore?.total || '-'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 全部作品 */}
      <Card>
        <CardHeader><CardTitle>全部作品</CardTitle></CardHeader>
        <CardContent>
          {designs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无作品提交</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => {
                const totalScore = getTotalScore(design.id);
                const evalScores = getEvaluationScores(design.id);
                
                return (
                  <Card key={design.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openDesignDetail(design)}>
                    <div className="relative">
                      <img src={design.renderImage || design.designSketch} alt={design.groupName} className="w-full h-48 object-cover rounded-t-lg" />
                      {totalScore && totalScore.total > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-lg font-bold">
                          {totalScore.total} 分
                        </div>
                      )}
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
                      
                      {/* 分数详情 */}
                      {totalScore && totalScore.total > 0 && (
                        <div className="text-xs space-y-1 bg-gray-50 p-2 rounded mb-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">自评</span>
                            <span className="text-blue-600 font-medium">{evalScores.self?.total || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">他评</span>
                            <span className="text-purple-600 font-medium">{evalScores.others?.total || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">团队</span>
                            <span className="text-orange-600 font-medium">{totalScore.teamwork}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 作品详情对话框 */}
      <Dialog open={!!selectedDesign} onOpenChange={() => setSelectedDesign(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          {selectedDesign && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedDesign.groupName}
                  <Badge>{selectedDesign.designTypeName}</Badge>
                </DialogTitle>
                <DialogDescription>{new Date(selectedDesign.submitTime).toLocaleString()}</DialogDescription>
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
              
              {/* 作品总分 */}
              <div className="border-t pt-4">
                <p className="font-medium text-gray-700 mb-3">作品总分</p>
                <TotalScoreDisplay totalScore={getTotalScore(selectedDesign.id)} />
              </div>
              
              {/* 评价详情 */}
              {(() => {
                const evalScores = getEvaluationScores(selectedDesign.id);
                return (
                  <div className="border-t pt-4 space-y-3">
                    <p className="font-medium text-gray-700">评价详情</p>
                    {evalScores.self && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">自评</p>
                        <EvaluationDetail scores={evalScores.self} />
                      </div>
                    )}
                    {evalScores.others && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">他评平均分</p>
                        <EvaluationDetail scores={evalScores.others} />
                      </div>
                    )}
                    {selectedDesign.teamworkScore !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">团队协作评分</p>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span>团队协作</span>
                            <Badge className={selectedDesign.teamworkScore > 0 ? 'bg-green-500' : 'bg-gray-400'}>
                              {selectedDesign.teamworkScore > 0 ? '高效协作 🌟' : '需改进'}
                            </Badge>
                          </div>
                          {selectedDesign.teamworkEvaluation && (
                            <p className="text-sm text-gray-600 mt-2">{selectedDesign.teamworkEvaluation}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

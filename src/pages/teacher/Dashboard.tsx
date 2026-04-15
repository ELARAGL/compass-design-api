import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Trash2, Search, Users, Calendar, CheckCircle, BarChart3, TrendingUp, RefreshCw, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Design } from '@/types';

// 堆积柱状图数据类型
interface GroupStat {
  groupId: string;
  groupName: string;
  submitted: number;
  selfEvaluated: number;
  peerEvaluated: number;
}

export default function TeacherDashboard() {
  const store = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  
  const [teamworkScore, setTeamworkScore] = useState<number>(0);
  const [teamworkEvaluation, setTeamworkEvaluation] = useState('');
  
  const designs = store.designs;
  
  // 定期同步数据（每5秒）
  useEffect(() => {
    const interval = setInterval(() => {
      store.syncDesigns();
      setLastUpdateTime(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [store]);
  
  // 强制刷新数据
  const handleRefresh = async () => {
    await store.syncDesigns();
    toast.success(`数据已刷新，共 ${designs.length} 个作品`);
    setHasNewUpdates(false);
    setLastUpdateTime(new Date());
  };
  
  const filteredDesigns = useMemo(() => {
    return designs.filter(design =>
      design.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.designTypeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [designs, searchTerm]);
  
  // 计算统计数据
  const stats = useMemo(() => {
    const submittedCount = designs.length;
    
    const selfEvaluatedCount = designs.filter(d => 
      d.studentEvaluations?.some(e => e.evaluatorGroupId === d.groupId)
    ).length;
    
    const otherGroupIds = designs.map(d => d.groupId);
    const completedAllPeerEvalCount = designs.filter(d => {
      const peerEvaluations = d.studentEvaluations?.filter(e => e.evaluatorGroupId !== d.groupId) || [];
      const evaluatedGroupIds = new Set(peerEvaluations.map(e => e.evaluatorGroupId));
      const groupsToEvaluate = otherGroupIds.filter(id => id !== d.groupId);
      return groupsToEvaluate.every(id => evaluatedGroupIds.has(id));
    }).length;
    
    return { submittedCount, selfEvaluatedCount, completedAllPeerEvalCount };
  }, [designs]);
  
  // 计算每组的统计数据
  const groupStats: GroupStat[] = useMemo(() => {
    const allGroupIds = ['01', '02', '03', '04', '05', '06', '07', '08'];
    
    return allGroupIds.map(groupId => {
      const design = designs.find(d => d.groupId === groupId);
      
      const submitted = design ? 1 : 0;
      const selfEvaluated = design?.studentEvaluations?.some(e => e.evaluatorGroupId === groupId) ? 1 : 0;
      const peerEvaluated = design?.studentEvaluations?.filter(e => e.evaluatorGroupId !== groupId).length || 0;
      
      return {
        groupId,
        groupName: `第${groupId}组`,
        submitted,
        selfEvaluated,
        peerEvaluated,
      };
    });
  }, [designs]);
  
  // 计算总他评数
  const totalPeerEvaluations = useMemo(() => {
    return designs.reduce((sum, d) => {
      return sum + (d.studentEvaluations?.filter(e => e.evaluatorGroupId !== d.groupId).length || 0);
    }, 0);
  }, [designs]);
  
  const openRateDialog = (design: Design) => {
    setSelectedDesign(design);
    setTeamworkScore(design.teamworkScore || 0);
    setTeamworkEvaluation(design.teamworkEvaluation || '');
    setIsRating(true);
  };
  
  const submitRating = async () => {
    if (!selectedDesign) return;
    await store.rateTeamwork(selectedDesign.id, teamworkScore, teamworkEvaluation);
    toast.success('团队协作评分成功！');
    setIsRating(false);
    setSelectedDesign(null);
  };
  
  const confirmDelete = async () => {
    if (!designToDelete) return;
    await store.deleteDesign(designToDelete.id);
    toast.success('已删除设计作品');
    setDesignToDelete(null);
  };
  
  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">教师管理看板</h1>
          <p className="text-gray-600">查看所有小组的设计作品，进行评分和评价</p>
        </div>
        <div className="flex items-center gap-3">
          {hasNewUpdates && (
            <Badge className="bg-red-500 animate-pulse">
              <Bell className="w-3 h-3 mr-1" />
              有新动态
            </Badge>
          )}
          <div className="text-xs text-gray-400">
            最后更新: {lastUpdateTime.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className={hasNewUpdates ? 'border-red-500 text-red-500' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${hasNewUpdates ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">已提交组数</p>
                <p className="text-3xl font-bold text-blue-600">{stats.submittedCount}</p>
                <p className="text-xs text-gray-400">/ 8组</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">完成自评</p>
                <p className="text-3xl font-bold text-green-600">{stats.selfEvaluatedCount}</p>
                <p className="text-xs text-gray-400">/ {stats.submittedCount}组</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">完成全部他评</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completedAllPeerEvalCount}</p>
                <p className="text-xs text-gray-400">/ {stats.submittedCount}组</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">总他评次数</p>
                <p className="text-3xl font-bold text-orange-600">{totalPeerEvaluations}</p>
                <p className="text-xs text-gray-400">次评价</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 堆积柱状图 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            各组完成情况统计
          </CardTitle>
          <CardDescription>
            堆积柱状图展示各组的提交、自评和他评情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="groupName" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="submitted" name="已提交" stackId="a" fill="#3b82f6" />
                <Bar dataKey="selfEvaluated" name="完成自评" stackId="a" fill="#22c55e" />
                <Bar dataKey="peerEvaluated" name="他评次数" stackId="a" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>已提交（1表示已提交）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>完成自评（1表示已完成）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>他评次数（给其他组的评价数）</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 搜索 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder="搜索小组名称或设计类型..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>
      
      {/* 作品列表 */}
      <Card>
        <CardHeader>
          <CardTitle>所有作品</CardTitle>
          <CardDescription>共 {filteredDesigns.length} 个作品</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDesigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无作品</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDesigns.map((design) => {
                const selfEvaluated = design.studentEvaluations?.some(e => e.evaluatorGroupId === design.groupId);
                const peerEvalCount = design.studentEvaluations?.filter(e => e.evaluatorGroupId !== design.groupId).length || 0;
                const totalScore = store.getTotalScore(design.id);
                
                return (
                  <Card key={design.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-32">
                        <img src={design.renderImage || design.designSketch} alt={design.groupName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{design.groupName}</span>
                              <Badge variant="secondary">{design.designTypeName}</Badge>
                              {selfEvaluated && <Badge className="bg-green-500">已自评</Badge>}
                              {design.teamworkScore !== undefined ? <Badge className="bg-blue-500">已评分</Badge> : <Badge variant="outline" className="text-orange-500 border-orange-500">待评分</Badge>}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(design.submitTime).toLocaleString()}
                            </div>
                            {peerEvalCount > 0 && (
                              <div className="text-sm text-purple-600 mt-1">
                                收到 {peerEvalCount} 个他评
                              </div>
                            )}
                            {totalScore && (
                              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                                <span className="text-gray-600">分数详情：</span>
                                <span className="text-blue-600 ml-1">自评{totalScore.self}</span>
                                <span className="text-purple-600 ml-2">他评{totalScore.others}</span>
                                <span className="text-orange-600 ml-2">团队{totalScore.teamwork}</span>
                              </div>
                            )}
                          </div>
                          {totalScore && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{totalScore.total}</div>
                              <div className="text-xs text-gray-500">/ 20 分</div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {design.materials.map((materialId) => {
                            const names: Record<string, string> = {
                              steel_needle: '钢针', small_nail: '细铁钉', paperclip: '回形针', push_pin: '大头针',
                              foam_ball: '泡沫小球', foam_sheet: '吹塑纸', cork: '软木塞', bottle_cap: '塑料瓶盖',
                              string: '细线', support_stand: '支撑架',
                              glass_bowl: '透明碗', glass_cup: '玻璃杯', pencil: '铅笔', wood_block: '木块', wood_stick: '木棒',
                              white_paper: '白纸', sticker: '贴纸', compass: '指南针', bar_magnet: '条形磁铁',
                              tape: '胶带', scissors: '剪刀', marker: '记号笔', water: '清水', clay: '橡皮泥',
                            };
                            return <Badge key={materialId} variant="outline" className="text-xs">{names[materialId] || materialId}</Badge>;
                          })}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{design.description}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => openRateDialog(design)}>
                            <Star className="w-4 h-4 mr-1" />
                            {design.teamworkScore !== undefined ? '修改评分' : '评分'}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => setDesignToDelete(design)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 评分对话框 */}
      <Dialog open={isRating} onOpenChange={setIsRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>团队协作评分</DialogTitle>
            <DialogDescription>为 {selectedDesign?.groupName} 的团队协作表现打分（0-2分）</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>评分 (0-2分)</Label>
              <div className="flex items-center gap-2 mt-2">
                {[0, 1, 2].map((score) => (
                  <Button
                    key={score}
                    variant={teamworkScore === score ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTeamworkScore(score)}
                  >
                    {score}分
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>评价说明</Label>
              <Textarea
                value={teamworkEvaluation}
                onChange={(e) => setTeamworkEvaluation(e.target.value)}
                placeholder="请简要说明评分理由..."
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRating(false)}>取消</Button>
            <Button onClick={submitRating}>提交评分</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 删除确认对话框 */}
      <AlertDialog open={!!designToDelete} onOpenChange={() => setDesignToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 {designToDelete?.groupName} 的设计作品吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDesignToDelete(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

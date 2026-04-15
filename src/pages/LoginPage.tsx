import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FlaskConical, Sparkles, Star, Users, GraduationCap, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAsStudent, loginAsTeacher } = useAppStore();
  
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  
  const handleStudentLogin = () => {
    if (!groupId.trim()) {
      toast.error('请输入小组编号');
      return;
    }
    
    const num = parseInt(groupId.trim());
    if (isNaN(num) || num < 1 || num > 8) {
      toast.error('请输入01-08之间的小组编号');
      return;
    }
    
    const formattedId = num.toString().padStart(2, '0');
    loginAsStudent(formattedId, `第${formattedId}组`);
    toast.success(`欢迎，第${formattedId}组！`);
    setShowStudentDialog(false);
    navigate('/student/design-type');
  };
  
  const handleTeacherLogin = () => {
    if (teacherPassword !== 'teacher123') {
      toast.error('密码错误');
      return;
    }
    
    loginAsTeacher();
    toast.success('欢迎，老师！');
    setShowTeacherDialog(false);
    navigate('/teacher/dashboard');
  };
  
  const features = [
    {
      icon: FlaskConical,
      title: '选择设计方案',
      description: '先选择指南针设计方案：水浮式、支撑式或悬挂式',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Sparkles,
      title: '选择制作材料',
      description: '根据设计方案选择合适的材料，系统会给出建议和提示',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Star,
      title: 'AI生成效果图',
      description: '上传手绘设计草图，AI生成高清渲染效果图并提交作品',
      color: 'bg-green-100 text-green-600',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航 - 放大学校Logo */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">指南针设计教学平台</h1>
              <p className="text-xs text-gray-500">小学科学课 · 动手实践 · 创新设计</p>
            </div>
          </div>
          <img src="/school-logo.png" alt="湘湖未来学校" className="h-14 object-contain" />
        </div>
      </header>
      
      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">设计你的专属指南针</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            通过选择设计方案、挑选合适材料、上传设计草图，让AI生成高质量渲染效果图，体验完整的科学设计过程
          </p>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 px-8" onClick={() => setShowStudentDialog(true)}>
              <Users className="w-5 h-5 mr-2" />
              学生入口
            </Button>
            <Button size="lg" variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50 px-8" onClick={() => setShowTeacherDialog(true)}>
              <GraduationCap className="w-5 h-5 mr-2" />
              教师入口
            </Button>
          </div>
        </div>
        
        {/* 功能卡片 */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      
      {/* 学生登录对话框 */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">学生登录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="groupId">小组编号</Label>
              <Input
                id="groupId"
                placeholder="请输入小组编号（01-08）"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStudentLogin()}
              />
              <p className="text-xs text-gray-500">请输入01到08之间的编号</p>
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={handleStudentLogin}>
              <Users className="w-4 h-4 mr-2" />
              进入学生端
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 教师登录对话框 */}
      <Dialog open={showTeacherDialog} onOpenChange={setShowTeacherDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">教师登录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="password">教师密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入教师密码"
                  className="pl-10"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTeacherLogin()}
                />
              </div>
              <p className="text-xs text-gray-500">默认密码：teacher123</p>
            </div>
            <Button className="w-full bg-purple-500 hover:bg-purple-600" onClick={handleTeacherLogin}>
              <GraduationCap className="w-4 h-4 mr-2" />
              进入教师端
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

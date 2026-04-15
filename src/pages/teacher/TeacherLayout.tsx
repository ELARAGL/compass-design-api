import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Compass, LayoutDashboard, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppStore } from '@/store';

export default function TeacherLayout() {
  const navigate = useNavigate();
  const { logout, designs } = useAppStore();
  
  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/login');
  };
  
  const navItems = [
    { path: '/teacher/dashboard', label: '管理看板', icon: LayoutDashboard },
    { path: '/teacher/showcase', label: '展示交流', icon: Users },
  ];
  
  const submittedCount = designs.length;
  const ratedCount = designs.filter(d => d.teamworkScore !== undefined).length;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">指南针设计</h1>
              <p className="text-xs text-gray-500">教师端</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">已提交作品</p>
            <p className="text-2xl font-bold text-purple-700">{submittedCount}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">已评分作品</p>
            <p className="text-2xl font-bold text-green-700">{ratedCount}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />退出登录
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div></div>
          <img src="/school-logo.png" alt="湘湖未来学校" className="h-16 object-contain" />
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

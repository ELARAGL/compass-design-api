import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAppStore } from '@/store';

import LoginPage from '@/pages/LoginPage';
import StudentLayout from '@/pages/student/StudentLayout';
import MaterialSelect from '@/pages/student/MaterialSelect';
import DesignType from '@/pages/student/DesignType';
import DesignResult from '@/pages/student/DesignResult';
import Showcase from '@/pages/student/Showcase';
import TeacherLayout from '@/pages/teacher/TeacherLayout';
import TeacherDashboard from '@/pages/teacher/Dashboard';
import TeacherShowcase from '@/pages/teacher/TeacherShowcase';

function StudentRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppStore();
  if (currentUser.type !== 'student') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppStore();
  if (currentUser.type !== 'teacher') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student" element={<StudentRoute><StudentLayout /></StudentRoute>}>
          <Route index element={<Navigate to="materials" replace />} />
          <Route path="materials" element={<MaterialSelect />} />
          <Route path="design-type" element={<DesignType />} />
          <Route path="design-result" element={<DesignResult />} />
          <Route path="showcase" element={<Showcase />} />
        </Route>
        <Route path="/teacher" element={<TeacherRoute><TeacherLayout /></TeacherRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="showcase" element={<TeacherShowcase />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

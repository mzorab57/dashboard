import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Login from '@/pages/auth/Login';
import DashboardHome from '@/pages/dashboard/Home';
import ProductsList from '@/pages/products/List';
import CategoriesList from '@/pages/categories/List';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Protected dashboard */}
      <Route element={<ProtectedRoute roles={['admin','employee']} />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/categories" element={<CategoriesList />} />
          {/* دەتوانیت routes زیاتر زیاد بکەیت */}
        </Route>
      </Route>
      <Route path="/403" element={<div className="p-6">Forbidden</div>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
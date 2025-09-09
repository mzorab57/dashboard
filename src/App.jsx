import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Login from '@/pages/auth/Login';
import DashboardHome from '@/pages/dashboard/Home';
import ProductsList from '@/pages/products/List';
import CategoriesList from '@/pages/categories/List';
import SubcategoriesList from '@/pages/subcategories/List';
import BrandsList from '@/pages/brands/List';
import TagsList from '@/pages/tags/List';
import UsersList from '@/pages/users/List';
import ProductTagsList from '@/pages/product-tags/List';
import ProductSpecificationsList from '@/pages/product-specifications/List';
import ProductImagesList from '@/pages/product-images/List';

import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Protected dashboard */}
      <Route element={<ProtectedRoute roles={['admin','employee']} />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/categories" element={<CategoriesList />} />
          <Route path="/subcategories" element={<SubcategoriesList />} />
          <Route path="/brands" element={<BrandsList />} />
          <Route path="/tags" element={<TagsList />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/product-tags" element={<ProductTagsList />} />
          <Route path="/product-specifications" element={<ProductSpecificationsList />} />
          <Route path="/product-images" element={<ProductImagesList />} />
          {/* دەتوانیت routes زیاتر زیاد بکەیت */}
        </Route>
      </Route>
      <Route path="/403" element={<div className="p-6">Forbidden</div>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}
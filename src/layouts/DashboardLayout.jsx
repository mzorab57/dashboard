import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import clsx from 'clsx';

const nav = [
  { to: '/dashboard', label: 'Overview', icon: '🏠', color: 'from-blue-500 to-blue-600' },
  { to: '/products', label: 'Products', icon: '📦', color: 'from-green-500 to-green-600' },
  { to: '/categories', label: 'Categories', icon: '🗂️', color: 'from-purple-500 to-purple-600' },
  { to: '/subcategories', label: 'Subcategories', icon: '🗃️', color: 'from-orange-500 to-orange-600' },
  { to: '/brands', label: 'Brands', icon: '🏷️', color: 'from-pink-500 to-pink-600' },
  { to: '/tags', label: 'Tags', icon: '🔖', color: 'from-indigo-500 to-indigo-600' },
  { to: '/users', label: 'Users', icon: '👥', color: 'from-cyan-500 to-cyan-600' },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false); // mobile drawer
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 text-gray-800">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <button className="md:hidden rounded-xl p-2 hover:bg-gray-100 transition-colors" onClick={() => setOpen(true)} aria-label="Open menu">
            <span className="text-lg">☰</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
              <span className="text-lg font-bold">A</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin</span>
              <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">v1.0</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.full_name}</div>
                  <div className="text-gray-500 text-xs">{user?.role}</div>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Layout grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-0">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-16 col-span-12 hidden h-[calc(100vh-64px)] border-r border-white/20 bg-white/80 backdrop-blur-xl md:col-span-3 lg:col-span-2 md:block shadow-xl">
          <nav className="p-4 space-y-2">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => clsx(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5',
                  isActive 
                    ? `bg-gradient-to-r ${n.color} text-white shadow-lg` 
                    : 'text-gray-700 hover:bg-white hover:shadow-md'
                )}
              >
                {({ isActive }) => (
                  <>
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">{n.icon}</span>
                    <span>{n.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white/80"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Drawer (mobile) */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                    <span className="text-sm font-bold">A</span>
                  </div>
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Menu</div>
                </div>
                <button className="rounded-xl p-2 hover:bg-gray-100 transition-colors" onClick={() => setOpen(false)}>
                  <span className="text-lg">✕</span>
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => clsx(
                      'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive 
                        ? `bg-gradient-to-r ${n.color} text-white shadow-lg` 
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">{n.icon}</span>
                    <span>{n.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import clsx from 'clsx';

const nav = [
  { to: '/dashboard', label: 'Overview', icon: '🏠' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/categories', label: 'Categories', icon: '🗂️' },
  // { to: '/subcategories', label: 'Subcategories', icon: '🗃️' },
  // { to: '/brands', label: 'Brands', icon: '🏷️' },
  // { to: '/tags', label: 'Tags', icon: '🔖' },
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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button className="md:hidden rounded-md p-2 hover:bg-gray-100" onClick={() => setOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">Admin</span>
            <span className="text-xs text-gray-400">v1</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">
              {user?.full_name} <span className="text-gray-400">({user?.role})</span>
            </span>
            <button onClick={handleLogout} className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-black">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Layout grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-0">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-14 col-span-12 hidden h-[calc(100vh-56px)] border-r bg-white md:col-span-3 lg:col-span-2 md:block">
          <nav className="p-3">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100',
                  isActive && 'bg-gray-900 text-white hover:bg-gray-900'
                )}
              >
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Drawer (mobile) */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b p-3">
                <div className="text-lg font-semibold">Menu</div>
                <button className="rounded-md p-2 hover:bg-gray-100" onClick={() => setOpen(false)}>✕</button>
              </div>
              <nav className="p-3">
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100',
                      isActive && 'bg-gray-900 text-white hover:bg-gray-900'
                    )}
                  >
                    <span>{n.icon}</span>
                    <span>{n.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
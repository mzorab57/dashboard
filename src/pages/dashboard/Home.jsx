import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

function Stat({ label, value, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    green: 'from-green-500 to-green-600 text-green-600',
    purple: 'from-purple-500 to-purple-600 text-purple-600',
    orange: 'from-orange-500 to-orange-600 text-orange-600',
    pink: 'from-pink-500 to-pink-600 text-pink-600',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600'
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} text-white shadow-lg`}>
            <span className="text-xl">{icon}</span>
          </div>
          <div className={`text-3xl font-bold ${colorClasses[color].split(' ')[2]} opacity-20`}>
            {value || 0}
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value || 0}</div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/admin/stats.php')).data
  });

  if (isLoading) return <div className="grid gap-4 md:grid-cols-3 animate-pulse">
    {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-gray-200" />)}
  </div>;
  if (error) return <div className="text-red-600">Failed to load stats</div>;

  const c = data?.counts || {};
  const latest = data?.latest_products || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
          <p className="text-blue-100 text-lg">Manage your e-commerce platform with ease</p>
        </div>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>
        <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/5"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Active Products" value={c.products_active} icon="📦" color="blue" />
        <Stat label="Total Products" value={c.products_total} icon="📊" color="green" />
        <Stat label="Categories" value={c.categories} icon="🗂️" color="purple" />
        <Stat label="Subcategories" value={c.subcategories} icon="🗃️" color="orange" />
        <Stat label="Brands" value={c.brands} icon="🏷️" color="pink" />
        <Stat label="Tags" value={c.tags} icon="🔖" color="indigo" />
      </div>

      {/* Latest Products */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
            <p className="text-gray-600 mt-1">Recently added items to your inventory</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <span className="text-xl">🆕</span>
          </div>
        </div>
        
        {latest.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p, index) => (
              <div 
                key={p.id} 
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="size-16 shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
                      {p.primary_image_url ? (
                        <img 
                            src={p.primary_image_url.startsWith('http') ? p.primary_image_url : `http://localhost/api${p.primary_image_url}`} 
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-2xl ${p.primary_image_url ? 'hidden' : 'block'}`}>📦</span>
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{p.brand}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm font-semibold text-green-600">${p.price}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <span>🕒</span>
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500">Start by adding your first product to the inventory</p>
          </div>
        )}
      </div>
    </div>
  );
}
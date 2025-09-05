import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Products (active)" value={c.products_active} />
        <Stat label="Products (total)" value={c.products_total} />
        <Stat label="Categories" value={c.categories} />
        <Stat label="Subcategories" value={c.subcategories} />
        <Stat label="Brands" value={c.brands} />
        <Stat label="Tags" value={c.tags} />
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-3 text-lg font-semibold">Latest Products</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => (
            <div key={p.id} className="flex gap-3 rounded-md border p-3">
              <div className="size-16 shrink-0 rounded bg-gray-100" />
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.brand} · ${p.price}</div>
                <div className="text-xs text-gray-400">{new Date(p.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {!latest.length && <div className="text-sm text-gray-500">No products yet.</div>}
        </div>
      </div>
    </div>
  );
}
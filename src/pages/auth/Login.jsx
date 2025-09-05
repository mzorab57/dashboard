import { useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login.php', form);
      login(data); // expects { user, access_token, refresh_token, ... }
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold">Sign in</h1>
        <p className="mb-4 text-sm text-gray-500">Dashboard access (admin/employee)</p>
        {err && <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</div>}
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
               type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        <label className="mt-3 block text-sm font-medium">Password</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
               type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        <button disabled={loading}
                className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
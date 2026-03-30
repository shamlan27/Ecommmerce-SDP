'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User, PaginatedResponse } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Search, Mail, ShieldAlert } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get<PaginatedResponse<User>>(`/admin/users?search=${search}&per_page=50`)
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const updateRole = async (id: number, role: string) => {
    if (confirm(`Change user role to ${role}?`)) {
        try {
          await api.put(`/admin/users/${id}/role`, { role });
          fetchUsers();
        } catch (e) {
          console.error(e);
        }
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Customers & Users</h1>

      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-surface">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 rounded-tr-lg">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No users found.</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-bold">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted text-xs">
                      <Mail className="w-3 h-3" /> {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{user.orders_count || 0}</td>
                  <td className="px-6 py-4 text-xs text-muted">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize cursor-pointer border-0 outline-none appearance-none ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'support' ? 'bg-blue-100 text-blue-800' : 'bg-surface border border-border text-foreground'}`}
                    >
                      <option value="customer">Customer</option>
                      <option value="support">Support</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

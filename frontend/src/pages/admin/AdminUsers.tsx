import React, { useState } from 'react';
import { Edit2, Plus, Search, ShieldAlert, Trash2 } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState('');

  // Mock Admin Users
  const users = [
    { id: '1', name: 'System Administrator', email: 'admin@EasyHire.vn', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '2026-08-30 10:15' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@EasyHire.vn', role: 'SYSTEM_MANAGER', status: 'ACTIVE', lastLogin: '2026-08-29 14:22' },
    { id: '3', name: 'Mike Johnson', email: 'mike.j@EasyHire.vn', role: 'SUPPORT', status: 'INACTIVE', lastLogin: '2026-08-15 09:00' },
  ];

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tài khoản Quản trị viên</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Quản lý các tài khoản có quyền truy cập vào Admin Command Panel.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0052cc] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xs cursor-pointer">
          <Plus className="h-4 w-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="premium-card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò (Role)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Lần cuối đăng nhập</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-700">
                      <ShieldAlert className="h-3 w-3 text-[#0052cc]" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0052cc] hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        disabled={user.role === 'SUPER_ADMIN'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

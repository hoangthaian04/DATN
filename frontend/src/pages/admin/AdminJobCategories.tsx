import React, { useState } from 'react';
import { Edit2, Plus, Search, Tags, Trash2 } from 'lucide-react';

export const AdminJobCategories: React.FC = () => {
  const [search, setSearch] = useState('');

  // Mock Data
  const categories = [
    { id: '1', name: 'Software Development', slug: 'software-development', jobsCount: 156, status: 'ACTIVE' },
    { id: '2', name: 'Marketing & PR', slug: 'marketing-pr', jobsCount: 42, status: 'ACTIVE' },
    { id: '3', name: 'Sales & Business', slug: 'sales-business', jobsCount: 89, status: 'ACTIVE' },
    { id: '4', name: 'Human Resources', slug: 'human-resources', jobsCount: 12, status: 'INACTIVE' },
    { id: '5', name: 'Design & UX/UI', slug: 'design', jobsCount: 34, status: 'ACTIVE' },
  ];

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Danh mục Nghề nghiệp</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Quản lý các Job Categories dùng chung cho hệ thống tuyển dụng EasyTech.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0052cc] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xs cursor-pointer">
          <Plus className="h-4 w-4" />
          Thêm danh mục
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
            placeholder="Tìm kiếm danh mục..."
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
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Số lượng Jobs</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#0052cc] flex items-center justify-center">
                        <Tags className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">{cat.jobsCount} tin</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        cat.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {cat.status === 'ACTIVE' ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0052cc] hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer">
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

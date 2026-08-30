import React, { useState } from 'react';
import { Eye, Filter, Monitor, Search, User } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [search, setSearch] = useState('');

  // Mock Audit Logs
  const logs = [
    { id: 'log-1', timestamp: '2026-08-30 10:15:22', actor: 'admin@easytech.vn', role: 'SUPER_ADMIN', action: 'APPROVE_COMPANY', entity: 'companies', entityId: 'c-101', status: 'SUCCESS', ip: '192.168.1.100' },
    { id: 'log-2', timestamp: '2026-08-30 09:42:10', actor: 'hr@techa.vn', role: 'HR', action: 'LOGIN', entity: 'auth', entityId: '-', status: 'SUCCESS', ip: '113.190.22.45' },
    { id: 'log-3', timestamp: '2026-08-29 16:20:05', actor: 'hr@cloudnine.io', role: 'HR', action: 'CREATE_JOB', entity: 'jobs', entityId: 'job-501', status: 'SUCCESS', ip: '203.119.55.12' },
    { id: 'log-4', timestamp: '2026-08-29 14:15:30', actor: 'unknown', role: 'GUEST', action: 'LOGIN_FAILED', entity: 'auth', entityId: '-', status: 'FAILED', ip: '45.22.100.99' },
    { id: 'log-5', timestamp: '2026-08-28 11:05:00', actor: 'admin@easytech.vn', role: 'SUPER_ADMIN', action: 'BLOCK_COMPANY', entity: 'companies', entityId: 'c-105', status: 'SUCCESS', ip: '192.168.1.100' },
    { id: 'log-6', timestamp: '2026-08-27 15:30:22', actor: 'system', role: 'SYSTEM', action: 'DAILY_BACKUP', entity: 'database', entityId: '-', status: 'SUCCESS', ip: '127.0.0.1' },
  ];

  const filtered = logs.filter((l) =>
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.ip.includes(search)
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Giám sát các thao tác truy xuất và thay đổi dữ liệu trong hệ thống EasyTech.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo user, hành động, IP..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors shadow-xs"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-xs">
          <Filter className="h-4 w-4" />
          Lọc nâng cao
        </button>
      </div>

      {/* Table */}
      <div className="premium-card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Tác nhân (Actor)</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Đối tượng</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Kết quả</th>
                <th className="px-6 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{log.actor}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{log.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                    {log.entity} <span className="text-slate-400">({log.entityId})</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="h-3 w-3" />
                      {log.ip}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0052cc] hover:bg-blue-50 transition-colors cursor-pointer">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
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

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Monitor,
  RefreshCw,
  Search,
  User,
  X,
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { errorMessage } from '@/services/api';
import type { AuditLog, AuditLogDetail, AuditLogFilterParams } from '@/types/admin.types';

const ACTIONS = [
  'AUTH_SESSION', 'APPROVE_COMPANY', 'REJECT_COMPANY', 'BLOCK_COMPANY',
  'CREATE_JOB', 'UPDATE_JOB', 'PUBLISH_JOB', 'CLOSE_JOB', 'REOPEN_JOB',
  'CREATE_HIRING_ROUND', 'UPDATE_HIRING_ROUND', 'DELETE_HIRING_ROUND',
  'CREATE_JOB_CATEGORY', 'UPDATE_JOB_CATEGORY', 'DELETE_JOB_CATEGORY',
  'REORDER_JOB_CATEGORIES',
];

const formatDate = (value?: string) => value
  ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'medium' })
  : '—';

export const AdminAuditLogs: React.FC = () => {
  const [draft, setDraft] = useState<AuditLogFilterParams>({});
  const [applied, setApplied] = useState<AuditLogFilterParams>({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await AdminService.getAuditLogs({ ...applied, page, limit: 50 });
      setLogs(result.data);
      setTotal(result.total);
      setLastPage(result.last_page);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, [page, applied]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setApplied({
      ...draft,
      action: draft.action || undefined,
      email: draft.email?.trim() || undefined,
    });
  };

  const clearFilters = () => {
    setDraft({});
    setPage(1);
    setApplied({});
  };

  const openDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setSelectedLog(await AdminService.getAuditLog(id));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Nhật ký chỉ đọc của các thao tác quan trọng trên hệ thống ({total} bản ghi).
          </p>
        </div>
        <button onClick={() => void loadLogs()} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-60">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      <form onSubmit={handleSubmit} className="premium-card bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="relative flex-1 min-w-[220px]">
            <span className="sr-only">Email người thực hiện</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={draft.email || ''} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="Tìm theo email người thực hiện..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0052cc]" />
          </label>
          <label>
            <span className="block mb-1 text-[10px] font-bold text-slate-500 uppercase">Hành động</span>
            <select value={draft.action || ''} onChange={(event) => setDraft({ ...draft, action: event.target.value || undefined })} className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0052cc]">
              <option value="">Tất cả hành động</option>
              {ACTIONS.map((action) => <option key={action} value={action}>{action}</option>)}
            </select>
          </label>
          <label>
            <span className="block mb-1 text-[10px] font-bold text-slate-500 uppercase">Từ ngày</span>
            <span className="flex items-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200"><Calendar className="h-4 w-4 text-slate-400" /><input type="date" value={draft.startDate || ''} onChange={(event) => setDraft({ ...draft, startDate: event.target.value || undefined })} className="text-sm focus:outline-none" /></span>
          </label>
          <label>
            <span className="block mb-1 text-[10px] font-bold text-slate-500 uppercase">Đến ngày</span>
            <span className="flex items-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200"><Calendar className="h-4 w-4 text-slate-400" /><input type="date" value={draft.endDate || ''} onChange={(event) => setDraft({ ...draft, endDate: event.target.value || undefined })} className="text-sm focus:outline-none" /></span>
          </label>
          <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052cc] text-white text-xs font-bold hover:bg-blue-700"><Filter className="h-4 w-4" /> Lọc</button>
          <button type="button" onClick={clearFilters} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">Xóa lọc</button>
        </div>
      </form>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={() => void loadLogs()} className="font-bold underline">Thử lại</button></div>}

      <div className="premium-card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider"><tr>
              <th className="px-6 py-4">Thời gian</th><th className="px-6 py-4">Người thực hiện</th><th className="px-6 py-4">Công ty</th><th className="px-6 py-4">Hành động</th><th className="px-6 py-4">Đối tượng</th><th className="px-6 py-4">IP Address</th><th className="px-6 py-4 text-right">Chi tiết</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? <tr><td colSpan={7} className="py-16 text-center text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#0052cc]" />Đang tải audit logs...</td></tr>
                : logs.length === 0 ? <tr><td colSpan={7} className="py-16 text-center text-slate-400"><Search className="h-8 w-8 mx-auto mb-2 text-slate-300" /><p className="font-semibold">Không có audit log phù hợp</p></td></tr>
                  : logs.map((log) => <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-slate-400" /><div><p className="text-xs font-bold text-slate-800">{log.actor?.fullName || log.actor?.email || 'System'}</p><p className="text-[10px] font-semibold text-slate-400">{log.actor?.email || log.actor?.role || '—'}</p></div></div></td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{log.companyName || (log.companyId ? `#${log.companyId}` : 'Nền tảng')}</td>
                    <td className="px-6 py-4"><span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{log.action}</span></td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{log.targetType} <span className="text-slate-400">({log.targetId ?? '—'})</span></td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500"><span className="inline-flex items-center gap-1.5"><Monitor className="h-3 w-3" />{log.ipAddress || '—'}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => void openDetail(log.id)} title="Xem chi tiết" className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0052cc] hover:bg-blue-50"><Eye className="h-3.5 w-3.5" /></button></td>
                  </tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs font-semibold text-slate-500"><span>Trang {page}/{lastPage} · {total} bản ghi</span><div className="flex gap-2"><button disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button disabled={page >= lastPage || isLoading} onClick={() => setPage(page + 1)} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
      </div>

      {(selectedLog || detailLoading) && <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"><div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"><div className="p-6 border-b border-slate-100 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Chi tiết Audit Log</h2><p className="text-xs text-slate-500 mt-1">Chỉ đọc, không thể chỉnh sửa hoặc xóa</p></div><button onClick={() => setSelectedLog(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{detailLoading ? <div className="flex-1 flex items-center justify-center text-slate-400"><RefreshCw className="h-6 w-6 animate-spin" /></div> : selectedLog && <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm"><div className="grid grid-cols-2 gap-3"><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase">Action</span><span className="font-mono font-bold">{selectedLog.action}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase">Thời gian</span><span>{formatDate(selectedLog.createdAt)}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase">Actor</span><span>{selectedLog.actor?.fullName || selectedLog.actor?.email || 'System'}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase">Role</span><span>{selectedLog.actor?.role || '—'}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase">IP Address</span><span>{selectedLog.ipAddress || '—'}</span></div><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase">Request ID</span><span>{selectedLog.requestId || '—'}</span></div></div><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">User Agent</span><p className="break-words text-slate-700">{selectedLog.userAgent || '—'}</p></div><div className="p-3 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Metadata</span><pre className="whitespace-pre-wrap break-words text-xs text-slate-700">{selectedLog.metadata || 'Không có metadata'}</pre></div></div>}</div></div>}
    </div>
  );
};

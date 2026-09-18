import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, ShieldAlert, X } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { errorMessage } from '@/services/api';
import type { AdminUserDetail, AdminUserRole, AdminUserStatus, AdminUserSummary } from '@/types/admin.types';

const PAGE_SIZE = 20;
const roleLabel: Record<AdminUserRole, string> = { ADMIN: 'System Admin', HR_ADMIN: 'HR Admin', HR: 'HR' };
const statusLabel: Record<AdminUserStatus, string> = { PENDING: 'Chờ duyệt', ACTIVE: 'Hoạt động', INACTIVE: 'Vô hiệu hóa', BLOCKED: 'Đã khóa' };
const dateTime = (value?: string) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa có';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [role, setRole] = useState<AdminUserRole | ''>('');
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ user: AdminUserSummary | AdminUserDetail; nextStatus: 'ACTIVE' | 'INACTIVE' } | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const result = await AdminService.getUsers({
        page,
        limit: PAGE_SIZE,
        search: submittedSearch || undefined,
        role: role || undefined,
        status: status || undefined,
      });
      setUsers(result.data);
      setTotal(result.total);
      setLastPage(result.last_page);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, role, status, submittedSearch]);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  const openDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setSelectedUser(await AdminService.getUser(id));
    } catch (error) {
      setDetailError(errorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmStatus = (user: AdminUserSummary | AdminUserDetail) => {
    if (user.role === 'ADMIN' || (user.status !== 'ACTIVE' && user.status !== 'INACTIVE')) return;
    setStatusTarget({ user, nextStatus: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    setReason('');
  };

  const changeStatus = async () => {
    if (!statusTarget) return;
    if (statusTarget.nextStatus === 'INACTIVE' && !reason.trim()) {
      showToast('error', 'Vui lòng nhập lý do vô hiệu hóa tài khoản.');
      return;
    }
    try {
      setActionLoading(true);
      await AdminService.updateUserStatus(statusTarget.user.id, {
        status: statusTarget.nextStatus,
        reason: reason.trim() || undefined,
      });
      showToast('success', statusTarget.nextStatus === 'INACTIVE' ? 'Đã vô hiệu hóa tài khoản.' : 'Đã kích hoạt lại tài khoản.');
      setStatusTarget(null);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      showToast('error', errorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <div role="status" className={`fixed right-6 top-6 z-[60] rounded-xl border p-4 text-sm font-semibold shadow-xl ${toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{toast.text}</div>}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Quản lý tài khoản</h1><p className="mt-1 text-sm font-semibold text-slate-500">Theo dõi tài khoản người dùng trên toàn hệ thống ({total} tài khoản).</p></div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }} className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, email..." aria-label="Tìm theo tên hoặc email" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-xs focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]" />
        </form>
        <select value={role} onChange={(event) => { setPage(1); setRole(event.target.value as AdminUserRole | ''); }} aria-label="Lọc theo vai trò" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"><option value="">Tất cả vai trò</option><option value="HR">HR</option><option value="HR_ADMIN">HR Admin</option><option value="ADMIN">System Admin</option></select>
        <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value as AdminUserStatus | ''); }} aria-label="Lọc theo trạng thái" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"><option value="">Tất cả trạng thái</option><option value="ACTIVE">Hoạt động</option><option value="INACTIVE">Vô hiệu hóa</option><option value="PENDING">Chờ duyệt</option><option value="BLOCKED">Đã khóa</option></select>
      </div>

      <div className="premium-card overflow-hidden bg-white"><div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Người dùng</th><th className="px-6 py-4">Công ty</th><th className="px-6 py-4">Vai trò</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4">Ngày tạo</th><th className="px-6 py-4">Đăng nhập cuối</th><th className="px-6 py-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading && <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#0052cc]" /><p className="mt-3 text-sm text-slate-500">Đang tải tài khoản...</p></td></tr>}
        {!loading && loadError && <tr><td colSpan={7} className="p-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 text-sm font-semibold text-red-700">{loadError}</p><button type="button" onClick={() => void fetchUsers()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0052cc] px-4 py-2 text-xs font-bold text-white"><RefreshCw className="h-3.5 w-3.5" />Thử lại</button></td></tr>}
        {!loading && !loadError && users.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-sm font-semibold text-slate-500">Không tìm thấy tài khoản phù hợp.</td></tr>}
        {!loading && !loadError && users.map((user) => <tr key={user.id} className="transition-colors hover:bg-slate-50/60"><td className="px-6 py-4"><button type="button" onClick={() => void openDetail(user.id)} className="flex items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{user.fullName?.charAt(0) || '?'}</span><span><span className="block text-sm font-bold text-slate-800 hover:text-[#0052cc]">{user.fullName}</span><span className="mt-0.5 block text-xs text-slate-500">{user.email}</span></span></button></td><td className="px-6 py-4 text-xs font-semibold text-slate-600">{user.companyName || 'Không thuộc công ty'}</td><td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-700"><ShieldAlert className="h-3 w-3 text-[#0052cc]" />{roleLabel[user.role]}</span></td><td className="px-6 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${user.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : user.status === 'INACTIVE' ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{statusLabel[user.status]}</span></td><td className="px-6 py-4 text-xs font-semibold text-slate-500">{dateTime(user.createdAt)}</td><td className="px-6 py-4 text-xs font-semibold text-slate-500">{dateTime(user.lastLoginAt)}</td><td className="px-6 py-4 text-right"><button type="button" disabled={user.role === 'ADMIN' || (user.status !== 'ACTIVE' && user.status !== 'INACTIVE')} onClick={() => confirmStatus(user)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc] disabled:cursor-not-allowed disabled:opacity-40">{user.status === 'ACTIVE' ? 'Vô hiệu hóa' : user.status === 'INACTIVE' ? 'Kích hoạt' : 'Không thao tác'}</button></td></tr>)}
      </tbody></table></div>{!loading && !loadError && total > 0 && <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs font-semibold text-slate-500"><span>Trang {page}/{lastPage} · {total} tài khoản</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>}</div>

        {(detailLoading || detailError || selectedUser) && <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" onClick={() => !detailLoading && setSelectedUser(null)}><aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-900">Chi tiết tài khoản</h2><button type="button" onClick={() => setSelectedUser(null)} aria-label="Đóng chi tiết" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{detailLoading && <div className="py-16 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#0052cc]" /></div>}{detailError && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{detailError}<button type="button" onClick={() => selectedUser && void openDetail(selectedUser.id)} className="mt-3 block font-bold underline">Thử lại</button></div>}{selectedUser && !detailLoading && !detailError && <div className="mt-6 space-y-6"><div><p className="text-xl font-extrabold text-slate-900">{selectedUser.fullName}</p><p className="text-sm text-slate-500">{selectedUser.email}</p><p className="mt-2 text-xs font-semibold text-slate-500">Vai trò: {roleLabel[selectedUser.role]} · Trạng thái: {statusLabel[selectedUser.status]}</p></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm"><div><p className="text-xs text-slate-500">Công ty</p><p className="mt-1 font-bold text-slate-800">{selectedUser.company?.name || 'Không thuộc công ty'}</p></div><div><p className="text-xs text-slate-500">Job đã tạo còn hiệu lực</p><p className="mt-1 font-bold text-slate-800">{selectedUser.jobsCreatedCount}</p></div><div><p className="text-xs text-slate-500">Ngày tạo</p><p className="mt-1 font-bold text-slate-800">{dateTime(selectedUser.createdAt)}</p></div><div><p className="text-xs text-slate-500">Đăng nhập cuối</p><p className="mt-1 font-bold text-slate-800">{dateTime(selectedUser.lastLoginAt)}</p></div></div><div><h3 className="text-sm font-extrabold text-slate-800">10 phiên gần nhất</h3>{selectedUser.recentLogins.length === 0 ? <p className="mt-3 text-sm text-slate-500">Chưa có dữ liệu audit session.</p> : <div className="mt-3 space-y-2">{selectedUser.recentLogins.map((login, index) => <div key={`${login.loginAt}-${index}`} className="rounded-xl border border-slate-100 p-3 text-xs"><p className="font-bold text-slate-700">{dateTime(login.loginAt)}</p><p className="mt-1 text-slate-500">IP: {login.ipAddress || 'Không có'} · {login.userAgent || 'Không có User-Agent'}</p></div>)}</div>}</div>{selectedUser.role !== 'ADMIN' && (selectedUser.status === 'ACTIVE' || selectedUser.status === 'INACTIVE') && <button type="button" onClick={() => confirmStatus(selectedUser)} className="w-full rounded-xl bg-[#0052cc] px-4 py-3 text-sm font-bold text-white">{selectedUser.status === 'ACTIVE' ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt lại tài khoản'}</button>}</div>}</aside></div>}

      {statusTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"><div role="dialog" aria-modal="true" aria-labelledby="status-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="status-dialog-title" className="text-lg font-extrabold text-slate-900">{statusTarget.nextStatus === 'INACTIVE' ? 'Vô hiệu hóa tài khoản?' : 'Kích hoạt lại tài khoản?'}</h2><p className="mt-1 text-sm text-slate-500">{statusTarget.user.fullName} · {statusTarget.user.email}</p></div><button type="button" onClick={() => setStatusTarget(null)} disabled={actionLoading} aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{statusTarget.nextStatus === 'INACTIVE' && <label className="mt-5 block text-sm font-bold text-slate-700">Lý do vô hiệu hóa<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} maxLength={1000} placeholder="Nhập lý do để lưu vào Audit Log..." className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#0052cc]" /></label>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setStatusTarget(null)} disabled={actionLoading} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button><button type="button" onClick={() => void changeStatus()} disabled={actionLoading} className="rounded-xl bg-[#0052cc] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{actionLoading ? 'Đang cập nhật...' : 'Xác nhận'}</button></div></div></div>}
    </div>
  );
};

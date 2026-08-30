import React, { useCallback, useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import type { CompanyDetail, CompanyStatus, CompanySummary } from '@/types/auth.types';
import {
  Ban,
  Building2,
  Check,
  ChevronDown,
  Eye,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>(
    window.location.pathname.endsWith('/pending') ? 'PENDING' : 'all',
  );
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Drawer & Modal state
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const [detailTab, setDetailTab] = useState<'company' | 'hr'>('company');
  const [rejectingCompanyId, setRejectingCompanyId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const statusParam = filterStatus === 'all' ? undefined : (filterStatus as CompanyStatus);
      const res = await AdminService.getCompanies({
        status: statusParam,
        searchText: submittedSearch || undefined,
        limit: 50,
      });
      setCompanies(res.data);
      setTotal(res.total);
    } catch {
      showToast('error', 'Không thể tải danh sách doanh nghiệp');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, showToast, submittedSearch]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- remote data must load when filters change
    void fetchCompanies();
  }, [fetchCompanies]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(search);
  };

  const handleViewDetail = async (id: number) => {
    try {
      setActionLoadingId(id);
      const detail = await AdminService.getCompanyDetail(id);
      setSelectedCompany(detail);
      setDetailTab('company');
    } catch {
      showToast('error', 'Không thể lấy thông tin chi tiết doanh nghiệp');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoadingId(id);
      await AdminService.approveCompany(id);
      showToast('success', 'Đã phê duyệt doanh nghiệp thành công!');
      if (selectedCompany?.id === id) {
        setSelectedCompany({ ...selectedCompany, status: 'ACTIVE' });
      }
      await fetchCompanies();
    } catch {
      showToast('error', 'Phê duyệt thất bại. Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reason = rejectReason.trim();
    if (!rejectingCompanyId) return;
    if (!reason) {
      setRejectReasonError('Vui lòng nhập lý do từ chối.');
      return;
    }
    if (reason.length < 10) {
      setRejectReasonError('Lý do từ chối phải có ít nhất 10 ký tự.');
      return;
    }
    if (reason.length > 1000) {
      setRejectReasonError('Lý do từ chối không quá 1000 ký tự.');
      return;
    }

    try {
      setActionLoadingId(rejectingCompanyId);
      await AdminService.rejectCompany(rejectingCompanyId, reason);
      showToast('success', 'Đã từ chối doanh nghiệp.');
      setRejectingCompanyId(null);
      setRejectReason('');
      setRejectReasonError(null);
      if (selectedCompany?.id === rejectingCompanyId) {
        setSelectedCompany({
          ...selectedCompany,
          status: 'REJECTED',
          rejectedReason: reason,
        });
      }
      await fetchCompanies();
    } catch {
      showToast('error', 'Từ chối thất bại. Vui lòng thử lại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlock = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn khóa doanh nghiệp này?')) return;
    try {
      setActionLoadingId(id);
      await AdminService.blockCompany(id);
      showToast('success', 'Đã khóa doanh nghiệp.');
      if (selectedCompany?.id === id) {
        setSelectedCompany({ ...selectedCompany, status: 'BLOCKED' });
      }
      await fetchCompanies();
    } catch {
      showToast('error', 'Khóa doanh nghiệp thất bại.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusCfg: Record<string, { cls: string; dot: string; label: string }> = {
    PENDING: { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Chờ duyệt' },
    ACTIVE: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Hoạt động' },
    REJECTED: { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Từ chối' },
    BLOCKED: { cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Bị khóa' },
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 rounded-xl p-4 shadow-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Doanh nghiệp
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Phê duyệt, khóa hoặc xem chi tiết thông tin doanh nghiệp đăng ký Career Site ({total} doanh nghiệp).
          </p>
        </div>
        <button
          onClick={fetchCompanies}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm doanh nghiệp, email, sđt..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-xs"
          />
        </form>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0052cc] text-sm font-bold text-slate-700 shadow-xs cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt (Pending)</option>
            <option value="ACTIVE">Hoạt động (Active)</option>
            <option value="REJECTED">Từ chối (Rejected)</option>
            <option value="BLOCKED">Bị khóa (Blocked)</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Doanh nghiệp</th>
                <th className="px-6 py-4">Liên hệ & Slug</th>
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#0052cc]" />
                    <span>Đang tải danh sách doanh nghiệp...</span>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">Không tìm thấy doanh nghiệp nào</p>
                  </td>
                </tr>
              ) : (
                companies.map((c) => {
                  const cfg = statusCfg[c.status] || statusCfg.PENDING;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-sm text-[#0052cc]">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.email || 'Chưa cập nhật email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                          {c.slug}.easytech.vn
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{c.phone || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetail(c.id)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {c.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(c.id)}
                                disabled={actionLoadingId === c.id}
                                title="Phê duyệt"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setRejectingCompanyId(c.id)}
                                disabled={actionLoadingId === c.id}
                                title="Từ chối"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {c.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleBlock(c.id)}
                              disabled={actionLoadingId === c.id}
                              title="Khóa doanh nghiệp"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Detail View */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-lg text-[#0052cc]">
                  {selectedCompany.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedCompany.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedCompany.slug}.easytech.vn</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Detail Tabs */}
            <div className="flex border-b border-slate-100 px-6">
              <button
                onClick={() => setDetailTab('company')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'company'
                    ? 'border-[#0052cc] text-[#0052cc]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Thông tin công ty
              </button>
              <button
                onClick={() => setDetailTab('hr')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'hr'
                    ? 'border-[#0052cc] text-[#0052cc]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Tài khoản đại diện HR
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailTab === 'company' && (
                <div className="space-y-4 text-xs">
                  {selectedCompany.duplicateWarnings && selectedCompany.duplicateWarnings.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="font-extrabold uppercase tracking-wider text-amber-800">
                        Cảnh báo hồ sơ có thể trùng lặp
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 font-semibold text-amber-700">
                        {selectedCompany.duplicateWarnings.map((warning) => <li key={warning}>{warning}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-500 block mb-1">MÃ SỐ THUẾ</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCompany.taxCode || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-500 block mb-1">HOTLINE</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCompany.phone || 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-500 block mb-1">ĐỊA CHỈ TRỤ SỞ</span>
                    <span className="font-semibold text-slate-800">
                      {selectedCompany.address || 'Chưa cập nhật'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-500 block mb-1">WEBSITE</span>
                    <span className="font-semibold text-slate-800">
                      {selectedCompany.website || 'Chưa cập nhật'}
                    </span>
                  </div>

                  {selectedCompany.profile?.description && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-500 block mb-1">DỊCH VỤ / MÔ TẢ</span>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedCompany.profile.description}
                      </p>
                    </div>
                  )}

                  {selectedCompany.rejectedReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                      <span className="font-bold block mb-1">LÝ DO TỪ CHỐI DUYỆT:</span>
                      <p>{selectedCompany.rejectedReason}</p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'hr' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#0052cc] text-white flex items-center justify-center font-bold">
                        HR
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Quản trị viên Doanh nghiệp</p>
                        <p className="text-slate-500">{selectedCompany.email}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="font-bold block">Vai trò:</span>
                        <span>HR Administrator</span>
                      </div>
                      <div>
                        <span className="font-bold block">Hotline liên hệ:</span>
                        <span>{selectedCompany.phone || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              {selectedCompany.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => setRejectingCompanyId(selectedCompany.id)}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 cursor-pointer"
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    onClick={() => handleApprove(selectedCompany.id)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Phê duyệt ACTIVE
                  </button>
                </>
              )}

              {selectedCompany.status === 'ACTIVE' && (
                <button
                  onClick={() => handleBlock(selectedCompany.id)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  Khóa doanh nghiệp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingCompanyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Từ chối hồ sơ doanh nghiệp
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Vui lòng nhập lý do từ chối để thông báo cho doanh nghiệp biết lý do hồ sơ chưa đạt yêu cầu.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                maxLength={1000}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectReasonError(null);
                }}
                placeholder="VD: Mã số thuế không khớp với tên doanh nghiệp hoặc thông tin chưa đầy đủ..."
                className={`w-full rounded-xl border p-3 text-xs focus:border-[#0052cc] focus:outline-none ${
                  rejectReasonError ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                }`}
                required
              />
              <div className="flex justify-between text-[11px] font-semibold">
                <span className={rejectReasonError ? 'text-rose-600' : 'text-slate-400'}>
                  {rejectReasonError || 'Tối thiểu 10 ký tự, tối đa 1000 ký tự.'}
                </span>
                <span className="text-slate-400">{rejectReason.length}/1000</span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingCompanyId(null);
                    setRejectReason('');
                    setRejectReasonError(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={rejectReason.trim().length < 10 || actionLoadingId !== null}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer disabled:opacity-60"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

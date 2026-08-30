import React, { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import type { CompanyDetail, CompanyStatus, CompanySummary } from '@/types/auth.types';
import {
  Ban,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Drawer state
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const [rejectingCompanyId, setRejectingCompanyId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await AdminService.getCompanies({
        status: statusFilter,
        searchText: search || undefined,
        limit: 50,
      });
      setCompanies(res.data);
      setTotal(res.total);
    } catch {
      showToast('error', 'Không thể tải danh sách doanh nghiệp');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCompanies();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchCompanies();
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoadingId(id);
      await AdminService.approveCompany(id);
      showToast('success', 'Đã duyệt doanh nghiệp thành công!');
      void fetchCompanies();
      if (selectedCompany?.id === id) {
        setSelectedCompany((prev) => (prev ? { ...prev, status: 'ACTIVE' } : null));
      }
    } catch {
      showToast('error', 'Duyệt doanh nghiệp thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (id: number) => {
    setRejectingCompanyId(id);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingCompanyId || !rejectReason.trim()) return;
    try {
      setActionLoadingId(rejectingCompanyId);
      await AdminService.rejectCompany(rejectingCompanyId, rejectReason);
      showToast('success', 'Đã từ chối hồ sơ doanh nghiệp');
      setRejectingCompanyId(null);
      void fetchCompanies();
      if (selectedCompany?.id === rejectingCompanyId) {
        setSelectedCompany((prev) => (prev ? { ...prev, status: 'REJECTED', rejectedReason: rejectReason } : null));
      }
    } catch {
      showToast('error', 'Từ chối thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlock = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn khóa doanh nghiệp này?')) return;
    try {
      setActionLoadingId(id);
      await AdminService.blockCompany(id);
      showToast('success', 'Đã khóa doanh nghiệp');
      void fetchCompanies();
      if (selectedCompany?.id === id) {
        setSelectedCompany((prev) => (prev ? { ...prev, status: 'BLOCKED' } : null));
      }
    } catch {
      showToast('error', 'Khóa doanh nghiệp thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await AdminService.getCompanyDetail(id);
      setSelectedCompany(detail);
    } catch {
      showToast('error', 'Không thể tải chi tiết doanh nghiệp');
    }
  };

  const getStatusBadge = (status: CompanyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Hoạt động
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <RefreshCw className="h-3 w-3 animate-spin" /> Chờ duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">
            <XCircle className="h-3 w-3" /> Đã từ chối
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-300">
            <Ban className="h-3 w-3" /> Đã khóa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-xl backdrop-blur-md transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-100 border border-emerald-700'
              : 'bg-red-900/90 text-red-100 border border-red-700'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Quản lý Doanh nghiệp & Xét duyệt
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng số: <strong className="text-slate-900">{total}</strong> doanh nghiệp trên hệ thống
          </p>
        </div>

        <button
          onClick={fetchCompanies}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {[
            { label: 'Tất cả', val: undefined },
            { label: 'Chờ duyệt', val: 'PENDING' as CompanyStatus },
            { label: 'Hoạt động', val: 'ACTIVE' as CompanyStatus },
            { label: 'Từ chối', val: 'REJECTED' as CompanyStatus },
            { label: 'Đã khóa', val: 'BLOCKED' as CompanyStatus },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.val)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab.val
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-sm"
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Doanh nghiệp</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy doanh nghiệp nào phù hợp
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{company.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">slug: {company.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{company.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{company.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(company.status)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(company.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(company.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {company.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(company.id)}
                              disabled={actionLoadingId === company.id}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(company.id)}
                              disabled={actionLoadingId === company.id}
                              className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        {company.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleBlock(company.id)}
                            disabled={actionLoadingId === company.id}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                          >
                            Khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingCompanyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Từ chối duyệt doanh nghiệp</h3>
              <button onClick={() => setRejectingCompanyId(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lý do từ chối (sẽ gửi thông báo cho HR):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Mã số thuế không hợp lệ, thông tin công ty không đầy đủ..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setRejectingCompanyId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || actionLoadingId !== null}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="h-full w-full max-w-xl bg-white p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                  {selectedCompany.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedCompany.name}</h2>
                  <p className="text-xs text-slate-400">Chi tiết hồ sơ doanh nghiệp</p>
                </div>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Status banner */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="font-semibold text-slate-700">Trạng thái hiện tại:</span>
                {getStatusBadge(selectedCompany.status)}
              </div>

              {selectedCompany.rejectedReason && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-red-800">
                  <div className="font-bold mb-1">Lý do từ chối:</div>
                  <div>{selectedCompany.rejectedReason}</div>
                </div>
              )}

              {/* Info fields */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-indigo-600">
                  1. Thông tin pháp lý & Liên hệ
                </h4>
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
                  <div>
                    <span className="text-slate-400">Mã số thuế:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedCompany.taxCode || 'Chưa cung cấp'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Số điện thoại:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedCompany.phone || 'Chưa cung cấp'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedCompany.email || 'Chưa cung cấp'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Website:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedCompany.website || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Địa chỉ:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedCompany.address || 'Chưa cung cấp'}</p>
                  </div>
                </div>
              </div>

              {/* Profile fields */}
              {selectedCompany.profile && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-indigo-600">
                    2. Hồ sơ thương hiệu
                  </h4>
                  <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100 space-y-3">
                    <div>
                      <span className="text-slate-400">Mô tả công ty:</span>
                      <p className="text-slate-700 mt-1 whitespace-pre-wrap">{selectedCompany.profile.description || 'Chưa có'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Quyền lợi:</span>
                      <p className="text-slate-700 mt-1 whitespace-pre-wrap">{selectedCompany.profile.benefits || 'Chưa có'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions inside drawer */}
              {selectedCompany.status === 'PENDING' && (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleApprove(selectedCompany.id)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Duyệt ngay
                  </button>
                  <button
                    onClick={() => handleOpenRejectModal(selectedCompany.id)}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition cursor-pointer"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import {useLocation} from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {Confirm} from '@/components/auth/FormFields';
import {errorMessage} from '@/services/api';
import { AdminService } from '@/services/admin.service';
import type { AdminCompanyUpdateRequest, CompanyDetail, CompanyStatus, CompanySummary } from '@/types/auth.types';
import {
  Ban,
  Building2,
  Check,
  ChevronDown,
  Eye,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Search,
  X,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const location=useLocation();
  const [page,setPage]=useState(1),[lastPage,setLastPage]=useState(1);
  const [blockingId,setBlockingId]=useState<number|null>(null);
  const [approvingId,setApprovingId]=useState<number|null>(null);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>(location.pathname.endsWith('/pending')?'PENDING':'all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Drawer & Modal state
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetail | null>(null);
  const [detailTab, setDetailTab] = useState<'company' | 'hr'>('company');
  const [rejectingCompanyId, setRejectingCompanyId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyDraft, setCompanyDraft] = useState<AdminCompanyUpdateRequest | null>(null);
  const [companyUpdateLoading, setCompanyUpdateLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const statusParam = filterStatus === 'all' ? undefined : (filterStatus as CompanyStatus);
      const res = await AdminService.getCompanies({
        status: statusParam,
        searchText: search || undefined,
        limit: 20,
        page,
      });
      setCompanies(res.data);
      setTotal(res.total);
      setLastPage(res.last_page);
    } catch (e) {
      showToast('error', errorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCompanies();
  }, [filterStatus,page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchCompanies();
  };

  const handleViewDetail = async (id: number) => {
    try {
      setActionLoadingId(id);
      const detail = await AdminService.getCompanyDetail(id);
      setSelectedCompany(detail);
      setCompanyDraft(toAdminCompanyDraft(detail));
      setIsEditingCompany(false);
      setDetailTab('company');
    } catch (e) {
      showToast('error', errorMessage(e));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompanyDraftChange = <K extends keyof AdminCompanyUpdateRequest>(
    key: K,
    value: AdminCompanyUpdateRequest[K],
  ) => {
    setCompanyDraft(current => current ? { ...current, [key]: value } : current);
  };

  const handleCompanyUpdate = async () => {
    if (!selectedCompany || !companyDraft) return;
    try {
      setCompanyUpdateLoading(true);
      const updated = await AdminService.updateCompany(selectedCompany.id, companyDraft);
      setSelectedCompany(updated);
      setCompanyDraft(toAdminCompanyDraft(updated));
      setIsEditingCompany(false);
      showToast('success', 'Đã cập nhật thông tin doanh nghiệp.');
      await fetchCompanies();
    } catch (e) {
      showToast('error', errorMessage(e));
    } finally {
      setCompanyUpdateLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setApprovingId(null);
    try {
      setActionLoadingId(id);
      await AdminService.approveCompany(id);
      showToast('success', 'Đã phê duyệt doanh nghiệp thành công!');
      if (selectedCompany?.id === id) {
        setSelectedCompany({ ...selectedCompany, status: 'ACTIVE' });
      }
      await fetchCompanies();
    } catch (e) {
      showToast('error', errorMessage(e));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCompanyId || rejectReason.trim().length < 10) return;

    try {
      setActionLoadingId(rejectingCompanyId);
      await AdminService.rejectCompany(rejectingCompanyId, rejectReason.trim());
      showToast('success', 'Đã từ chối doanh nghiệp.');
      setRejectingCompanyId(null);
      setRejectReason('');
      if (selectedCompany?.id === rejectingCompanyId) {
        setSelectedCompany({
          ...selectedCompany,
          status: 'REJECTED',
          rejectedReason: rejectReason.trim(),
        });
      }
      await fetchCompanies();
    } catch (e) {
      showToast('error', errorMessage(e));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlock = async (id: number) => {
    setBlockingId(null);
    try {
      setActionLoadingId(id);
      await AdminService.blockCompany(id);
      showToast('success', 'Đã khóa doanh nghiệp.');
      if (selectedCompany?.id === id) {
        setSelectedCompany({ ...selectedCompany, status: 'BLOCKED' });
      }
      await fetchCompanies();
    } catch (e) {
      showToast('error', errorMessage(e));
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
      {blockingId!==null&&<Confirm busy={actionLoadingId!==null} text="Khóa doanh nghiệp sẽ ngắt quyền truy cập workspace của HR và ghi nhật ký thao tác." onConfirm={()=>void handleBlock(blockingId)} onCancel={()=>setBlockingId(null)}/>}
      {approvingId!==null&&<Confirm busy={actionLoadingId!==null} text="Phê duyệt sẽ chuyển doanh nghiệp sang ACTIVE, kích hoạt các tài khoản HR đang chờ và tạo Career Site mặc định. Bạn có chắc chắn không?" onConfirm={()=>void handleApprove(approvingId)} onCancel={()=>setApprovingId(null)}/>}
      <div className="flex gap-4"><button disabled={page<=1||isLoading} onClick={()=>setPage(page-1)}>Trang trước</button><span>Trang {page}/{lastPage}</span><button disabled={page>=lastPage||isLoading} onClick={()=>setPage(page+1)}>Trang sau</button></div>
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
            onChange={(e) => (setPage(1),setFilterStatus(e.target.value))}
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
                          {c.slug}.EasyHire.vn
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
                                onClick={() => setApprovingId(c.id)}
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
                              onClick={() => setBlockingId(c.id)}
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
                {selectedCompany.careerSite?.logoUrl || selectedCompany.profile?.logoUrl ? (
                  <img
                    src={selectedCompany.careerSite?.logoUrl || selectedCompany.profile?.logoUrl}
                    alt={`Logo ${selectedCompany.name}`}
                    className="h-12 w-12 rounded-xl border border-blue-100 bg-white object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-lg font-bold text-[#0052cc]">
                    {selectedCompany.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedCompany.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedCompany.subdomain || selectedCompany.slug}.EasyHire.vn</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {detailTab === 'company' && !isEditingCompany && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyDraft(toAdminCompanyDraft(selectedCompany));
                      setIsEditingCompany(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-[#0052cc] hover:bg-blue-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />Chỉnh sửa
                  </button>
                )}
                <button
                  onClick={() => { setSelectedCompany(null); setIsEditingCompany(false); setCompanyDraft(null); }}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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
                  {isEditingCompany && companyDraft ? (
                    <AdminCompanyEditForm draft={companyDraft} onChange={handleCompanyDraftChange} />
                  ) : <>
                  <section className="grid grid-cols-2 gap-3">
                    <ReadOnly label="EMAIL DOANH NGHIỆP" value={selectedCompany.email} />
                    <ReadOnly label="SUBDOMAIN" value={selectedCompany.subdomain} />
                    <ReadOnly label="NGƯỜI DUYỆT" value={selectedCompany.approvedByName} />
                    <ReadOnly label="THỜI ĐIỂM DUYỆT" value={formatAdminDate(selectedCompany.approvedAt)} />
                    <ReadOnly label="TẠO LÚC" value={formatAdminDate(selectedCompany.createdAt)} />
                    <ReadOnly label="CẬP NHẬT LÚC" value={formatAdminDate(selectedCompany.updatedAt)} />
                  </section>
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

                  <section className="space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Hồ sơ doanh nghiệp</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">EMAIL LIÊN HỆ</span>
                        <span className="font-semibold text-slate-800">{selectedCompany.profile?.contactEmail || selectedCompany.email || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">LĨNH VỰC</span>
                        <span className="font-semibold text-slate-800">{selectedCompany.profile?.industry || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">QUY MÔ</span>
                        <span className="font-semibold text-slate-800">{selectedCompany.profile?.companySize || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">LOẠI HÌNH</span>
                        <span className="font-semibold text-slate-800">{selectedCompany.profile?.businessType || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">MÀU CHÍNH HỒ SƠ</span>
                        <span className="font-semibold text-slate-800">{selectedCompany.profile?.primaryColor || 'Mặc định'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">ONBOARDING</span>
                        <span className="font-semibold text-slate-800">{selectedCompany.profile?.onboardingCompleted ? 'Đã hoàn tất' : 'Chưa hoàn tất'}</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">ĐỘ HOÀN THIỆN</span>
                        <span className="font-semibold text-slate-800">{selectedCompany.profile ? `${selectedCompany.profile.completedSteps}/3 bước` : 'Chưa có hồ sơ'}</span>
                      </div>
                    </div>
                    {selectedCompany.profile?.benefits && (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">PHÚC LỢI</span>
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{selectedCompany.profile.benefits}</p>
                      </div>
                    )}
                    {selectedCompany.profile?.socialLinks && (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">MẠNG XÃ HỘI</span>
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{selectedCompany.profile.socialLinks}</p>
                      </div>
                    )}
                    {selectedCompany.profile?.bannerUrl && (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="mb-1 block font-bold text-slate-500">BANNER HỒ SƠ</span>
                        <a href={selectedCompany.profile.bannerUrl} target="_blank" rel="noreferrer" className="break-all font-semibold text-blue-700 underline">{selectedCompany.profile.bannerUrl}</a>
                      </div>
                    )}
                  </section>

                  {selectedCompany.careerSite && (
                    <section className="space-y-3">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Cấu hình Career Site</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">TIÊU ĐỀ SITE</span>
                          <span className="font-semibold text-slate-800">{selectedCompany.careerSite.siteTitle || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">TRẠNG THÁI PUBLIC</span>
                          <span className="font-semibold text-slate-800">{selectedCompany.careerSite.isPublished ? 'Đã publish' : 'Chưa publish'}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">MÀU NHẤN</span>
                          <span className="font-semibold text-slate-800">{selectedCompany.careerSite.accentColor || 'Mặc định'}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">FONT</span>
                          <span className="font-semibold text-slate-800">{selectedCompany.careerSite.fontFamily || 'Mặc định'}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">HIỂN THỊ MÔ TẢ</span>
                          <span className="font-semibold text-slate-800">{selectedCompany.careerSite.showCompanyDescription ? 'Bật' : 'Tắt'}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">HIỂN THỊ PHÚC LỢI</span>
                          <span className="font-semibold text-slate-800">{selectedCompany.careerSite.showBenefits ? 'Bật' : 'Tắt'}</span>
                        </div>
                      </div>
                      {selectedCompany.careerSite.heroImageUrl && (
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">ẢNH HERO</span>
                          <a href={selectedCompany.careerSite.heroImageUrl} target="_blank" rel="noreferrer" className="break-all font-semibold text-blue-700 underline">{selectedCompany.careerSite.heroImageUrl}</a>
                        </div>
                      )}
                      {selectedCompany.careerSite.tagline && (
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">TAGLINE</span>
                          <p className="leading-relaxed text-slate-700">{selectedCompany.careerSite.tagline}</p>
                        </div>
                      )}
                      {selectedCompany.careerSite.footerText && (
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="mb-1 block font-bold text-slate-500">FOOTER</span>
                          <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{selectedCompany.careerSite.footerText}</p>
                        </div>
                      )}
                    </section>
                  )}

                  {selectedCompany.rejectedReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                      <span className="font-bold block mb-1">LÝ DO TỪ CHỐI DUYỆT:</span>
                      <p>{selectedCompany.rejectedReason}</p>
                    </div>
                  )}
                  {selectedCompany.duplicateWarnings && selectedCompany.duplicateWarnings.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                      <span className="mb-1 block font-bold">CẢNH BÁO TRÙNG LẶP</span>
                      <ul className="list-disc space-y-1 pl-4">
                        {selectedCompany.duplicateWarnings.map(warning => <li key={warning}>{warning}</li>)}
                      </ul>
                    </div>
                  )}
                  </>}
                </div>
              )}

              {detailTab === 'hr' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#0052cc] text-white flex items-center justify-center font-bold">
                        {(selectedCompany.registrant?.fullName || 'HR').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {selectedCompany.registrant?.fullName || 'Chưa có tài khoản đăng ký'}
                        </p>
                        <p className="text-slate-500">
                          {selectedCompany.registrant?.email || selectedCompany.email || 'Chưa cập nhật email'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="font-bold block">Vai trò:</span>
                        <span>{selectedCompany.registrant?.role === 'HR_ADMIN' ? 'HR Administrator' : selectedCompany.registrant?.role || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold block">Trạng thái:</span>
                        <span>{selectedCompany.registrant?.status || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              {isEditingCompany ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setCompanyDraft(toAdminCompanyDraft(selectedCompany)); setIsEditingCompany(false); }}
                    disabled={companyUpdateLoading}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCompanyUpdate()}
                    disabled={companyUpdateLoading || !companyDraft?.name?.trim() || !companyDraft?.taxCode?.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0052cc] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {companyUpdateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu thay đổi
                  </button>
                </>
              ) : selectedCompany.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => setRejectingCompanyId(selectedCompany.id)}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 cursor-pointer"
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    onClick={() => setApprovingId(selectedCompany.id)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Phê duyệt ACTIVE
                  </button>
                </>
              )}

              {!isEditingCompany && selectedCompany.status === 'ACTIVE' && (
                <button
                  onClick={() => setBlockingId(selectedCompany.id)}
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
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Mã số thuế không khớp với tên doanh nghiệp hoặc thông tin chưa đầy đủ..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#0052cc] focus:outline-none"
                required
              />
              <p className={`text-xs ${rejectReason.trim().length > 0 && rejectReason.trim().length < 10 ? 'text-rose-600' : 'text-slate-500'}`}>
                Lý do phải từ 10 đến 1000 ký tự ({rejectReason.trim().length}/1000).
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingCompanyId(null);
                    setRejectReason('');
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

const toAdminCompanyDraft = (company: CompanyDetail): AdminCompanyUpdateRequest => ({
  name: company.name || '',
  taxCode: company.taxCode || '',
  subdomain: company.subdomain || '',
  phone: company.phone || '',
  email: company.email || '',
  website: company.website || '',
  address: company.address || '',
  industry: company.profile?.industry || '',
  companySize: company.profile?.companySize || '',
  businessType: company.profile?.businessType || '',
  contactEmail: company.profile?.contactEmail || '',
  description: company.profile?.description || '',
  benefits: company.profile?.benefits || '',
  socialLinks: company.profile?.socialLinks || '',
  bannerUrl: company.profile?.bannerUrl || '',
  primaryColor: company.profile?.primaryColor || '',
  siteTitle: company.careerSite?.siteTitle || '',
  tagline: company.careerSite?.tagline || '',
  heroImageUrl: company.careerSite?.heroImageUrl || '',
  accentColor: company.careerSite?.accentColor || '',
  fontFamily: company.careerSite?.fontFamily || '',
  showCompanyDescription: Boolean(company.careerSite?.showCompanyDescription),
  showBenefits: Boolean(company.careerSite?.showBenefits),
  footerText: company.careerSite?.footerText || '',
});

const formatAdminDate = (value?: string) => value
  ? new Date(value).toLocaleString('vi-VN')
  : 'Chưa cập nhật';

const ReadOnly = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <span className="mb-1 block font-bold text-slate-500">{label}</span>
    <span className="font-semibold text-slate-800">{value || 'Chưa cập nhật'}</span>
  </div>
);

type AdminCompanyDraftChange = (
  key: keyof AdminCompanyUpdateRequest,
  value: string | boolean,
) => void;

const AdminCompanyEditForm = ({
  draft,
  onChange,
}: {
  draft: AdminCompanyUpdateRequest;
  onChange: AdminCompanyDraftChange;
}) => {
  const field = (key: keyof AdminCompanyUpdateRequest, value: string | boolean) => onChange(key, value);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
        Admin được cập nhật thông tin hồ sơ và nội dung hiển thị. Trạng thái, slug, người đăng ký và lịch sử duyệt vẫn chỉ đọc.
      </div>
      <EditSection title="Thông tin doanh nghiệp">
        <EditInput label="Tên doanh nghiệp" required value={draft.name} onChange={value => field('name', value)} />
        <EditInput label="Mã số thuế" required value={draft.taxCode} onChange={value => field('taxCode', value)} />
        <EditInput label="Subdomain" value={draft.subdomain} onChange={value => field('subdomain', value)} />
        <EditInput label="Email doanh nghiệp" type="email" value={draft.email} onChange={value => field('email', value)} />
        <EditInput label="Hotline" value={draft.phone} onChange={value => field('phone', value)} />
        <EditInput label="Website" value={draft.website} onChange={value => field('website', value)} />
        <EditTextArea className="sm:col-span-2" label="Địa chỉ trụ sở" value={draft.address} onChange={value => field('address', value)} />
      </EditSection>
      <EditSection title="Hồ sơ doanh nghiệp">
        <EditInput label="Ngành nghề" value={draft.industry} onChange={value => field('industry', value)} />
        <EditInput label="Quy mô" value={draft.companySize} onChange={value => field('companySize', value)} />
        <EditInput label="Loại hình" value={draft.businessType} onChange={value => field('businessType', value)} />
        <EditInput label="Email liên hệ tuyển dụng" type="email" value={draft.contactEmail} onChange={value => field('contactEmail', value)} />
        <EditTextArea className="sm:col-span-2" label="Mô tả" value={draft.description} onChange={value => field('description', value)} />
        <EditTextArea className="sm:col-span-2" label="Phúc lợi" value={draft.benefits} onChange={value => field('benefits', value)} />
        <EditTextArea className="sm:col-span-2" label="Mạng xã hội" value={draft.socialLinks} onChange={value => field('socialLinks', value)} />
        <EditInput label="Banner URL" value={draft.bannerUrl} onChange={value => field('bannerUrl', value)} />
        <EditInput label="Màu chính hồ sơ" value={draft.primaryColor} onChange={value => field('primaryColor', value)} />
      </EditSection>
      <EditSection title="Cấu hình Career Site">
        <EditInput label="Tiêu đề site" value={draft.siteTitle} onChange={value => field('siteTitle', value)} />
        <EditInput label="Màu nhấn" value={draft.accentColor} onChange={value => field('accentColor', value)} />
        <EditInput label="Font" value={draft.fontFamily} onChange={value => field('fontFamily', value)} />
        <EditInput label="Ảnh hero" value={draft.heroImageUrl} onChange={value => field('heroImageUrl', value)} />
        <EditTextArea className="sm:col-span-2" label="Tagline" value={draft.tagline} onChange={value => field('tagline', value)} />
        <EditTextArea className="sm:col-span-2" label="Footer tùy chỉnh" value={draft.footerText} onChange={value => field('footerText', value)} />
        <EditToggle label="Hiển thị mô tả công ty" checked={Boolean(draft.showCompanyDescription)} onChange={value => field('showCompanyDescription', value)} />
        <EditToggle label="Hiển thị phúc lợi" checked={Boolean(draft.showBenefits)} onChange={value => field('showBenefits', value)} />
      </EditSection>
    </div>
  );
};

const EditSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h4 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{title}</h4>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </section>
);

const EditInput = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}{required && ' *'}</span>
    <input required={required} type={type} value={value || ''} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#0052cc] focus:bg-white" />
  </label>
);

const EditTextArea = ({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <label className={`block space-y-1.5 ${className}`}>
    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
    <textarea rows={3} value={value || ''} onChange={event => onChange(event.target.value)} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 outline-none focus:border-[#0052cc] focus:bg-white" />
  </label>
);

const EditToggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
    <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
    {label}
  </label>
);

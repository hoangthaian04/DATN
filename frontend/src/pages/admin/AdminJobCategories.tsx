import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Edit2,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { Confirm } from '@/components/auth/FormFields';
import { errorMessage } from '@/services/api';
import { AdminService } from '@/services/admin.service';
import type { JobCategory, JobCategoryStatus } from '@/types/admin.types';

type CategoryForm = {
  name: string;
  status: JobCategoryStatus;
};

const CATEGORY_PAGE_SIZE = 100;
const emptyForm: CategoryForm = { name: '', status: 'ACTIVE' };

export const AdminJobCategories: React.FC = () => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const result = await AdminService.getJobCategories({
        page,
        limit: CATEGORY_PAGE_SIZE,
        search: submittedSearch || undefined,
      });
      setCategories(result.data);
      setTotal(result.total);
      setLastPage(result.last_page);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [page, submittedSearch]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const openEdit = (category: JobCategory) => {
    setModalMode('edit');
    setEditingId(category.id);
    setForm({ name: category.name, status: category.status });
    setFormError(null);
  };

  const closeModal = (force = false) => {
    if (isSaving && !force) return;
    setModalMode(null);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setFormError('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      if (modalMode === 'create') {
        await AdminService.createJobCategory({ name });
        showToast('success', 'Đã tạo danh mục thành công.');
      } else if (modalMode === 'edit' && editingId !== null) {
        await AdminService.updateJobCategory(editingId, { name, status: form.status });
        showToast('success', 'Đã cập nhật danh mục thành công.');
      }
      closeModal(true);
      await fetchCategories();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      setActionId(deletingId);
      await AdminService.deleteJobCategory(deletingId);
      showToast('success', 'Đã xóa mềm danh mục thành công.');
      setDeletingId(null);
      await fetchCategories();
    } catch (error) {
      showToast('error', errorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const toggleStatus = async (category: JobCategory) => {
    try {
      setActionId(category.id);
      await AdminService.updateJobCategory(category.id, {
        status: category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      showToast('success', 'Đã cập nhật trạng thái danh mục.');
      await fetchCategories();
    } catch (error) {
      showToast('error', errorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const persistOrder = async (nextCategories: JobCategory[]) => {
    if (submittedSearch || isSavingOrder) return;
    const previous = categories;
    setCategories(nextCategories);
    try {
      setIsSavingOrder(true);
      const allCategories = await AdminService.getAllJobCategories();
      const allIds = allCategories.map((category) => category.id);
      const visiblePositions = categories.map((category) => allIds.indexOf(category.id));
      if (visiblePositions.some((position) => position < 0)) {
        throw new Error('Danh sách danh mục đã thay đổi. Vui lòng tải lại trước khi sắp xếp.');
      }

      const orderedIds = [...allIds];
      visiblePositions.forEach((position, index) => {
        orderedIds[position] = nextCategories[index].id;
      });
      const saved = await AdminService.reorderJobCategories(orderedIds);
      setCategories(saved.slice((page - 1) * CATEGORY_PAGE_SIZE, page * CATEGORY_PAGE_SIZE));
      showToast('success', 'Đã lưu thứ tự danh mục.');
    } catch (error) {
      setCategories(previous);
      showToast('error', errorMessage(error));
    } finally {
      setIsSavingOrder(false);
    }
  };

  const moveCategory = (categoryId: number, direction: -1 | 1) => {
    const index = categories.findIndex((category) => category.id === categoryId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= categories.length) return;
    const nextCategories = [...categories];
    [nextCategories[index], nextCategories[targetIndex]] = [nextCategories[targetIndex], nextCategories[index]];
    void persistOrder(nextCategories);
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const fromIndex = categories.findIndex((category) => category.id === draggedId);
    const targetIndex = categories.findIndex((category) => category.id === targetId);
    if (fromIndex < 0 || targetIndex < 0) return;
    const nextCategories = [...categories];
    const [moved] = nextCategories.splice(fromIndex, 1);
    nextCategories.splice(targetIndex, 0, moved);
    setDraggedId(null);
    void persistOrder(nextCategories);
  };

  const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));

  return (
    <div className="space-y-6 text-left">
      {deletingId !== null && (
        <Confirm
          busy={actionId !== null}
          text="Danh mục sẽ được xóa mềm. Chỉ danh mục chưa được Job nào sử dụng mới có thể xóa."
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed right-6 top-6 z-50 rounded-xl border p-4 text-sm font-semibold shadow-xl ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Danh mục Nghề nghiệp</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Quản lý các Job Categories dùng chung cho hệ thống tuyển dụng EasyHire ({total} danh mục).
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#0052cc] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }} className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm danh mục..."
            aria-label="Tìm kiếm danh mục"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-xs transition-colors placeholder:text-slate-400 focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
          />
        </form>
        <button
          onClick={() => void fetchCategories()}
          disabled={isLoading}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {submittedSearch && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800">
          Xóa từ khóa tìm kiếm để sắp xếp toàn bộ danh mục theo thứ tự hệ thống.
        </div>
      )}

      <div className="premium-card overflow-hidden bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold text-slate-500">
            Kéo thả hoặc dùng nút mũi tên để thay đổi thứ tự. Thứ tự được lưu ngay sau khi cập nhật.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-4">Thứ tự</th>
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Số lượng Jobs</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#0052cc]" /></td></tr>
              ) : loadError ? (
                <tr><td colSpan={7} className="p-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 text-sm font-semibold text-red-700">{loadError}</p><button onClick={() => void fetchCategories()} className="mt-4 rounded-xl bg-[#0052cc] px-4 py-2 text-xs font-bold text-white">Thử lại</button></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center"><Tags className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Chưa có danh mục nào</p><p className="mt-1 text-sm text-slate-500">Tạo danh mục đầu tiên để HR có thể phân loại Job.</p></td></tr>
              ) : (
                categories.map((category, index) => (
                  <tr
                    key={category.id}
                    draggable={!submittedSearch && !isSavingOrder}
                    onDragStart={() => setDraggedId(category.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(category.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={`transition-colors hover:bg-slate-50/60 ${draggedId === category.id ? 'bg-blue-50 opacity-60' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-slate-300" aria-label="Kéo để sắp xếp" />
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-[#0052cc]">{index + 1}</span>
                        <div className="ml-1 flex flex-col">
                          <button onClick={() => moveCategory(category.id, -1)} disabled={index === 0 || !!submittedSearch || isSavingOrder} className="cursor-pointer text-slate-400 hover:text-[#0052cc] disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Đưa ${category.name} lên trước`}><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button onClick={() => moveCategory(category.id, 1)} disabled={index === categories.length - 1 || !!submittedSearch || isSavingOrder} className="cursor-pointer text-slate-400 hover:text-[#0052cc] disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Đưa ${category.name} xuống sau`}><ArrowDown className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0052cc]"><Tags className="h-4 w-4" /></div><span className="text-sm font-bold text-slate-800">{category.name}</span></div></td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{category.slug}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{category.jobCount} tin</td>
                    <td className="px-6 py-4"><button onClick={() => void toggleStatus(category)} disabled={actionId === category.id} className={`inline-flex cursor-pointer items-center rounded-full border px-2.5 py-1 text-[10px] font-bold disabled:cursor-not-allowed disabled:opacity-50 ${category.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{category.status === 'ACTIVE' ? 'Hoạt động' : 'Đã ẩn'}</button></td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{formatDate(category.createdAt)}</td>
                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openEdit(category)} disabled={actionId === category.id} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#0052cc] disabled:opacity-50" aria-label={`Sửa ${category.name}`}><Edit2 className="h-3.5 w-3.5" /></button><button onClick={() => setDeletingId(category.id)} disabled={category.jobCount > 0 || actionId === category.id} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label={category.jobCount > 0 ? 'Không thể xóa danh mục đang có Job sử dụng' : `Xóa ${category.name}`} title={category.jobCount > 0 ? 'Không thể xóa danh mục đang có Job sử dụng' : 'Xóa mềm'}><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-end gap-3 text-xs font-bold text-slate-600">
          <button onClick={() => setPage((current) => current - 1)} disabled={page <= 1 || isLoading} className="rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Trang trước</button>
          <span>Trang {page}/{lastPage}</span>
          <button onClick={() => setPage((current) => current + 1)} disabled={page >= lastPage || isLoading} className="rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Trang sau</button>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" aria-label={modalMode === 'create' ? 'Thêm danh mục' : 'Sửa danh mục'} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-slate-900">{modalMode === 'create' ? 'Thêm danh mục' : 'Sửa danh mục'}</h2><p className="mt-1 text-xs text-slate-500">Slug sẽ được backend tự động sinh từ tên danh mục.</p></div><button onClick={() => closeModal()} className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Đóng"><X className="h-5 w-5" /></button></div>
            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
              <div><label htmlFor="category-name" className="mb-1.5 block text-xs font-bold text-slate-700">Tên danh mục <span className="text-red-500">*</span></label><input id="category-name" autoFocus value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength={255} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]" placeholder="Ví dụ: Công nghệ thông tin" /></div>
              {modalMode === 'edit' && <div><label htmlFor="category-status" className="mb-1.5 block text-xs font-bold text-slate-700">Trạng thái</label><select id="category-status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as JobCategoryStatus }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"><option value="ACTIVE">Hoạt động</option><option value="INACTIVE">Đã ẩn</option></select></div>}
              {formError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700" role="alert">{formError}</p>}
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => closeModal()} disabled={isSaving} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy</button><button type="submit" disabled={isSaving} className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#0052cc] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">{isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Lưu danh mục</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

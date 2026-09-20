import React from 'react';
import { AlertTriangle, Eye, Globe, Loader2, X } from 'lucide-react';
import type { JobStatus } from '../../types/job.types';

type Action = 'publish' | 'close' | 'reopen';

interface Props {
  isOpen: boolean;
  action: Action;
  jobTitle: string;
  location?: string;
  currentStatus: JobStatus;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const copy: Record<Action, { title: string; description: string; confirm: string; icon: typeof Globe; color: string }> = {
  publish: {
    title: 'Xác nhận đăng tuyển',
    description: 'Tin tuyển dụng sẽ chuyển sang ACTIVE và xuất hiện trên Career Site nếu dữ liệu hợp lệ.',
    confirm: 'Đồng ý đăng tuyển',
    icon: Globe,
    color: 'primary'
  },
  close: {
    title: 'Xác nhận đóng Job',
    description: 'Job sẽ chuyển sang CLOSED và không nhận hồ sơ mới trên Career Site. Ứng viên hiện tại vẫn giữ nguyên pipeline.',
    confirm: 'Đóng Job',
    icon: AlertTriangle,
    color: 'red'
  },
  reopen: {
    title: 'Xác nhận mở lại Job',
    description: 'Job sẽ chuyển sang ACTIVE và xuất hiện lại trên Career Site. Dữ liệu pipeline hiện tại được giữ nguyên.',
    confirm: 'Mở lại Job',
    icon: Globe,
    color: 'emerald'
  }
};

export const JobStatusActionModal: React.FC<Props> = ({
  isOpen,
  action,
  jobTitle,
  location,
  currentStatus,
  isPending,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const content = copy[action];
  const Icon = content.icon;
  const tone = content.color === 'red'
    ? 'bg-red-50 text-red-500 border-red-100'
    : content.color === 'emerald'
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
      : 'bg-primary-50 text-primary-500 border-primary-100';
  const actionButton = content.color === 'red'
    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/15'
    : content.color === 'emerald'
      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/15'
      : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/15';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="job-status-action-title">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
        <div className="flex justify-end -mr-2 -mt-2">
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm ${tone}`}>
          <Icon className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h3 id="job-status-action-title" className="text-base font-extrabold uppercase tracking-wider text-slate-800">{content.title}</h3>
          <p className="text-xs font-semibold leading-relaxed text-slate-400">{content.description}</p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
          <Eye className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold leading-snug text-slate-700">{jobTitle}</h4>
            <p className="text-[10px] font-semibold uppercase text-slate-400">{location || 'Chưa cập nhật'} · Hiện tại: {currentStatus}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50">Hủy bỏ</button>
          <button type="button" onClick={onConfirm} disabled={isPending} className={`flex-1 rounded-xl py-3 text-xs font-bold text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60 ${actionButton}`}>
            {isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : content.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

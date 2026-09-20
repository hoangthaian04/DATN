import React from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, PowerOff, RotateCcw, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { JobStatus, JobSummary } from '../../types/job.types';
import { jobService } from '../../services/job.service';
import { JobStatusActionModal } from '../modals/JobStatusActionModal';

type JobStatusAction = 'publish' | 'close' | 'reopen';

interface ActionMenuProps {
  job: JobSummary;
  onDelete: (id: number) => void;
}

export const JobActionMenu: React.FC<ActionMenuProps> = ({ job, onDelete }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [statusAction, setStatusAction] = React.useState<JobStatusAction | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (action: JobStatusAction) => {
      if (action === 'publish') return jobService.publishJob(job.id);
      if (action === 'close') return jobService.closeJob(job.id);
      return jobService.reopenJob(job.id);
    },
    onSuccess: (_, action) => {
      setStatusAction(null);
      setIsOpen(false);
      toast.success(action === 'publish' ? 'Tin tuyển dụng đã được đăng công khai' : action === 'close' ? 'Đã đóng Job' : 'Đã mở lại Job');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái Job');
    }
  });

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    setIsOpen(false);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    onDelete(job.id);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-10">
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
          >
            <Eye size={16} className="text-slate-400" /> Xem chi tiết
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            onClick={() => navigate(`/dashboard/jobs/${job.id}?edit=true`)}
          >
            <Edit size={16} className="text-blue-500" /> Chỉnh sửa
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            onClick={() => {
              setIsOpen(false);
              setStatusAction(job.status === 'INACTIVE' ? 'publish' : job.status === 'ACTIVE' ? 'close' : 'reopen');
            }}
          >
            {job.status === 'INACTIVE' ? <Globe size={16} className="text-primary-500" /> : job.status === 'ACTIVE' ? <PowerOff size={16} className="text-amber-500" /> : <RotateCcw size={16} className="text-emerald-500" />}
            {job.status === 'INACTIVE' ? 'Đăng tuyển' : job.status === 'ACTIVE' ? 'Đóng Job' : 'Mở lại Job'}
          </button>
          <div className="h-px bg-slate-100 my-1"></div>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            onClick={handleDelete}
          >
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xóa công việc này?</h3>
            <p className="text-slate-600 text-sm mb-6">
              Hành động này sẽ ẩn Job khỏi danh sách hệ thống. Bạn có chắc chắn muốn tiếp tục?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors font-medium text-sm"
                onClick={() => setShowConfirm(false)}
              >
                Hủy bỏ
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors font-medium text-sm"
                onClick={confirmDelete}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <JobStatusActionModal
        isOpen={statusAction !== null}
        action={statusAction || 'publish'}
        jobTitle={job.title}
        location={job.location}
        currentStatus={job.status as JobStatus}
        isPending={statusMutation.isPending}
        onClose={() => setStatusAction(null)}
        onConfirm={() => statusAction && statusMutation.mutate(statusAction)}
      />
    </div>
  );
};

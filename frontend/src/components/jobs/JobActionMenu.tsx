import React from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { JobSummary } from '../../types/job.types';

interface ActionMenuProps {
  job: JobSummary;
  onDelete: (id: string) => void;
}

export const JobActionMenu: React.FC<ActionMenuProps> = ({ job, onDelete }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

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
            onClick={() => toast('Tính năng đang phát triển', { icon: '🚧' })}
          >
            <PowerOff size={16} className="text-amber-500" /> Đóng Job
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
    </div>
  );
};

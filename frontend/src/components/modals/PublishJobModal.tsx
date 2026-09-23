import React from 'react';
import { X, Globe, Eye } from 'lucide-react';

interface PublishJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  location: string;
}

export const PublishJobModal: React.FC<PublishJobModalProps> = ({ isOpen, onClose, onConfirm, jobTitle, location }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up text-center p-6 space-y-6">
        
        {/* Close Button */}
        <div className="flex justify-end -mr-2 -mt-2">
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Global/Publish Icon */}
        <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto border border-primary-100 shadow-sm animate-pulse-gentle">
          <Globe className="h-7 w-7" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">
            Xác nhận Đăng tuyển
          </h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Hành động này sẽ công khai tin tuyển dụng của bạn trên Career Site độc lập tại subdomain công ty.
          </p>
        </div>

        {/* Preview Info Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-left">
          <Eye className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-700 leading-snug">{jobTitle}</h4>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">{location}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 select-none">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-md shadow-primary-500/10 cursor-pointer"
          >
            Đồng ý Đăng tuyển
          </button>
        </div>

      </div>
    </div>
  );
};

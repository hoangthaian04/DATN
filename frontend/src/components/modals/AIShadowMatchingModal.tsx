import React from 'react';

interface AIShadowMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  onSendEmail: () => void;
  onSnooze: () => void;
}

export const AIShadowMatchingModal: React.FC<AIShadowMatchingModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  onSendEmail,
  onSnooze,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">AI Shadow Matching Đề Xuất</h2>
              <p className="text-xs font-semibold text-slate-500">Phân tích hồ sơ tự động từ hệ thống</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {candidateName} rất tiềm năng cho vị trí <span className="text-primary-600">Frontend Developer</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Dù chưa phù hợp với Fullstack, hồ sơ này khớp đến 92% với vị trí Frontend đang mở tuyển.
            </p>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            {/* Candidate Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Hồ sơ ứng viên</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{candidateName}</p>
                  <p className="text-xs font-semibold text-slate-500">3 năm kinh nghiệm</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Kỹ năng mạnh:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">ReactJS</span>
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">TypeScript</span>
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">TailwindCSS</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Kỹ năng yếu / Thiếu:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 rounded-md bg-red-50 text-red-500 text-[10px] font-bold border border-red-100">Node.js (Backend)</span>
                    <span className="px-2 py-1 rounded-md bg-red-50 text-red-500 text-[10px] font-bold border border-red-100">AWS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Score Middle */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="36" className="stroke-slate-200" strokeWidth="8" fill="none" />
                  <circle cx="48" cy="48" r="36" className="stroke-primary-500" strokeWidth="8" fill="none" strokeDasharray="226" strokeDashoffset="18" strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-primary-600">92%</span>
                  <span className="text-[10px] font-bold text-slate-400">MATCH</span>
                </div>
              </div>
            </div>

            {/* Job Requirement Card */}
            <div className="bg-white rounded-2xl border border-primary-200 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-extrabold rounded-bl-xl">
                ĐANG TUYỂN
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Vị trí đề xuất</h4>
              <div className="mb-4">
                <p className="text-base font-extrabold text-slate-800">Frontend Developer</p>
                <p className="text-xs font-semibold text-slate-500">Phòng Phát triển Sản phẩm</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Yêu cầu chính khớp 100%</p>
                    <p className="text-[10px] text-slate-500">ReactJS, TypeScript, cắt HTML/CSS chuẩn UI.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Không yêu cầu Backend</p>
                    <p className="text-[10px] text-slate-500">Khắc phục được lý do trượt ở vị trí trước.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onSnooze}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Nhắc tôi sau
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Gửi HR phụ trách Job
            </button>
          </div>
          <button
            onClick={onSendEmail}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold shadow-sm shadow-primary-500/20 transition-all"
          >
            Tạo Email Mời Ứng Tuyển
          </button>
        </div>
      </div>
    </>
  );
};

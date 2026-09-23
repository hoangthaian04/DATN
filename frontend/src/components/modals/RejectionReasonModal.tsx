import React, { useState } from 'react';
import { X, AlertCircle, Sparkles } from 'lucide-react';

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  onConfirm: (reason: string) => void;
}

const COMMON_REASONS = [
  'Kỹ năng chuyên môn chưa đáp ứng',
  'Kinh nghiệm chưa phù hợp',
  'Mức lương kỳ vọng cao',
  'Tiếng Anh chưa đủ tốt',
  'Định hướng không phù hợp',
];

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Từ chối ứng viên</h2>
              <p className="text-xs font-semibold text-slate-500">{candidateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <p className="text-sm font-semibold text-slate-600 mb-4">
            Vui lòng cho biết lý do {candidateName} chưa phù hợp với vị trí này. AI sẽ sử dụng thông tin này để gợi ý vị trí khác chính xác hơn.
          </p>

          <div className="space-y-4">
            {/* Common Reasons */}
            <div className="flex flex-wrap gap-2">
              {COMMON_REASONS.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setReason(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    reason === r
                      ? 'bg-primary-50 border-primary-200 text-primary-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Custom Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Hoặc nhập lý do cụ thể:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Ứng viên mạnh về Frontend nhưng vị trí này đòi hỏi Backend cứng..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-sm transition-all resize-none h-24"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold shadow-sm shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Tiếp tục & Tìm Job phù hợp
          </button>
        </div>
      </div>
    </>
  );
};

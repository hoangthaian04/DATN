import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, Mail, ChevronDown, Send } from 'lucide-react';

interface InterviewSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { date: string; time: string; note: string; templateId: string }) => void;
  candidateName?: string;
}

const EMAIL_TEMPLATES = [
  { id: 'tpl-interview-1', label: 'Mời phỏng vấn vòng 1' },
  { id: 'tpl-interview-2', label: 'Mời phỏng vấn vòng 2' },
  { id: 'tpl-interview-3', label: 'Mời phỏng vấn vòng cuối' },
  { id: 'tpl-custom', label: 'Không gửi email' },
];

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName = 'ứng viên',
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!date || !time) return;
    onSubmit?.({ date, time, note, templateId });
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Đặt lịch phỏng vấn</h3>
              <p className="text-[10px] font-semibold text-slate-400">Cho: {candidateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {isSent ? (
          /* Success State */
          <div className="px-6 py-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-bounce">
              <Send className="h-8 w-8 text-emerald-500" />
            </div>
            <h4 className="text-base font-extrabold text-slate-800">Đã gửi lời mời!</h4>
            <p className="text-xs text-slate-400 font-semibold">
              Email mời phỏng vấn đã được gửi tới <span className="text-slate-700">{candidateName}</span>
            </p>
          </div>
        ) : (
          <div className="px-6 pt-5 pb-6 space-y-5">
            {/* Date + Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Ngày phỏng vấn *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-700 transition-colors bg-white cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Giờ phỏng vấn *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-700 transition-colors bg-white cursor-pointer"
                />
              </div>
            </div>

            {/* Email Template */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                Mẫu email gửi kèm
              </label>
              <div className="relative">
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-700 transition-colors bg-white cursor-pointer"
                >
                  {EMAIL_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3" />
                Ghi chú bổ sung
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="VD: Phỏng vấn online qua Google Meet. Link: meet.google.com/..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-700 resize-none transition-colors placeholder:text-slate-300 placeholder:font-normal"
              />
            </div>

            {/* Preview Box */}
            {(date || time) && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">Xem trước lịch hẹn</p>
                <p className="text-xs font-bold text-slate-700">
                  📅 {date || '—'} &nbsp;⏰ {time || '—'}
                </p>
                {note && <p className="text-[11px] text-slate-500 mt-1">{note}</p>}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!date || !time}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                  !date || !time
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/20 cursor-pointer active:scale-95'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                Gửi lời mời
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { X, Sparkles, CheckCircle2, XCircle, ChevronRight, Award, AlertCircle, TrendingUp } from 'lucide-react';

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  matchScore?: number;
}

export const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({
  isOpen,
  onClose,
  candidateName = 'ứng viên',
  matchScore = 87,
}) => {
  if (!isOpen) return null;

  const scoreGradient =
    matchScore >= 85
      ? 'from-emerald-500 to-teal-400'
      : matchScore >= 70
      ? 'from-amber-500 to-yellow-400'
      : 'from-red-500 to-rose-400';

  const strengths = [
    'Có 5+ năm kinh nghiệm AI/ML phù hợp JD',
    'Portfolio dự án thực tế với kết quả đo lường được',
    'Kỹ năng Python & LangChain thành thạo',
    'Đã từng làm việc tại công ty product (không outsource)',
  ];

  const weaknesses = [
    'Chưa có kinh nghiệm lead team > 5 người',
    'Thiếu chứng chỉ AWS/GCP yêu cầu',
  ];

  const questions = [
    'Dự án AI lớn nhất bạn đã thực hiện? Kết quả đo được như thế nào?',
    'Bạn xử lý data drift trong production ML system thế nào?',
    'Kinh nghiệm deploy LLM ở quy mô lớn (>1M requests/day)?',
    'Cách bạn balance giữa accuracy và latency khi thiết kế model?',
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-amber-400 flex items-center justify-center shadow-md shadow-primary-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">AI Phân tích hồ sơ</h3>
              <p className="text-[10px] font-semibold text-slate-400">Ứng viên: {candidateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Score Card */}
          <div className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${scoreGradient} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Matching Score</p>
                <p className="text-5xl font-extrabold mt-1 leading-none">{matchScore}<span className="text-2xl opacity-70">%</span></p>
                <p className="text-xs font-semibold opacity-80 mt-2">
                  {matchScore >= 85 ? '🎯 Ứng viên rất phù hợp với vị trí' : matchScore >= 70 ? '⚡ Phù hợp tốt, nên phỏng vấn' : '⚠️ Cần xem xét kỹ hơn'}
                </p>
              </div>
              <div className="opacity-10">
                <TrendingUp className="h-24 w-24" />
              </div>
            </div>
            {/* Bar */}
            <div className="mt-4 h-2 rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <Award className="h-3.5 w-3.5" />
              Điểm mạnh ({strengths.length})
            </h4>
            <div className="space-y-2">
              {strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Điểm cần xem xét ({weaknesses.length})
            </h4>
            <div className="space-y-2">
              {weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                  <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Questions */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-primary-500 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5" />
              Câu hỏi phỏng vấn AI đề xuất
            </h4>
            <div className="space-y-2.5">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-primary-50 border border-primary-100 rounded-xl">
                  <span className="h-5 w-5 rounded-lg bg-primary-500 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-400 font-semibold text-center border-t border-slate-100 pt-4">
            🤖 Kết quả phân tích bởi AI · Chỉ mang tính tham khảo · Không thay thế đánh giá của HR
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Đóng phân tích
          </button>
        </div>
      </div>
    </div>
  );
};

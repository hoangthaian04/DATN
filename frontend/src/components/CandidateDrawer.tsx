import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Download, Sparkles } from 'lucide-react';
import { jobService } from '../services/job.service';

export interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  jobTitle: string;
  matchScore: number;
  status: 'NEW' | 'IN_PROGRESS' | 'PASSED' | 'REJECTED' | 'HIRED' | string;
  currentRound: number;
  totalRounds: number;
  submittedAt: string;
  cvUrl?: string;
  roundHistory?: {
    roundIndex: number;
    roundName: string;
    result: 'PASSED' | 'FAILED' | 'PENDING' | 'SKIPPED';
    date?: string;
  }[];
}

interface CandidateDrawerProps {
  isOpen: boolean;
  candidate: CandidateData | null;
  onClose: () => void;
  onPass?: (id: string) => void;
  onFail?: (id: string) => void;
  onInitiateFail?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onAISuggest?: (id: string) => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  isOpen,
  candidate,
  onClose,
  onPass,
  onFail,
  onInitiateFail,
}) => {
  const [activeSection, setActiveSection] = useState<'info' | 'ai'>('info');

  // Fetch real application detail from backend
  const { data: detail, isLoading } = useQuery({
    queryKey: ['application-detail', candidate?.id],
    queryFn: () => jobService.getApplicationDetail(candidate!.id),
    enabled: Boolean(isOpen && candidate?.id),
  });

  if (!candidate) return null;

  // Fallbacks using detail API or prop fallback
  const fullName = detail?.fullName || candidate.name;
  const email = detail?.email || candidate.email;
  const phone = detail?.phone || candidate.phone;
  const jobTitle = detail?.jobTitle || candidate.jobTitle;
  const status = (detail?.applicationStatus || candidate.status) as keyof typeof statusMap;
  const appliedAt = detail?.appliedAt
    ? new Date(detail.appliedAt).toLocaleDateString('vi-VN')
    : candidate.submittedAt;
  const avatar =
    detail?.avatarUrl ||
    candidate.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  const cvUrl = detail?.cvUrl || candidate.cvUrl;

  const statusMap = {
    NEW: { label: 'Mới', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    IN_PROGRESS: { label: 'Đang xử lý', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    PASSED: { label: 'Đạt', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    REJECTED: { label: 'Không đạt', cls: 'bg-red-50 text-red-500 border-red-100' },
    HIRED: { label: 'Đã tuyển', cls: 'bg-purple-50 text-purple-600 border-purple-100' },
  };

  const statusInfo = statusMap[status] ?? {
    label: status,
    cls: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed right-0 top-0 h-full w-[900px] max-w-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar}
                alt={fullName}
                className="h-12 w-12 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">{fullName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-400 font-semibold truncate max-w-[200px]">{jobTitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-6 mt-5 border-b border-slate-100 shrink-0">
          {(['info', 'ai'] as const).map((sec) => {
            const labels = { info: 'Thông tin', ai: 'AI Gợi ý' };
            return (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeSection === sec
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {labels[sec]}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : activeSection === 'info' ? (
            <>
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thông tin liên hệ</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 font-bold">Họ và tên</p>
                      <p className="text-sm font-normal text-slate-600 truncate mt-0.5">{fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 font-bold">Email</p>
                      <p className="text-sm font-normal text-slate-600 truncate mt-0.5">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-700 font-bold">Số điện thoại</p>
                      <p className="text-sm font-normal text-slate-600 mt-0.5">{phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-700 font-bold">Ngày nộp hồ sơ</p>
                      <p className="text-sm font-normal text-slate-600 mt-0.5">{appliedAt || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Download */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hồ sơ đính kèm</h4>
                <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-500/10 border border-primary-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-500">CV</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">CV_{fullName.replace(/\s/g, '_')}.pdf</p>
                      <p className="text-[10px] text-slate-400 font-semibold">PDF File</p>
                    </div>
                  </div>
                  <a
                    href={cvUrl || '#'}
                    className={`flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold transition-colors ${
                      cvUrl ? 'text-slate-700 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
                    }`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải xuống</span>
                  </a>
                </div>
              </div>

              {/* Round History list */}
              {detail?.roundHistory && detail.roundHistory.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lịch sử các vòng</p>
                  <div className="space-y-1.5">
                    {detail.roundHistory.map((r) => (
                      <div key={r.roundId} className="flex items-center justify-between text-xs py-1.5 px-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <span className="font-semibold text-slate-700">{r.orderIndex}. {r.roundName}</span>
                        {r.isCurrent ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Đang ở vòng này</span>
                        ) : r.isPassed ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Đã vượt qua</span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">Chưa đến</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 -mx-6 -my-5 p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mb-2">Chưa có dữ liệu phân tích AI</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed font-medium mb-6">
                Tính năng phân tích CV tự động, bóc băng phỏng vấn và đánh giá ứng viên bằng AI đang được kết nối trực tiếp với dịch vụ AI Engine. Hiện chưa có dữ liệu phân tích cho ứng viên này.
              </p>
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 max-w-md text-left space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Trạng thái kết nối API:</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Hệ thống Backend hiện chưa mở endpoint API phân tích AI cho hồ sơ ứng tuyển này. Dữ liệu thử nghiệm đã được gỡ bỏ để đảm bảo tính chính xác của dữ liệu thực tế.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-5 border-t border-slate-100 bg-white shrink-0 space-y-3">
          {/* Pass / Fail */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onPass?.(candidate.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
            >
              ĐẠT vòng này
            </button>
            <button
              onClick={() => (onInitiateFail ? onInitiateFail(candidate.id) : onFail?.(candidate.id))}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm shadow-red-500/20 transition-all cursor-pointer active:scale-95"
            >
              TRƯỢT
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

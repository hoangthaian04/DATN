import React, { useState } from 'react';
import { Bell, ExternalLink, FileText, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NOTIFICATIONS = [
  {
    id: 'n1',
    candidate: 'Lê Hoàng Phúc',
    job: 'Senior AI Engineer',
    time: '5 phút trước',
    score: 87,
    cvRequired: true,
  },
  {
    id: 'n2',
    candidate: 'Phạm Thu Hà',
    job: 'Backend Developer (Java)',
    time: '18 phút trước',
    score: 92,
    cvRequired: true,
  },
];

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="h-[64px] border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 hidden sm:block">HR Workspace</h2>
        <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:block">Công ty</span>
        <button
          onClick={() => navigate('/dashboard/career-site')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-100 bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition-colors cursor-pointer"
        >
          <Globe2 className="h-3.5 w-3.5" />
          Quản trị Career Site
        </button>
        <button
          onClick={() => window.open('/careers', '_blank')}
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Xem site công khai
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setOpen((value) => !value)}
            className="relative text-slate-500 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-primary-500 rounded-full border-2 border-white text-[9px] leading-[14px] text-white font-extrabold">
              {NOTIFICATIONS.length}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-800">Thông báo mới</p>
                  <p className="text-[11px] font-semibold text-slate-400">Ứng viên vừa nộp hồ sơ vào Career Site</p>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/dashboard/notifications');
                  }}
                  className="text-[11px] font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="max-h-[340px] overflow-y-auto">
                {NOTIFICATIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setOpen(false);
                      navigate('/dashboard/applications/list');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-500 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-800">
                          {item.candidate} vừa ứng tuyển
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          JD: <span className="text-slate-700">{item.job}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.cvRequired
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {item.cvRequired ? `AI score ${item.score}%` : 'Không yêu cầu CV'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

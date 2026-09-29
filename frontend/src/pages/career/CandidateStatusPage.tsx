import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  CalendarClock,
  Briefcase,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const APPLICATION = {
  candidateName: 'Nguyễn Văn An',
  jobTitle: 'Senior Fullstack Developer',
  companyName: 'TechA Solutions JSC',
  appliedAt: '2026-09-20 09:30',
  email: 'hamom19052004@gmail.com',
  cvFile: 'NguyenVanAn_CV.pdf',
  score: 88,
  currentStage: 'Vòng phỏng vấn kỹ thuật',
  status: 'Đang xử lý',
};

const TIMELINE = [
  {
    title: 'Đã nhận hồ sơ',
    desc: 'Hệ thống đã ghi nhận CV và gửi email xác nhận.',
    time: '20/09/2026 09:30',
    state: 'done',
    icon: FileText,
  },
  {
    title: 'AI phân tích CV',
    desc: 'CV đã được trích xuất nội dung và chấm điểm phù hợp với JD.',
    time: '20/09/2026 09:32',
    state: 'done',
    icon: Sparkles,
  },
  {
    title: 'Vòng lọc hồ sơ',
    desc: 'Hồ sơ đã vượt qua vòng sơ loại CV.',
    time: '22/09/2026 14:00',
    state: 'done',
    icon: CheckCircle2,
  },
  {
    title: 'Phỏng vấn kỹ thuật',
    desc: 'Đang xếp lịch và thực hiện phỏng vấn chuyên môn.',
    time: 'Đang diễn ra',
    state: 'active',
    icon: Clock,
  },
  {
    title: 'Vòng cuối & Offer',
    desc: 'Nếu phù hợp, HR sẽ gửi thư mời nhận việc (Offer Letter).',
    time: 'Chưa bắt đầu',
    state: 'pending',
    icon: CalendarClock,
  },
];

export const CandidateStatusPage: React.FC = () => {
  const { companySlug = 'techa' } = useParams<{ companySlug: string }>();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link to={`/company/${companySlug}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Về trang công ty
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[10px] font-extrabold text-primary-600">
                  <Briefcase className="h-3 w-3" />
                  {APPLICATION.companyName}
                </span>
                <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Theo dõi hồ sơ ứng tuyển</h1>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Hồ sơ của <strong className="text-slate-800">{APPLICATION.candidateName}</strong> cho vị trí <span className="text-slate-800 font-bold">{APPLICATION.jobTitle}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-center min-w-36">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Trạng thái</p>
                <p className="mt-1 text-sm font-extrabold text-emerald-700">{APPLICATION.status}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Tiến trình xử lý</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">Các mốc trạng thái hồ sơ ứng tuyển của bạn.</p>
              </div>
              <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                Vòng hiện tại: {APPLICATION.currentStage}
              </span>
            </div>

            <div className="relative space-y-5 pl-6">
              <div className="absolute left-[29px] top-3 bottom-3 w-px bg-slate-200" />
              {TIMELINE.map((item) => {
                const Icon = item.icon;
                const active = item.state === 'active';
                const done = item.state === 'done';
                return (
                  <div key={item.title} className="relative flex items-start gap-4">
                    <div className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-4 border-white ${
                      done ? 'bg-emerald-500 text-white' : active ? 'bg-primary-500 text-white ring-4 ring-primary-100' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-sm font-extrabold text-slate-800">{item.title}</p>
                        <p className="text-[10px] font-bold text-slate-400">{item.time}</p>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-sm font-extrabold text-slate-900">Thông tin hồ sơ</h2>
            <div className="mt-5 space-y-4">
              {[
                { label: 'Ứng viên', value: APPLICATION.candidateName },
                { label: 'Email', value: APPLICATION.email },
                { label: 'Ngày nộp', value: APPLICATION.appliedAt },
                { label: 'CV đính kèm', value: APPLICATION.cvFile },
              ].map((row) => (
                <div key={row.label} className="border-b border-slate-100 pb-3 last:border-b-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{row.label}</p>
                  <p className="mt-1 text-xs font-bold text-slate-700 break-words">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Matching Score</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{APPLICATION.score}%</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-500" />
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-500">
              Độ phù hợp của hồ sơ so với yêu cầu vị trí tuyển dụng. Kết quả đánh giá chi tiết sẽ được HR trao đổi trong buổi phỏng vấn.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-amber-800">Lưu ý dành cho ứng viên</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700">
                  Kết quả kết chuyển các vòng tuyển dụng sẽ tự động gửi tới email đăng ký của bạn. Vui lòng kiểm tra kỹ hòm thư cá nhân.
                </p>
              </div>
            </div>
          </div>

          <a
            href="mailto:hr@techa.vn"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-600 hover:border-primary-200 hover:text-primary-600 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Liên hệ bộ phận HR
          </a>
        </div>
      </div>
    </div>
  );
};

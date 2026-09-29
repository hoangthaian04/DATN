import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Mail, Hash, CheckCircle2, Clock, FileText, ChevronRight } from 'lucide-react';

export const CandidateTrackPage: React.FC = () => {
  const { companySlug = 'techa' } = useParams<{ companySlug: string }>();
  const [email, setEmail] = useState('hamom19052004@gmail.com');
  const [code, setCode] = useState('APP-2026-0001');
  const [searched, setSearched] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link to={`/company/${companySlug}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Về trang công ty
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-[10px] font-extrabold text-primary-600">
                <Search className="h-3 w-3" />
                Candidate Tracking
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">Tra cứu hồ sơ ứng tuyển</h1>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                Ứng viên không cần tạo tài khoản. Chỉ cần email và mã hồ sơ nhận được sau khi nộp CV.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Mail className="h-3 w-3" />
                  Email ứng tuyển
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Hash className="h-3 w-3" />
                  Mã hồ sơ
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setSearched(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 cursor-pointer"
            >
              Tra cứu hồ sơ
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {searched ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mã hồ sơ</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{code}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">Senior Fullstack Developer · TechA Solutions JSC</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-600">
                  <Clock className="h-3.5 w-3.5" />
                  HR đang phỏng vấn
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Ứng viên', value: 'Nguyễn Văn An' },
                  { label: 'Ngày nộp', value: '20/09/2026' },
                  { label: 'Vòng hiện tại', value: 'Phỏng vấn kỹ thuật' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-extrabold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { icon: CheckCircle2, title: 'Đã nhận hồ sơ', desc: 'Email xác nhận đã được gửi cho ứng viên.', done: true },
                  { icon: FileText, title: 'AI phân tích CV', desc: 'Hệ thống đã trích xuất CV và tạo điểm phù hợp 88%.', done: true },
                  { icon: Clock, title: 'Phỏng vấn kỹ thuật', desc: 'HR và Technical Lead đang tiến hành đánh giá chuyên môn.', done: false },
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.done ? 'bg-emerald-50 text-emerald-500' : 'bg-primary-50 text-primary-500'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">{step.title}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to={`/careers/applications/status`}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-extrabold text-white hover:bg-slate-800"
              >
                Xem timeline chi tiết
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-10 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-bold text-slate-700">Nhập email và mã hồ sơ để tra cứu</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Xem tiến trình xử lý hồ sơ ứng tuyển của bạn theo thời gian thực.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

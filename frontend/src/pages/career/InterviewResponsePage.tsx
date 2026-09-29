import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, MapPin, Video, XCircle } from 'lucide-react';

type ResponseState = 'idle' | 'accepted' | 'reschedule';

export const InterviewResponsePage: React.FC = () => {
  const { companySlug = 'techa' } = useParams<{ companySlug: string }>();
  const [state, setState] = useState<ResponseState>('idle');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to={`/company/${companySlug}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Về trang công ty
      </Link>

      <div className="premium-card bg-white p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-[10px] font-extrabold text-primary-600">
              <CalendarClock className="h-3 w-3" />
              Interview Invitation
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Phản hồi lịch phỏng vấn</h1>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
              Đây là giao diện mock cho link ứng viên nhận qua email mời phỏng vấn.
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Trạng thái</p>
            <p className="mt-1 text-sm font-extrabold text-emerald-700">
              {state === 'accepted' ? 'Đã xác nhận' : state === 'reschedule' ? 'Xin đổi lịch' : 'Chờ phản hồi'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: CalendarClock, label: 'Thời gian', value: '20/08/2026 · 09:30 AM' },
            { icon: Video, label: 'Hình thức', value: 'Google Meet · Link gửi qua email' },
            { icon: MapPin, label: 'Vị trí', value: 'Senior AI Engineer' },
            { icon: Clock, label: 'Thời lượng', value: '60 phút · Technical Interview' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <Icon className="h-5 w-5 text-primary-500" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">{item.value}</p>
              </div>
            );
          })}
        </div>

        {state === 'idle' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setState('reschedule')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-extrabold text-amber-700 hover:bg-amber-100 cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
              Xin đổi lịch
            </button>
            <button
              onClick={() => setState('accepted')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-600 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5" />
              Đồng ý tham gia
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-extrabold text-emerald-800">
              {state === 'accepted' ? 'Cảm ơn bạn đã xác nhận lịch phỏng vấn.' : 'Yêu cầu đổi lịch đã được ghi nhận.'}
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              HR sẽ nhận được phản hồi này trong hệ thống và email log sẽ được cập nhật khi có backend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Building2, TrendingUp, Clock } from 'lucide-react';

export const AdminOverview: React.FC = () => {
  // Mock Stats (In a real app, this would be fetched from the API)
  const stats = {
    total: 24,
    pending: 5,
    active: 17,
  };

  const statCards = [
    { label: 'Tổng Doanh nghiệp', value: stats.total, icon: Building2, color: 'bg-blue-50 text-[#0052cc] border-blue-100' },
    { label: 'Chờ duyệt', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Đang hoạt động', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  ];

  // Mock pending businesses
  const pendingBusinesses = [
    {
      id: 'b2',
      logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=80&h=80',
      name: 'InnovateTech VN',
      industry: 'Product Engineering',
      riskNote: 'Cần kiểm tra thêm domain email doanh nghiệp.',
    },
    {
      id: 'b3',
      logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&q=80&w=80&h=80',
      name: 'FutureSoft Corp',
      industry: 'Software Outsourcing',
      riskNote: 'Hồ sơ đầy đủ, website hoạt động bình thường.',
    },
    {
      id: 'b6',
      logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=80&h=80',
      name: 'Nexus Digital Agency',
      industry: 'Digital Agency',
      riskNote: 'Thiếu mã số thuế, cần yêu cầu bổ sung nếu làm dữ liệu thật.',
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tổng quan kiểm duyệt</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Xem nhanh trạng thái hệ thống và các yêu cầu đăng ký mới.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-extrabold text-slate-800">Hàng đợi kiểm duyệt</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Các doanh nghiệp cần kiểm tra trước khi cấp Career Site.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600 border border-amber-200">
              {stats.pending} đang chờ
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingBusinesses.map((b) => (
              <button
                key={b.id}
                className="text-left rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={b.logo} alt={b.name} className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-slate-800">{b.name}</p>
                    <p className="truncate text-[10px] font-semibold text-slate-500">{b.industry}</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] font-semibold leading-relaxed text-slate-500">{b.riskNote}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

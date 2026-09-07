import React from 'react';
import type { JobStats } from '../../types/job.types';

interface Props {
  stats?: JobStats;
  isLoading: boolean;
}

export const JobsStatsCards: React.FC<Props> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="premium-card bg-white p-6 h-36 flex flex-col justify-between animate-pulse border border-slate-100">
            <div className="h-4 bg-slate-100 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-100 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Tổng số vị trí */}
      <div className="premium-card bg-white p-6 flex flex-col justify-between h-36 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-400">Tổng số vị trí</span>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stats?.total || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
          <span>+{(stats?.total || 0) > 0 ? 1 : 0}</span> {/* Dummy indicator */}
        </div>
      </div>

      {/* Card 2: Vị trí đang mở */}
      <div className="premium-card bg-white p-6 flex flex-col justify-between h-36 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-400">Vị trí đang mở</span>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stats?.active || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
          <span>{stats?.active ? 'Hoạt động tốt' : 'Cần mở thêm'}</span>
        </div>
      </div>

      {/* Card 3: Ứng viên mới (Thay bằng Job Đã đóng để hợp DB) */}
      <div className="premium-card bg-white p-6 flex flex-col justify-between h-36 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-400">Vị trí đã đóng</span>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stats?.closed || 0}</p>
          </div>
        </div>
        <div className="mt-2 h-4"></div>
      </div>

      {/* Card 4: TG tuyển TB (Thay bằng Job Nháp/Tạm dừng) */}
      <div className="premium-card bg-white p-6 flex flex-col justify-between h-36 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-400">Nháp / Tạm dừng</span>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{stats?.inactive || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-primary-600 mt-2">
          <span>Cần review</span>
        </div>
      </div>
    </div>
  );
};

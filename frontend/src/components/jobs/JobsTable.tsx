import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { JobSummary } from '../../types/job.types';
import type { BasePagination } from '../../types/api.types';
import { JobActionMenu } from './JobActionMenu';

interface Props {
  jobsPagination?: BasePagination<JobSummary>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onDeleteJob: (id: string) => void;
}

export const JobsTable: React.FC<Props> = ({ jobsPagination, isLoading, onPageChange, onDeleteJob }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const isDraft = status === 'INACTIVE' || status === 'CLOSED';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
        isDraft 
          ? 'bg-slate-100 text-slate-500 border-slate-200' 
          : 'bg-emerald-50 text-emerald-500 border-emerald-100'
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${
          isDraft ? 'bg-slate-400' : 'bg-emerald-500'
        }`}></span>
        {status === 'ACTIVE' ? 'Đang mở' : status === 'INACTIVE' ? 'Bản nháp' : 'Đã đóng'}
      </span>
    );
  };

  const getJobTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'FULL_TIME': 'Toàn thời gian',
      'PART_TIME': 'Bán thời gian',
      'CONTRACT': 'Hợp đồng',
      'INTERNSHIP': 'Thực tập sinh'
    };
    return map[type] || type;
  };

  if (isLoading) {
    return (
      <div className="premium-card bg-white overflow-hidden border border-slate-100">
        <div className="animate-pulse flex flex-col">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-[68px] border-b border-slate-100 bg-slate-50/50 m-2 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const jobs = jobsPagination?.data || [];

  if (jobs.length === 0) {
    return (
      <div className="premium-card bg-white border border-slate-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <span className="text-2xl font-bold text-slate-300">!</span>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-1">Không tìm thấy công việc nào</h3>
        <p className="text-slate-500 text-sm font-medium">Thử thay đổi bộ lọc hoặc tạo một công việc mới.</p>
      </div>
    );
  }

  return (
    <div className="premium-card bg-white overflow-hidden shadow-sm border border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none">
              <th className="px-6 py-4 whitespace-nowrap">Tiêu đề</th>
              <th className="px-6 py-4 whitespace-nowrap">Loại hình</th>
              <th className="px-6 py-4 whitespace-nowrap">Địa điểm</th>
              <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Số vòng</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Ứng viên</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr 
                key={job.id} 
                className="hover:bg-slate-50/80 transition-colors text-sm font-semibold text-slate-700"
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <span 
                    onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                    className="font-extrabold text-slate-800 hover:text-primary-500 cursor-pointer transition-colors"
                  >
                    {job.title}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  {getJobTypeLabel(job.jobType)}
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  {job.location}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(job.status)}
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  {/* Sử dụng cứng 3 vòng do schema hiện tại chưa tracking cụ thể */}
                  3
                </td>
                <td className="px-6 py-4 text-center text-slate-800 font-bold">
                  {job.applicantCount || 0}
                </td>
                <td className="px-6 py-4 text-right">
                  <JobActionMenu job={job} onDelete={onDeleteJob} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer Pagination */}
      {jobsPagination && jobsPagination.last_page > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 select-none">
          <span className="text-xs font-semibold text-slate-400">
            Hiển thị <span className="text-slate-600 font-bold">{jobsPagination.current_page}</span> trên <span className="text-slate-600 font-bold">{jobsPagination.last_page}</span> trang 
            (Tổng: {jobsPagination.total} kết quả)
          </span>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange(jobsPagination.current_page - 1)}
              disabled={jobsPagination.current_page === 1}
              className={`px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-all ${
                jobsPagination.current_page === 1 
                  ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              &lt; Trước
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-500/10 transition-all cursor-default">
              {jobsPagination.current_page}
            </button>
            <button 
              onClick={() => onPageChange(jobsPagination.current_page + 1)}
              disabled={jobsPagination.current_page === jobsPagination.last_page}
              className={`px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-all ${
                jobsPagination.current_page === jobsPagination.last_page 
                  ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              Sau &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

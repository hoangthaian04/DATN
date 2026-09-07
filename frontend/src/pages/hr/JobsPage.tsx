import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { jobService } from '../../services/job.service';
import { JobsStatsCards } from '../../components/jobs/JobsStatsCards';
import { JobsFilterBar } from '../../components/jobs/JobsFilterBar';
import { JobsTable } from '../../components/jobs/JobsTable';

export const JobsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const limit = 10;

  // Fetch Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['jobStats'],
    queryFn: jobService.getStats
  });

  // Fetch Jobs
  const { data: jobsPagination, isLoading: isJobsLoading } = useQuery({
    queryKey: ['jobs', { page, limit, keyword, status }],
    queryFn: () => jobService.getJobs({ page, limit, keyword, status })
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: jobService.deleteJob,
    onSuccess: () => {
      toast.success('Xóa công việc thành công');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa công việc');
    }
  });

  const handleDeleteJob = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (jobsPagination?.last_page || 1)) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)] space-y-8">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Dashboard</span>
            <span className="text-[10px]">&gt;</span>
            <span className="text-slate-500">Tin tuyển dụng</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Danh sách tin tuyển dụng</h1>
          <p className="text-sm font-medium text-slate-500">
            Quản lý toàn bộ vị trí tuyển dụng của công ty
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer">
            <span>Xuất dữ liệu</span>
          </button>
          
          <Link 
            to="/dashboard/jobs/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 text-sm font-bold shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition-all duration-200 cursor-pointer"
          >
            <span>Tạo tin tuyển dụng</span>
          </Link>
        </div>
      </div>

      <JobsStatsCards stats={stats} isLoading={isStatsLoading} />

      <JobsFilterBar 
        onSearch={(k) => { setKeyword(k); setPage(1); }}
        onFilterStatus={(s) => { setStatus(s); setPage(1); }}
      />

      <JobsTable 
        jobsPagination={jobsPagination} 
        isLoading={isJobsLoading || deleteMutation.isPending} 
        onPageChange={handlePageChange}
        onDeleteJob={handleDeleteJob}
      />
    </div>
  );
};

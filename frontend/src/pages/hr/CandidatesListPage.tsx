import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/job.service';
import { CandidatesTable } from '@/components/candidates/CandidatesTable';
import { FilterBar } from '@/components/candidates/FilterBar';

export const CandidatesListPage: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  // Fetch danh sách Job cho Dropdown
  const { data: jobsPagination, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs-for-filter'],
    queryFn: () => jobService.getJobs({ limit: 100 })
  });

  // Lấy danh sách ứng viên (tất cả hoặc theo job)
  const { data: applicationsPagination, isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications', selectedJobId, status, page],
    queryFn: () => jobService.getApplications({ 
      jobId: selectedJobId || undefined, 
      page, 
      limit: 10, 
      status: status || undefined 
    })
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Danh sách Ứng viên</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Quản lý tất cả hồ sơ ứng tuyển
          </p>
        </div>
        <div className="flex gap-2">
          {/* Nút Toggle Kanban/List sẽ thêm vào sau nếu cần thiết, hiện tại chỉ có List ở route này */}
        </div>
      </div>

      <FilterBar 
        jobs={jobsPagination?.data || []}
        selectedJobId={selectedJobId}
        onJobChange={(newJobId) => {
          setSelectedJobId(newJobId);
          setPage(1);
        }}
        status={status}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1); // Reset trang về 1 khi đổi bộ lọc
        }}
        isLoadingJobs={isLoadingJobs}
      />

      <CandidatesTable 
        pagination={applicationsPagination}
        isLoading={isLoadingApps}
        onPageChange={setPage}
      />
    </div>
  );
};

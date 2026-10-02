import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { jobService } from '@/services/job.service';
import { CandidatesTable } from '@/components/candidates/CandidatesTable';
import { CandidateDrawer } from '@/components/candidates/CandidateDrawer';
import { FilterBar } from '@/components/candidates/FilterBar';
import type { ApplicationListDTO, ApplicationStatus } from '@/types/application.types';

export const CandidatesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJobId, setSelectedJobId] = useState<string>(() => searchParams.get('jobId') || '');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationListDTO | null>(null);

  // Fetch danh sách Job cho Dropdown
  const { data: jobsPagination, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs-for-filter'],
    queryFn: () => jobService.getJobs({ limit: 100, status: 'ACTIVE' })
  });

  // Lấy danh sách ứng viên (tất cả hoặc theo job)
  const { data: applicationsPagination, isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications', selectedJobId, keyword, status, page],
    queryFn: () => jobService.getApplications({ 
      jobId: selectedJobId || undefined, 
      page, 
      limit: 10, 
      status: status || undefined,
      keyword: keyword.trim() || undefined,
    })
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-slate-800">Danh sách ứng viên</h1>
      </header>

      <FilterBar 
        jobs={jobsPagination?.data || []}
        selectedJobId={selectedJobId}
        onJobChange={(newJobId) => {
          setSelectedJobId(newJobId);
          setSearchParams(previous => {
            const next = new URLSearchParams(previous);
            if (newJobId) next.set('jobId', newJobId);
            else next.delete('jobId');
            return next;
          }, { replace: true });
          setPage(1);
        }}
        keyword={keyword}
        onKeywordChange={(newKeyword) => {
          setKeyword(newKeyword);
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
        onView={setSelectedApplication}
      />

      {selectedApplication && <CandidateDrawer key={selectedApplication.applicationId} application={selectedApplication} onClose={() => setSelectedApplication(null)} />}
    </div>
  );
};

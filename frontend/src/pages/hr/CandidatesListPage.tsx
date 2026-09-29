import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/job.service';
import { CandidatesTable } from '@/components/candidates/CandidatesTable';
import { FilterBar } from '@/components/candidates/FilterBar';
import { CandidateDrawer, type CandidateData } from '@/components/CandidateDrawer';
import type { ApplicationListDTO } from '@/types/application.types';

export const CandidatesListPage: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

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

  const handleSelectCandidate = (app: ApplicationListDTO) => {
    const candidateData: CandidateData = {
      id: String(app.applicationId),
      name: app.fullName,
      email: app.email,
      phone: app.phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.fullName}`,
      jobTitle: app.jobTitle,
      matchScore: 85,
      status: app.applicationStatus,
      currentRound: 1,
      totalRounds: 4,
      submittedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : '',
    };
    setSelectedCandidate(candidateData);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Danh sách Ứng viên</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Quản lý tất cả hồ sơ ứng tuyển
          </p>
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
          setPage(1);
        }}
        isLoadingJobs={isLoadingJobs}
      />

      <CandidatesTable 
        pagination={applicationsPagination}
        isLoading={isLoadingApps}
        onPageChange={setPage}
        onSelectCandidate={handleSelectCandidate}
      />

      <CandidateDrawer
        isOpen={drawerOpen}
        candidate={selectedCandidate}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};


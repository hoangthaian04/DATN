import React from 'react';
import type { JobSummary } from '../../types/job.types';

interface Props {
  jobs: JobSummary[];
  selectedJobId: string;
  onJobChange: (jobId: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  isLoadingJobs: boolean;
}

export const FilterBar: React.FC<Props> = ({ jobs, selectedJobId, onJobChange, status, onStatusChange, isLoadingJobs }) => {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center rounded-2xl">
      
      {/* Search Input */}
      <div className="w-full md:w-64 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Tìm kiếm theo tên, email, SĐT, kỹ năng..." 
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Vị trí ứng tuyển */}
      <div className="w-full md:w-56 relative">
        <select 
          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
          value={selectedJobId}
          onChange={(e) => onJobChange(e.target.value)}
          disabled={isLoadingJobs}
        >
          <option value="">Vị trí ứng tuyển: Tất cả</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Trạng thái */}
      <div className="w-full md:w-48 relative">
        <select 
          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Trạng thái: Tất cả</option>
          <option value="NEW">Mới</option>
          <option value="IN_PROGRESS">Đang xử lý</option>
          <option value="PASSED">Đã đậu</option>
          <option value="REJECTED">Từ chối</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Kinh nghiệm (Mock) */}
      <div className="w-full md:w-48 relative">
        <select 
          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
        >
          <option value="">Kinh nghiệm: Tất cả</option>
          <option value="Fresher">Fresher</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>



    </div>
  );
};

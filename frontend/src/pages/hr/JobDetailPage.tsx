import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Edit3, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { EditJobModal } from '../../components/modals/EditJobModal';
// import { PublishJobModal } from '../../components/modals/PublishJobModal'; // Uncomment if we implement it

import { jobService } from '../../services/job.service';
import type { SaveJobPipelineRequest } from '../../types/job.types';
import { hiringRoundService } from '../../services/hiring-round.service';

const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (!line.trim()) return <div key={idx} className="h-1"></div>;
    
    if (line.startsWith('### ')) {
      return <h3 key={idx} className="text-base font-bold text-slate-800 mt-3 mb-2">{line.replace('### ', '')}</h3>;
    }
    
    if (line.startsWith('- ')) {
      return (
        <div key={idx} className="flex items-start gap-2 ml-2 mb-1.5 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
          <div className="text-slate-600" dangerouslySetInnerHTML={{ __html: line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      );
    }
    
    return (
      <div key={idx} className="text-sm text-slate-600 mb-1.5" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    );
  });
};

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [editModalOpen, setEditModalOpen] = useState(() => {
    return new URLSearchParams(location.search).get('edit') === 'true';
  });

  // Lấy chi tiết Job
  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id!),
    enabled: !!id,
    retry: false
  });
  const { data: rounds = [] } = useQuery({
    queryKey: ['hiring-rounds', id],
    queryFn: () => hiringRoundService.getRounds(id!),
    enabled: Boolean(id),
  });

  React.useEffect(() => {
    if (new URLSearchParams(location.search).get('edit') === 'true') {
      setEditModalOpen(true);
      // Remove query param without triggering navigation reload
      navigate(`/dashboard/jobs/${id}`, { replace: true });
    }
  }, [location.search, navigate, id]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: SaveJobPipelineRequest) => jobService.saveJobPipeline(id!, data),
    onSuccess: () => {
      toast.success('Cập nhật tin tuyển dụng thành công');
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['hiring-rounds', id] });
      setEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tin tuyển dụng');
    }
  });

  const handleSaveJob = (updatedData: SaveJobPipelineRequest) => {
    updateMutation.mutate(updatedData);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex-1 p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium mb-4">{(error as any)?.response?.data?.message || 'Không tìm thấy thông tin tin tuyển dụng'}</p>
        <button onClick={() => navigate('/dashboard/jobs')} className="px-4 py-2 bg-slate-200 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-300">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)] space-y-6 relative overflow-hidden">
      
      {/* Header section with Breadcrumbs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate('/dashboard/jobs')}>Jobs</span>
            <span className="text-[10px]">&gt;</span>
            <span className="text-slate-500">Chi tiết</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{job.title}</h1>
            {job.status === 'INACTIVE' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                Bản nháp
              </span>
            ) : job.status === 'ACTIVE' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-50 text-primary-500 border border-primary-100 uppercase tracking-wider">
                Đang mở
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-500 border border-red-100 uppercase tracking-wider">
                Đã đóng
              </span>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setEditModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-800 transition-all shadow-sm cursor-pointer select-none"
        >
          <Edit3 className="h-4 w-4" />
          <span>{job.status === 'CLOSED' ? 'Xem chi tiết' : 'Chỉnh sửa'}</span>
        </button>
      </div>

      {/* Details layout: Left Column (2/3) + Right Column (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Quick Info Bar + Description (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 premium-card bg-white p-6 select-none">
            {/* Salary */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mức lương</span>
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-primary-500" />
                {job.salaryMin ? job.salaryMin.toLocaleString() : 0} - {job.salaryMax ? job.salaryMax.toLocaleString() : 0} {job.salaryCurrency || 'VND'}
              </span>
            </div>

            {/* Location */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Địa điểm</span>
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary-500" />
                {job.location || 'Chưa cập nhật'}
              </span>
            </div>

            {/* Work mode */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hình thức</span>
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-primary-500" />
                {job.workingType === 'ONSITE' ? 'Tại văn phòng' : job.workingType === 'HYBRID' ? 'Linh hoạt' : job.workingType === 'REMOTE' ? 'Từ xa' : job.jobType}
              </span>
            </div>

            {/* Experience */}
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kinh nghiệm</span>
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-primary-500" />
                {job.experienceYearsMin ? `${job.experienceYearsMin} năm` : 'Không yêu cầu'}
              </span>
            </div>
          </div>

          {/* Job Description */}
          {(job.description || job.requirements || job.benefits) ? (
            <div className="premium-card bg-white p-8 space-y-8 text-left">
              {job.description && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 select-none">
                    Mô tả công việc
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 leading-relaxed select-text">
                    {renderMarkdown(job.description)}
                  </div>
                </div>
              )}

              {job.requirements && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 select-none">
                    Yêu cầu ứng viên
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 leading-relaxed select-text">
                    {renderMarkdown(job.requirements)}
                  </div>
                </div>
              )}

              {job.benefits && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 select-none">
                    Quyền lợi
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 leading-relaxed select-text">
                    {renderMarkdown(job.benefits)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="premium-card bg-white p-8 text-center text-sm font-medium text-slate-500">
              Chưa có nội dung mô tả chi tiết.
            </div>
          )}
        </div>

        {/* Right Column: Widgets (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Widget 1: Publish Now */}
          {(job.status === 'INACTIVE' || job.status === 'ACTIVE') && (
            <div className={`premium-card p-6 space-y-4 text-left ${job.status === 'INACTIVE' ? 'bg-primary-500/5 border border-primary-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
              <div className="space-y-1.5 select-none">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {job.status === 'INACTIVE' ? 'Đăng tuyển ngay' : 'Ngừng tuyển ngay'}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                  {job.status === 'INACTIVE' 
                    ? <span dangerouslySetInnerHTML={{ __html: 'Tin tuyển dụng hiện ở trạng thái <strong>Bản nháp</strong>. Xuất bản để thu hút hồ sơ ứng viên ngay lập tức.' }} />
                    : <span dangerouslySetInnerHTML={{ __html: 'Tin tuyển dụng đang được <strong>Công khai</strong>. Ngừng tuyển để ẩn tin tuyển dụng khỏi trang Career Site.' }} />
                  }
                </p>
              </div>

              <button
                onClick={() => {
                  if (job.status === 'INACTIVE') {
                    // Mở publish modal (hiện chưa implement, chỉ là nút placeholder)
                    toast('Chức năng xuất bản sẽ sớm ra mắt', { icon: '🚧' });
                  }
                }}
                className={`w-full py-3 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer select-none flex items-center justify-center gap-1.5 ${job.status === 'INACTIVE' ? 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/15' : 'bg-red-500 hover:bg-red-600 shadow-red-500/15'}`}
              >
                <span>{job.status === 'INACTIVE' ? 'Đăng Tuyển' : 'Ngừng tuyển'}</span>
              </button>
            </div>
          )}

          {/* Widget 2: Interview Rounds */}
          <div className="premium-card bg-white p-6 space-y-4 text-left">
            <div className="flex justify-between items-start select-none">
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Vòng phỏng vấn</h3>
                <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">{rounds.length ? `${rounds.length} vòng đã cấu hình. Chọn một vòng để xem chi tiết.` : 'Chưa có vòng tuyển dụng nào.'}</p>
              </div>
            </div>

            <div className="space-y-2">
              {rounds.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-[11px] font-medium text-slate-400">Chưa có vòng nào</p> : rounds.map((round, index) => <button key={round.id} onClick={() => navigate(`/dashboard/jobs/${id}/rounds?round=${round.id}`)} className="flex w-full items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/40"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600">{index + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">{round.name}</span><ChevronRight className="h-4 w-4 shrink-0 text-slate-400" /></button>)}
            </div>
          </div>

          {/* Widget 3: Applicants */}
          <div className="premium-card bg-white p-6 space-y-4 text-left">
            <div className="flex justify-between items-start select-none">
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Ứng viên nộp hồ sơ</h3>
                <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: `Có <strong>${job.applicantCount || 0} ứng viên</strong> nộp hồ sơ ứng tuyển vị trí này.` }} />
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/applications/kanban')}
              className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1.5"
            >
              <span>Xem danh sách</span>
            </button>
          </div>
        </div>

      </div>

      {/* Edit Job Modal */}
      <EditJobModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        jobData={job}
        onSave={handleSaveJob}
        isPending={updateMutation.isPending}
      />
    </div>
  );
};

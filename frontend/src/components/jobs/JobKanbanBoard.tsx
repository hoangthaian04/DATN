import React, { useState } from 'react';
import { Mail, Phone, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { hiringRoundService } from '../../services/hiring-round.service';
import { jobService } from '../../services/job.service';
import { CandidateDrawer, type CandidateData } from '../CandidateDrawer';
import type { ApplicationListDTO } from '../../types/application.types';

interface JobKanbanBoardProps {
  jobId?: string;
}

export const JobKanbanBoard: React.FC<JobKanbanBoardProps> = ({ jobId }) => {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    candidateId: number | null;
    candidateName?: string;
    candidateEmail?: string;
    nextRoundName?: string;
  }>({
    isOpen: false,
    candidateId: null,
  });

  // Fetch hiring rounds for this job
  const { data: rounds = [], isLoading: isLoadingRounds } = useQuery({
    queryKey: ['hiring-rounds', jobId],
    queryFn: () => hiringRoundService.getRounds(jobId!),
    enabled: Boolean(jobId),
  });

  // Fetch applications for this job
  const { data: applicationsPagination, isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: () => jobService.getApplications({ jobId, limit: 100 }),
    enabled: Boolean(jobId),
  });

  const candidates = applicationsPagination?.data || [];

  // Mutation for moving candidate to next round
  const moveRoundMutation = useMutation({
    mutationFn: ({ applicationId, targetRoundId }: { applicationId: number; targetRoundId: number }) =>
      jobService.updateApplicationRound(applicationId, { targetRoundId }),
    onSuccess: () => {
      toast.success('Chuyển ứng viên và gửi Email thông báo kết quả thành công!');
      queryClient.invalidateQueries({ queryKey: ['applications', jobId] });
      setConfirmModal({ isOpen: false, candidateId: null });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi chuyển vòng');
      setConfirmModal({ isOpen: false, candidateId: null });
    },
  });

  const handleSelectCandidate = (candidate: ApplicationListDTO) => {
    const candidateData: CandidateData = {
      id: String(candidate.applicationId),
      name: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.fullName}`,
      jobTitle: candidate.jobTitle,
      matchScore: 85,
      status: candidate.applicationStatus,
      currentRound: 1,
      totalRounds: rounds.length || 4,
      submittedAt: candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString('vi-VN') : '',
    };
    setSelectedCandidate(candidateData);
    setDrawerOpen(true);
  };

  const handleOpenConfirmModal = (candidate: ApplicationListDTO) => {
    if (!rounds.length) return;
    let currentRoundIndex = rounds.findIndex((r) => r.id === candidate.currentRoundId);
    if (currentRoundIndex === -1) {
      currentRoundIndex = 0;
    }

    const nextRound = rounds[currentRoundIndex + 1];
    if (!nextRound) return;

    setConfirmModal({
      isOpen: true,
      candidateId: candidate.applicationId,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      nextRoundName: nextRound.name,
    });
  };

  const handleMoveRound = (candidateId: number) => {
    const candidate = candidates.find((c) => c.applicationId === candidateId);
    if (!candidate || !rounds.length) return;

    let currentRoundIndex = rounds.findIndex((r) => r.id === candidate.currentRoundId);
    if (currentRoundIndex === -1) {
      currentRoundIndex = 0;
    }

    const nextRound = rounds[currentRoundIndex + 1];
    if (nextRound) {
      moveRoundMutation.mutate({ applicationId: candidate.applicationId, targetRoundId: nextRound.id });
    }
  };

  if (isLoadingRounds || isLoadingApps) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-medium text-sm">Chưa có quy trình/vòng tuyển dụng nào được cấu hình cho công việc này.</p>
      </div>
    );
  }

  // Sort rounds by orderIndex
  const sortedRounds = [...rounds].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
        {sortedRounds.map((round, index) => {
          const roundCandidates = candidates.filter((c) => {
            if (c.currentRoundId) {
              return c.currentRoundId === round.id;
            }
            return index === 0;
          });

          const isLastRound = index === sortedRounds.length - 1;

          return (
            <div
              key={round.id}
              className="flex-shrink-0 w-80 bg-slate-100/50 rounded-2xl flex flex-col max-h-[800px] border border-slate-200"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200/60 flex items-center justify-between bg-slate-100 rounded-t-2xl">
                <h3 className="font-extrabold text-slate-700 text-sm">{round.name}</h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-200">
                  {roundCandidates.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="p-3 overflow-y-auto space-y-3 custom-scrollbar">
                {roundCandidates.map((candidate) => (
                  <div
                    key={candidate.applicationId}
                    onClick={() => handleSelectCandidate(candidate)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-primary-600 transition-colors">{candidate.fullName}</h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        ID: #{candidate.applicationId}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="h-3 w-3" />
                        <span>{candidate.phone || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Nộp:{' '}
                          {candidate.appliedAt
                            ? new Date(candidate.appliedAt).toLocaleDateString('vi-VN')
                            : 'Mới ứng tuyển'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenConfirmModal(candidate)}
                        disabled={isLastRound || moveRoundMutation.isPending}
                        className={`w-full py-2 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          isLastRound
                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                            : 'bg-primary-500 border border-primary-600 text-white hover:bg-primary-600 hover:shadow-md shadow-primary-500/20'
                        }`}
                      >
                        <span>Chuyển tiếp</span>
                        {!isLastRound && <ArrowRight className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}

                {roundCandidates.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-400">Trống</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-extrabold text-slate-800">Xác nhận chuyển tiếp & Gửi Email</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn chuyển ứng viên <strong className="text-slate-800">{confirmModal.candidateName}</strong> sang vòng <strong className="text-primary-600">{confirmModal.nextRoundName}</strong> không?
              </p>
              <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-700">
                <Mail className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                <span>
                  Hệ thống sẽ <strong>tự động gửi Email thông báo kết quả vượt qua vòng</strong> tới ứng viên tại <strong>{confirmModal.candidateEmail}</strong> ngay sau khi xác nhận.
                </span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, candidateId: null })}
                disabled={moveRoundMutation.isPending}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => confirmModal.candidateId && handleMoveRound(confirmModal.candidateId)}
                disabled={moveRoundMutation.isPending}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-all flex items-center gap-2"
              >
                {moveRoundMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xác nhận & Gửi Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CandidateDrawer */}
      <CandidateDrawer
        isOpen={drawerOpen}
        candidate={selectedCandidate}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};


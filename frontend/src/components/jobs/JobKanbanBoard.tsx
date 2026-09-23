import React, { useState } from 'react';
import { Mail, Phone, Calendar, ArrowRight } from 'lucide-react';

interface Round {
  id: number;
  name: string;
  order: number;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  roundId: number;
}

export const JobKanbanBoard: React.FC = () => {
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; candidateId: number | null }>({ isOpen: false, candidateId: null });
  // Mock data for rounds
  const mockRounds: Round[] = [
    { id: 1, name: 'Duyệt CV', order: 1 },
    { id: 2, name: 'Phỏng vấn chuyên môn', order: 2 },
    { id: 3, name: 'Phỏng vấn Văn hóa (Culture Fit)', order: 3 },
    { id: 4, name: 'Gửi Offer', order: 4 },
  ];

  // Mock data for candidates
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 1, name: 'Lê Văn A', email: 'levana@gmail.com', phone: '0901234567', appliedDate: '2026-09-20', roundId: 1 },
    { id: 2, name: 'Nguyễn Thị B', email: 'nguyenthib@gmail.com', phone: '0912345678', appliedDate: '2026-09-21', roundId: 1 },
    { id: 3, name: 'Trần Văn C', email: 'tranvanc@gmail.com', phone: '0923456789', appliedDate: '2026-09-18', roundId: 2 },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '0934567890', appliedDate: '2026-09-19', roundId: 2 },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', phone: '0945678901', appliedDate: '2026-09-15', roundId: 3 },
  ]);

  const handleMoveRound = (candidateId: number) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        
        const currentRound = mockRounds.find(r => r.id === c.roundId);
        if (!currentRound) return c;
        
        let targetRoundId = c.roundId;
        const nextRound = mockRounds.find(r => r.order === currentRound.order + 1);
        if (nextRound) targetRoundId = nextRound.id;
        
        return { ...c, roundId: targetRoundId };
      })
    );
    setConfirmModal({ isOpen: false, candidateId: null });
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
      {mockRounds.map((round) => {
        const roundCandidates = candidates.filter((c) => c.roundId === round.id);
        const isLastRound = round.order === mockRounds.length;

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
                <div key={candidate.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{candidate.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      ID: #{candidate.id}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="h-3 w-3" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>Nộp: {candidate.appliedDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100">
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, candidateId: candidate.id })}
                      disabled={isLastRound}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận chuyển tiếp</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn chuyển ứng viên này sang vòng tuyển dụng tiếp theo không?
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, candidateId: null })}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => confirmModal.candidateId && handleMoveRound(confirmModal.candidateId)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-all"
              >
                Đồng ý chuyển
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

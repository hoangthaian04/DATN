import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  List,
  LayoutGrid,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CandidateDrawer, type CandidateData } from '../../components/CandidateDrawer';
import { InterviewSchedulerModal } from '../../components/modals/InterviewSchedulerModal';
import { AISuggestionsModal } from '../../components/modals/AISuggestionsModal';
import { RejectionReasonModal } from '../../components/modals/RejectionReasonModal';
import { AIShadowMatchingModal } from '../../components/modals/AIShadowMatchingModal';
import { AIEmailPreviewModal } from '../../components/modals/AIEmailPreviewModal';
import { Sparkles } from 'lucide-react';

const MOCK_CANDIDATES: CandidateData[] = [
  {
    id: 'c1',
    name: 'Lê Hoàng Phúc',
    email: 'phuc.le@gmail.com',
    phone: '0901 234 567',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Senior AI Engineer',
    matchScore: 87,
    status: 'NEW',
    currentRound: 0,
    totalRounds: 3,
    submittedAt: '2026-08-01',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PENDING' },
    ],
  },
  {
    id: 'c2',
    name: 'Phạm Thu Hà',
    email: 'ha.pham@outlook.com',
    phone: '0912 345 678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Senior AI Engineer',
    matchScore: 92,
    status: 'NEW',
    currentRound: 0,
    totalRounds: 3,
    submittedAt: '2026-08-02',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PENDING' },
    ],
  },
  {
    id: 'c3',
    name: 'Hồ Quốc Việt',
    email: 'viet.ho@company.vn',
    phone: '0933 456 789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Product Designer',
    matchScore: 73,
    status: 'NEW',
    currentRound: 0,
    totalRounds: 3,
    submittedAt: '2026-08-02',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PENDING' },
    ],
  },
  {
    id: 'c4',
    name: 'Vũ Đức Bảo',
    email: 'bao.vu@techcorp.vn',
    phone: '0908 567 890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Product Designer',
    matchScore: 78,
    status: 'IN_PROGRESS',
    currentRound: 1,
    totalRounds: 4,
    submittedAt: '2026-07-30',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PASSED', date: '2026-07-31' },
      { roundIndex: 1, roundName: 'Online Test', result: 'PENDING' },
    ],
  },
  {
    id: 'c5',
    name: 'Đặng Khánh Linh',
    email: 'linh.dang@dev.io',
    phone: '0945 678 901',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Backend Developer (Java)',
    matchScore: 84,
    status: 'IN_PROGRESS',
    currentRound: 2,
    totalRounds: 3,
    submittedAt: '2026-07-28',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PASSED', date: '2026-07-29' },
      { roundIndex: 1, roundName: 'Coding Test', result: 'PASSED', date: '2026-07-31' },
      { roundIndex: 2, roundName: 'Phỏng vấn kỹ thuật', result: 'PENDING' },
    ],
  },
  {
    id: 'c6',
    name: 'Trịnh Như Quỳnh',
    email: 'quynh.trinh@hire.vn',
    phone: '0971 234 567',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Backend Developer (Java)',
    matchScore: 80,
    status: 'IN_PROGRESS',
    currentRound: 1,
    totalRounds: 3,
    submittedAt: '2026-07-28',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PASSED', date: '2026-07-29' },
      { roundIndex: 1, roundName: 'Coding Test', result: 'PENDING' },
    ],
  },
  {
    id: 'c7',
    name: 'Nguyễn Anh Khoa',
    email: 'khoa.nguyen@talent.io',
    phone: '0988 111 222',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Senior AI Engineer',
    matchScore: 91,
    status: 'PASSED',
    currentRound: 3,
    totalRounds: 3,
    submittedAt: '2026-07-20',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PASSED', date: '2026-07-21' },
      { roundIndex: 1, roundName: 'Online Test', result: 'PASSED', date: '2026-07-24' },
      { roundIndex: 2, roundName: 'Phỏng vấn & Offer', result: 'PASSED', date: '2026-07-28' },
    ],
  },
  {
    id: 'c8',
    name: 'Bùi Minh Tâm',
    email: 'tam.bui@work.vn',
    phone: '0966 333 444',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120',
    jobTitle: 'Product Designer',
    matchScore: 58,
    status: 'REJECTED',
    currentRound: 1,
    totalRounds: 3,
    submittedAt: '2026-07-25',
    roundHistory: [
      { roundIndex: 0, roundName: 'CV Screening', result: 'PASSED', date: '2026-07-26' },
      { roundIndex: 1, roundName: 'Design Challenge', result: 'FAILED', date: '2026-07-30' },
    ],
  },
];

const COLUMN_CONFIG = [
  {
    key: 'NEW' as const,
    label: 'Mới',
    colorClasses: 'bg-blue-50 text-blue-600 border-blue-100',
    dotColor: 'bg-blue-500',
    headerBg: 'bg-blue-50/50 border-blue-100',
  },
  {
    key: 'IN_PROGRESS' as const,
    label: 'Đang xử lý',
    colorClasses: 'bg-amber-50 text-amber-600 border-amber-100',
    dotColor: 'bg-amber-500',
    headerBg: 'bg-amber-50/50 border-amber-100',
  },
  {
    key: 'PASSED' as const,
    label: 'Đạt',
    colorClasses: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50/50 border-emerald-100',
  },
  {
    key: 'REJECTED' as const,
    label: 'Không đạt',
    colorClasses: 'bg-red-50 text-red-500 border-red-100',
    dotColor: 'bg-red-500',
    headerBg: 'bg-red-50/50 border-red-100',
  },
];

export const KanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterJob, setFilterJob] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [candidates, setCandidates] = useState<CandidateData[]>(MOCK_CANDIDATES);

  // Drawer states
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modal states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [shadowMatchModalOpen, setShadowMatchModalOpen] = useState(false);
  const [emailPreviewModalOpen, setEmailPreviewModalOpen] = useState(false);
  
  // Shadow Matching Flow state
  const [candidateToReject, setCandidateToReject] = useState<CandidateData | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const openDrawer = (candidate: CandidateData) => {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedCandidate(null), 300);
  };

  const handlePass = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'PASSED' } : c))
    );
    closeDrawer();
  };

  const handleInitiateFail = (id: string) => {
    const cand = candidates.find(c => c.id === id);
    if (cand) {
      setCandidateToReject(cand);
      setRejectModalOpen(true);
    }
  };

  const handleConfirmReject = (_reason: string) => {
    if (candidateToReject) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateToReject.id ? { ...c, status: 'REJECTED' } : c))
      );
      setRejectModalOpen(false);
      closeDrawer();
      // Wait a moment then open shadow matching
      setTimeout(() => {
        setShadowMatchModalOpen(true);
      }, 500);
    }
  };

  const handleFail = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'REJECTED' } : c))
    );
    closeDrawer();
  };

  const uniqueJobs = Array.from(new Set(candidates.map((c) => c.jobTitle)));

  const filtered = candidates.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchJob = filterJob === 'all' || c.jobTitle === filterJob;
    return matchSearch && matchJob;
  });

  const getCandidatesByStatus = (status: CandidateData['status']) =>
    filtered.filter((c) => c.status === status);

  const renderCard = (c: CandidateData) => {
    const isHighMatch = c.matchScore >= 85;
    return (
      <div
        key={c.id}
        onClick={() => openDrawer(c)}
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img
              src={c.avatar}
              alt={c.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-800 leading-snug truncate">{c.name}</p>
              <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[130px]">{c.jobTitle}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${
              isHighMatch
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-primary-50 text-primary-600 border-primary-100'
            }`}
          >
            <span className={`h-1 w-1 rounded-full ${isHighMatch ? 'bg-emerald-500' : 'bg-primary-500'}`} />
            {c.matchScore}%
          </span>
        </div>

        {/* Email & Phone */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-slate-400 truncate">{c.email}</p>
          <p className="text-[10px] font-semibold text-slate-400">{c.phone}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          {/* Round progress */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: c.totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-4 rounded-full transition-colors ${
                  i < c.currentRound ? 'bg-primary-500' : 'bg-slate-200'
                }`}
              />
            ))}
            <span className="text-[9px] font-bold text-slate-400 ml-1">
              V{c.currentRound}/{c.totalRounds}
            </span>
          </div>
          <span className="text-[9px] font-semibold text-slate-300">{c.submittedAt}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 p-8 bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
        {/* Page Header */}
        <div className="space-y-1 select-none text-left mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>Dashboard</span>
            <span className="text-[10px]">&gt;</span>
            <span>Ứng viên</span>
            <span className="text-[10px]">&gt;</span>
            <span className="text-slate-500">Kanban</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kanban Pipeline</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {filtered.length} ứng viên trong {COLUMN_CONFIG.length} giai đoạn
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm select-none">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-bold">
                <LayoutGrid className="h-3.5 w-3.5" />
                Kanban
              </button>
              <button
                onClick={() => navigate('/dashboard/applications/list')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <List className="h-3.5 w-3.5" />
                Danh sách
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 select-none">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm ứng viên, email, vị trí..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-medium transition-colors"
            />
          </div>

          {/* Job Filter */}
          <div className="relative">
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <option value="all">Tất cả vị trí</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold shadow-sm shadow-primary-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Kanban Board - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {COLUMN_CONFIG.map((col) => {
            const colCandidates = getCandidatesByStatus(col.key);
            return (
              <div key={col.key} className="space-y-3">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <span className={`text-xs font-bold ${col.colorClasses.split(' ')[1]}`}>
                      {col.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {col.key === 'REJECTED' && colCandidates.length > 0 && (
                      <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 text-[10px] font-bold transition-colors">
                        <Sparkles className="h-3 w-3" />
                        Tái chế
                      </button>
                    )}
                    <span className="text-xs font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {colCandidates.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[120px]">
                  {colCandidates.length === 0 ? (
                    <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs font-semibold text-slate-300">Không có ứng viên</p>
                    </div>
                  ) : (
                    colCandidates.map((c) => renderCard(c))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CandidateDrawer */}
      <CandidateDrawer
        isOpen={drawerOpen}
        candidate={selectedCandidate}
        onClose={closeDrawer}
        onPass={handlePass}
        onFail={handleFail}
        onInitiateFail={handleInitiateFail}
        onSchedule={() => {
          setDrawerOpen(false);
          setScheduleModalOpen(true);
        }}
        onAISuggest={() => {
          setDrawerOpen(false);
          setAiModalOpen(true);
        }}
      />

      {/* InterviewSchedulerModal */}
      <InterviewSchedulerModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        candidateName={selectedCandidate?.name}
        onSubmit={() => setScheduleModalOpen(false)}
      />

      {/* AISuggestionsModal */}
      <AISuggestionsModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        candidateName={selectedCandidate?.name}
        matchScore={selectedCandidate?.matchScore}
      />

      {/* AI Shadow Matching Feature Modals */}
      <RejectionReasonModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        candidateName={candidateToReject?.name}
        onConfirm={handleConfirmReject}
      />

      <AIShadowMatchingModal
        isOpen={shadowMatchModalOpen}
        onClose={() => setShadowMatchModalOpen(false)}
        candidateName={candidateToReject?.name}
        onSnooze={() => setShadowMatchModalOpen(false)}
        onSendEmail={() => {
          setShadowMatchModalOpen(false);
          setEmailPreviewModalOpen(true);
        }}
      />

      <AIEmailPreviewModal
        isOpen={emailPreviewModalOpen}
        onClose={() => setEmailPreviewModalOpen(false)}
        candidateName={candidateToReject?.name}
        candidateEmail={candidateToReject?.email}
        onSend={() => setEmailPreviewModalOpen(false)}
      />
    </>
  );
};


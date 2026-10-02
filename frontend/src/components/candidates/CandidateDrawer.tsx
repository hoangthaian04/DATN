import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, Loader2, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { aiService } from '@/services/ai.service';
import type { CvAnalysisResult } from '@/types/ai.types';
import type { ApplicationListDTO } from '@/types/application.types';
import { CvPreviewModal } from './CvPreviewModal';

interface Props {
  application: ApplicationListDTO;
  onClose: () => void;
}

export const CandidateDrawer: React.FC<Props> = ({ application, onClose }) => {
  const [analysisOverride, setAnalysisOverride] = useState<CvAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCvPreviewOpen, setIsCvPreviewOpen] = useState(false);
  const canAnalyzeCv = application.requiresCv === true && application.hasCv === true;
  const { data: persistedAnalysis, isLoading: isLoadingPersisted } = useQuery({
    queryKey: ['cv-analysis', application.applicationId],
    queryFn: () => aiService.getLatestCvAnalysis(application.applicationId),
    staleTime: 30_000,
    enabled: canAnalyzeCv,
  });
  const analysis = analysisOverride ?? persistedAnalysis ?? null;

  const analyzeMutation = useMutation({
    mutationFn: () => aiService.analyzeCv(application.applicationId, { rerun: Boolean(analysis) }),
    onSuccess: result => {
      setAnalysisOverride(result);
      setErrorMessage('');
      toast.success('Đã phân tích CV thành công');
    },
    onError: error => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMessage(message || 'AI chưa thể phân tích CV. Bạn có thể thử lại hoặc chấm thủ công.');
    },
  });

  const requestAnalysis = () => {
    if (analysis && !window.confirm('Chạy lại AI sẽ tạo một bản phân tích mới và có thể phát sinh thêm lượt gọi provider. Tiếp tục?')) {
      return;
    }
    analyzeMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="candidate-drawer-title">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 id="candidate-drawer-title" className="text-2xl font-black text-slate-800">{application.fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">{application.jobTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng chi tiết ứng viên">
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="space-y-2 border-b border-slate-100 py-5 text-sm">
          <p><span className="font-bold text-slate-700">Email:</span> <span className="text-slate-500">{application.email}</span></p>
          <p><span className="font-bold text-slate-700">Số điện thoại:</span> <span className="text-slate-500">{application.phone || 'Chưa cập nhật'}</span></p>
          <p><span className="font-bold text-slate-700">Trạng thái:</span> <span className="text-slate-500">{application.applicationStatus}</span></p>
        </section>

        <section className="border-b border-slate-100 py-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800">Hồ sơ CV</h3>
              {application.hasCv !== true && <span className="mt-1 inline-block text-sm font-medium text-slate-500">Chưa có CV</span>}
            </div>
            {application.hasCv === true && (
              <button
                type="button"
                onClick={() => setIsCvPreviewOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm hover:bg-slate-100"
              >
                <FileText className="h-4 w-4 text-primary-500" aria-hidden="true" />
                Xem CV PDF
              </button>
            )}
          </div>
        </section>

        {canAnalyzeCv && <section className="py-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-primary-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800">AI CV Insights</h3>
            </div>
            <button type="button" onClick={requestAnalysis} disabled={analyzeMutation.isPending || isLoadingPersisted} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">
              {analyzeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : analysis && <RefreshCw className="h-4 w-4" />}
              {analysis ? 'Chạy lại AI' : 'Chấm điểm AI'}
            </button>
          </div>

          {errorMessage && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</div>}

          {analysis && (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Matching Score</span>
                  <span className="text-3xl font-black text-primary-600">{analysis.matchingScore}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, Math.max(0, analysis.matchingScore))}%` }} /></div>
              </div>

              <InsightList title="Kỹ năng khớp JD" items={analysis.matchedSkills} tone="emerald" />
              <InsightList title="Kỹ năng còn thiếu" items={analysis.missingSkills} tone="amber" />
              <InsightList title="Điểm mạnh" items={analysis.strengths} tone="blue" />
              <InsightList title="Điểm yếu" items={analysis.weaknesses} tone="rose" />

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm font-extrabold text-slate-800">Nhận xét tổng quan</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{analysis.summary}</p>
              </div>
            </div>
          )}
        </section>}
      </aside>
      {isCvPreviewOpen && (
        <CvPreviewModal
          applicationId={application.applicationId}
          candidateName={application.fullName}
          onClose={() => setIsCvPreviewOpen(false)}
        />
      )}
    </div>
  );
};

const InsightList = ({ title, items, tone }: { title: string; items: string[]; tone: 'emerald' | 'amber' | 'blue' | 'rose' }) => {
  const styles = {
    emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50/40 text-amber-700',
    blue: 'border-blue-100 bg-blue-50/40 text-blue-700',
    rose: 'border-rose-100 bg-rose-50/40 text-rose-700',
  } as const;
  return <div className={`rounded-2xl border p-4 ${styles[tone]}`}><h3 className="text-sm font-extrabold">{title}</h3>{items.length > 0 ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">{items.map(item => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm opacity-75">Không có dữ liệu.</p>}</div>;
};

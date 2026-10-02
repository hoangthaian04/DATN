import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiMatchingService } from '@/services/ai-matching.service';
import { errorMessage } from '@/services/api';
import type { AiSuggestion } from '@/types/ai-matching.types';

interface Props {
  jobId: string;
  jobStatus: string;
}

const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa ghi nhận';

export const AiMatchTab: React.FC<Props> = ({ jobId, jobStatus }) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<AiSuggestion | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const runQuery = useQuery({
    queryKey: ['ai-matching-run', jobId],
    queryFn: () => aiMatchingService.latestRun(jobId),
    refetchInterval: query => ['QUEUED', 'PROCESSING'].includes(query.state.data?.status ?? '') ? 2000 : false,
  });
  const suggestionsQuery = useQuery({
    queryKey: ['ai-suggestions', jobId],
    queryFn: () => aiMatchingService.suggestions(jobId),
  });
  const templateQuery = useQuery({
    queryKey: ['ai-match-contact-template', jobId, selected?.suggestionId],
    queryFn: () => aiMatchingService.contactTemplate(jobId, selected!.suggestionId),
    enabled: Boolean(selected),
  });

  useEffect(() => {
    if (runQuery.data?.status === 'COMPLETED') {
      void queryClient.invalidateQueries({ queryKey: ['ai-suggestions', jobId] });
    }
  }, [jobId, queryClient, runQuery.data?.status, runQuery.data?.matchingJobId]);

  useEffect(() => {
    if (!templateQuery.data) return;
    setSubject(templateQuery.data.subject);
    setBody(templateQuery.data.body);
  }, [templateQuery.data]);

  const triggerMutation = useMutation({
    mutationFn: () => aiMatchingService.trigger(jobId, { forceRerun: true, minScore: 70, limit: 10 }),
    onSuccess: run => {
      queryClient.setQueryData(['ai-matching-run', jobId], run);
      toast.success('Đã bắt đầu AI Match.');
    },
    onError: error => toast.error(errorMessage(error)),
  });

  const contactMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error('Chưa chọn ứng viên');
      return aiMatchingService.contact(jobId, selected.suggestionId, { subject, body });
    },
    onSuccess: () => {
      toast.success('Đã gửi email mời ứng tuyển và cập nhật trạng thái liên hệ.');
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ['ai-suggestions', jobId] });
      void queryClient.invalidateQueries({ queryKey: ['email-logs'] });
    },
    onError: error => toast.error(errorMessage(error)),
  });

  const run = runQuery.data;
  const suggestions = suggestionsQuery.data ?? [];
  const isProcessing = run?.status === 'QUEUED' || run?.status === 'PROCESSING';
  const isBusy = isProcessing || triggerMutation.isPending;

  return (
    <section className="space-y-5" aria-labelledby="ai-match-heading">
      <header className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="ai-match-heading" className="text-lg font-extrabold text-slate-800">AI Match ứng viên</h2>
        </div>
        <button
          type="button"
          onClick={() => triggerMutation.mutate()}
          disabled={jobStatus !== 'ACTIVE' || isBusy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          title={jobStatus !== 'ACTIVE' ? 'Chỉ Job đang ACTIVE mới chạy được AI Match' : undefined}
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isBusy ? 'Đang xử lý' : 'Chạy lại AI Match'}
        </button>
      </header>

      {jobStatus !== 'ACTIVE' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="status">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Job chưa hoạt động; không thể chạy AI Match hoặc gửi lời mời.</p>
        </div>
      )}

      {runQuery.isLoading || suggestionsQuery.isLoading ? (
        <div className="flex min-h-52 items-center justify-center rounded-2xl border border-slate-100 bg-white text-sm font-medium text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tải gợi ý ứng viên...</div>
      ) : runQuery.isError || suggestionsQuery.isError ? (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-white p-6 text-center" role="alert">
          <AlertCircle className="h-8 w-8 text-rose-500" /><p className="text-sm text-rose-700">Không tải được dữ liệu AI Match. {errorMessage(runQuery.error ?? suggestionsQuery.error)}</p>
          <button type="button" onClick={() => { void runQuery.refetch(); void suggestionsQuery.refetch(); }} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">Thử tải lại</button>
        </div>
      ) : (
        <>
          {isProcessing && (
            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800" role="status">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Đang xử lý AI Match.</span>
            </div>
          )}

          {run?.status === 'FAILED' && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-bold">Lần chạy AI Match chưa hoàn tất.</p><p className="mt-1">{run.errorMessage || 'Kiểm tra cấu hình AI/provider rồi thử lại.'}</p></div>
            </div>
          )}

          {suggestions.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-base font-bold text-slate-700">{run?.status === 'COMPLETED' ? 'Chưa tìm thấy ứng viên đạt ngưỡng phù hợp' : 'Chưa có kết quả AI Match'}</h3>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-extrabold text-slate-800">Ứng viên gợi ý ({suggestions.length})</h3>
                {run?.status === 'COMPLETED' && <span className="text-xs font-medium text-slate-400">Cập nhật {formatDate(run.completedAt)}</span>}
              </div>
              <div className="divide-y divide-slate-100">
                {suggestions.map(suggestion => (
                  <article key={suggestion.suggestionId} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-800">{suggestion.candidateName}</h4>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">{suggestion.matchingScore.toFixed(1)}% phù hợp</span>
                        {suggestion.contactStatus === 'CONTACTED' && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"><CheckCircle2 className="h-3.5 w-3.5" />Đã liên hệ</span>}
                      </div>
                      <p className="break-all text-sm text-slate-500">{suggestion.email}</p>
                      <p className="text-xs text-slate-400">Ứng tuyển gần nhất: {formatDate(suggestion.recentApplicationAt)}</p>
                      {suggestion.matchedSkills.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">{suggestion.matchedSkills.map(skill => <span key={skill} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{skill}</span>)}</div>}
                      {suggestion.strengths.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">{suggestion.strengths.map(strength => <li key={strength}>{strength}</li>)}</ul>}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelected(suggestion); setSubject(''); setBody(''); }}
                      disabled={jobStatus !== 'ACTIVE' || suggestion.contactStatus === 'CONTACTED'}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 px-3.5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Mail className="h-4 w-4" />{suggestion.contactStatus === 'CONTACTED' ? 'Đã liên hệ' : 'Liên hệ'}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !contactMutation.isPending) setSelected(null); }}>
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="ai-match-contact-title">
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div><h3 id="ai-match-contact-title" className="text-lg font-extrabold text-slate-800">Mời ứng viên ứng tuyển</h3><p className="mt-1 break-all text-sm text-slate-500">Gửi tới {templateQuery.data?.recipientName || selected.candidateName} · {templateQuery.data?.recipientEmail || selected.email}</p></div>
              <button type="button" onClick={() => setSelected(null)} disabled={contactMutation.isPending} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50" aria-label="Đóng hộp thoại"><X className="h-5 w-5" /></button>
            </header>
            {templateQuery.isLoading ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải mẫu email...</div>
            ) : templateQuery.isError ? (
              <div className="space-y-3 p-5" role="alert"><p className="text-sm text-rose-700">Không tải được mẫu email. {errorMessage(templateQuery.error)}</p><button type="button" onClick={() => void templateQuery.refetch()} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">Thử lại</button></div>
            ) : (
              <form onSubmit={event => {
                event.preventDefault();
                const recipient = templateQuery.data?.recipientEmail || selected.email;
                if (window.confirm(`Gửi email mời ứng tuyển đến ${recipient}? Email sẽ được ghi vào Email Log.`)) {
                  contactMutation.mutate();
                }
              }} className="space-y-4 p-5">
                <label className="block text-sm font-bold text-slate-700">Tiêu đề<input value={subject} onChange={event => setSubject(event.target.value)} maxLength={255} required className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                <label className="block text-sm font-bold text-slate-700">Nội dung<textarea value={body} onChange={event => setBody(event.target.value)} maxLength={12000} required rows={9} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 font-normal leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                <footer className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setSelected(null)} disabled={contactMutation.isPending} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
                  <button type="submit" disabled={contactMutation.isPending || !subject.trim() || !body.trim()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{contactMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Gửi lời mời</button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
};

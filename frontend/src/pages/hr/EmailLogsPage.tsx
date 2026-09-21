import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2, Mail, RefreshCw, RotateCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { emailLogService } from '@/services/email-log.service';
import { errorMessage } from '@/services/api';
import type { EmailLog, EmailLogStatus } from '@/types/email-log.types';

const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa ghi nhận';

const previewDocument = (body: string) => `<!doctype html><html lang="vi"><head><meta charset="utf-8" /><style>body{margin:0;padding:24px;color:#334155;font:14px/1.6 Arial,sans-serif;overflow-wrap:anywhere} </style></head><body>${body.replace(/\n/g, '<br />')}</body></html>`;

export const EmailLogsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EmailLogStatus | ''>('');
  const [templateCode, setTemplateCode] = useState('');
  const [selected, setSelected] = useState<EmailLog | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['email-logs', page, status, templateCode],
    queryFn: () => emailLogService.list({ page, limit: 20, status: status || undefined, templateCode: templateCode.trim() || undefined }),
  });

  const retryMutation = useMutation({
    mutationFn: (id: number) => emailLogService.retry(id),
    onSuccess: () => {
      toast.success('Đã gửi lại email thành công.');
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ['email-logs'] });
    },
    onError: error => toast.error(errorMessage(error)),
  });

  const logs = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;

  const retry = (log: EmailLog) => {
    if (!window.confirm(`Gửi lại email “${log.subject}” đến ${log.recipientEmail}?`)) return;
    retryMutation.mutate(log.id);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400"><Mail className="h-4 w-4" /> Email Logs</div>
          <h1 className="mt-2 text-2xl font-black text-slate-800">Lịch sử email</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Theo dõi các email hệ thống đã gửi trong company của bạn.</p>
        </div>
        <button type="button" onClick={() => void refetch()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="flex-1 text-xs font-bold text-slate-600">
          Template code
          <input value={templateCode} onChange={event => { setTemplateCode(event.target.value); setPage(1); }} placeholder="APPLICATION_RECEIVED" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-500" />
        </label>
        <label className="text-xs font-bold text-slate-600 sm:w-44">
          Trạng thái
          <select value={status} onChange={event => { setStatus(event.target.value as EmailLogStatus | ''); setPage(1); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-500">
            <option value="">Tất cả</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tải lịch sử email...</div>
        ) : isError ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-sm text-red-500"><p>Không thể tải lịch sử email.</p><button type="button" onClick={() => void refetch()} className="rounded-lg border border-red-200 px-3 py-2 font-semibold hover:bg-red-50">Thử lại</button></div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-2 text-center text-sm text-slate-500"><Mail className="h-8 w-8 text-slate-300" /><p>Chưa có email log phù hợp.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4">Người nhận</th><th className="px-5 py-4">Tiêu đề</th><th className="px-5 py-4">Template</th><th className="px-5 py-4">Thời gian</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-700">{log.recipientEmail}</td>
                    <td className="max-w-[280px] px-5 py-4"><button type="button" onClick={() => setSelected(log)} className="flex max-w-full items-center gap-2 text-left font-semibold text-blue-700 hover:underline"><Eye className="h-4 w-4 shrink-0" /><span className="truncate">{log.subject}</span></button></td>
                    <td className="px-5 py-4"><code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{log.templateCode}</code></td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(log.sentAt || log.createdAt)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{log.status}</span>{log.errorMessage && <p className="mt-1 max-w-44 text-xs text-rose-500">{log.errorMessage}</p>}</td>
                    <td className="px-5 py-4 text-right">{log.status === 'FAILED' && <button type="button" disabled={retryMutation.isPending} onClick={() => retry(log)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw className="h-3.5 w-3.5" /> Gửi lại</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500">
          <span>Trang {data?.current_page ?? page} / {lastPage} · {data?.total ?? 0} bản ghi</span>
          <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Trước</button><button type="button" disabled={page >= lastPage} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Sau</button></div>
        </footer>
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="email-log-detail-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email log #{selected.id}</p><h2 id="email-log-detail-title" className="mt-1 text-lg font-bold text-slate-800">{selected.subject}</h2><p className="mt-1 text-xs text-slate-500">{selected.recipientEmail} · {formatDate(selected.sentAt || selected.createdAt)}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Đóng chi tiết email" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></header>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4 sm:p-6"><iframe title="Nội dung email đã gửi" sandbox="" srcDoc={previewDocument(selected.bodyHtml)} className="h-[min(65vh,620px)] w-full rounded-xl border border-slate-200 bg-white" /></div>
            <footer className="flex justify-between border-t border-slate-100 px-6 py-4"><span className="text-xs text-slate-500">Lần gửi: {selected.attemptCount}</span><div className="flex gap-2"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Đóng</button>{selected.status === 'FAILED' && <button type="button" disabled={retryMutation.isPending} onClick={() => retry(selected)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Gửi lại</button>}</div></footer>
          </section>
        </div>
      )}
    </div>
  );
};

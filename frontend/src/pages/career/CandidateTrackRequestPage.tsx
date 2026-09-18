import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { errorMessage } from '@/services/api';
import { careerService } from '@/services/career.service';

export const CandidateTrackRequestPage: React.FC = () => {
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const [email, setEmail] = useState('');
  const requestMutation = useMutation({ mutationFn: () => careerService.requestMagicLink(companySlug, email) });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) requestMutation.mutate();
  };

  return <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center py-12"><div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Mail className="h-7 w-7" /></div><h1 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-slate-900">Gửi lại Magic Link</h1><p className="mt-3 text-center text-sm leading-6 text-slate-500">Nhập email đã dùng để ứng tuyển. Vì lý do bảo mật, hệ thống luôn hiển thị cùng một thông báo.</p>{requestMutation.isSuccess ? <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center text-sm font-semibold leading-6 text-emerald-800"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" /><p className="mt-3">Nếu email của bạn đã ứng tuyển tại công ty, chúng tôi đã gửi liên kết tra cứu tới hộp thư của bạn.</p></div> : <form onSubmit={submit} className="mt-7 space-y-5"><label className="block space-y-2"><span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Email ứng tuyển</span><input type="email" required value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white" placeholder="candidate@example.com" /></label>{requestMutation.isError && <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{errorMessage(requestMutation.error)}</div>}<button type="submit" disabled={requestMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{requestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}{requestMutation.isPending ? 'Đang gửi...' : 'Yêu cầu gửi lại link'}</button></form>}<Link to="/careers" className="mt-6 block text-center text-xs font-bold text-blue-600 hover:underline">Quay lại Career Site</Link></div></section>;
};

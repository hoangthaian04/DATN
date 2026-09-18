import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { careerService } from '@/services/career.service';
import { errorMessage } from '@/services/api';

export const CandidateTrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token')?.trim() || '';
  const [email, setEmail] = useState('');

  const verifyMutation = useMutation({
    mutationFn: () => careerService.verifyMagicLink(token, email),
    onSuccess: () => {
      navigate(`/careers/applications/status?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email.trim())}`);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !email.trim()) return;
    verifyMutation.mutate();
  };

  if (!token) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center py-12">
        <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Liên kết tra cứu không hợp lệ</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Vui lòng sử dụng liên kết trong email xác nhận hồ sơ.</p>
          <Link to="/careers" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700">Về Career Site</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center py-12">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-slate-900">Xác thực để tra cứu hồ sơ</h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-500">Nhập đúng email bạn đã dùng khi nộp hồ sơ. Email là lớp xác thực bổ sung cho Magic Link.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Email ứng tuyển</span>
            <input type="email" required value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white" placeholder="candidate@example.com" />
          </label>
          {verifyMutation.isError && <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">{errorMessage(verifyMutation.error)}<p className="mt-2 font-normal">Nếu bạn không còn link hoặc link đã hết hạn, hãy yêu cầu gửi lại link mới.</p></div>}
          <button type="submit" disabled={verifyMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {verifyMutation.isPending ? 'Đang xác thực...' : 'Xem trạng thái hồ sơ'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">Mất hoặc hết hạn liên kết? <Link to="/careers" className="font-bold text-blue-600 hover:underline">Mở Career Site để yêu cầu gửi lại</Link></p>
      </div>
    </section>
  );
};

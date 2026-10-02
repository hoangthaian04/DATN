import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BrainCircuit, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { aiService } from '@/services/ai.service';
import type { JobDescriptionSuggestion, JobDescriptionSuggestionRequest } from '@/types/ai.types';

interface Props {
  title: string;
  categoryId: number;
  experienceLevel?: string;
  workingType?: string;
  disabled?: boolean;
  onApply: (suggestion: JobDescriptionSuggestion) => void;
}

export const AiJdSuggestionPanel: React.FC<Props> = ({
  title,
  categoryId,
  experienceLevel,
  workingType,
  disabled = false,
  onApply,
}) => {
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState<JobDescriptionSuggestion | null>(null);
  const mutation = useMutation({
    mutationFn: (payload: JobDescriptionSuggestionRequest) => aiService.suggestJobDescription(payload),
    onSuccess: result => {
      setSuggestion(result);
      toast.success('Đã tạo bản xem trước JD bằng AI');
    },
    onError: error => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Dịch vụ AI hiện không khả dụng. Bạn có thể tiếp tục nhập JD thủ công.');
    },
  });

  const requestSuggestion = () => {
    if (!title.trim() || !categoryId) {
      toast.error('Vui lòng nhập tiêu đề và chọn danh mục trước khi dùng AI.');
      return;
    }
    mutation.mutate({
      title: title.trim(),
      categoryId,
      experienceLevel,
      workingType,
      prompt: prompt.trim() || undefined,
    });
  };

  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-800">Gợi ý JD bằng AI</div>
        </div>
        <button type="button" onClick={requestSuggestion} disabled={disabled || mutation.isPending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
          Tạo bằng AI
        </button>
      </div>

      <textarea aria-label="Yêu cầu bổ sung cho JD" value={prompt} onChange={event => setPrompt(event.target.value)} disabled={disabled || mutation.isPending} maxLength={2000} rows={3} placeholder="Yêu cầu bổ sung (không bắt buộc)" className="mt-4 w-full resize-y rounded-xl border border-primary-100 bg-white p-3 text-sm text-slate-700 outline-none focus:border-primary-400 disabled:opacity-60" />

      {suggestion && <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Preview từ {suggestion.provider}</p><button type="button" onClick={() => onApply(suggestion)} disabled={disabled} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-xs font-extrabold text-primary-600 hover:bg-primary-50 disabled:opacity-60"><Check className="h-3.5 w-3.5" />Áp dụng gợi ý</button></div>
        <PreviewBlock title="Mô tả công việc" value={suggestion.suggestedDescription} />
        <PreviewBlock title="Yêu cầu ứng viên" value={suggestion.suggestedRequirements} />
        <PreviewBlock title="Quyền lợi" value={suggestion.suggestedBenefits} />
      </div>}
    </div>
  );
};

const PreviewBlock = ({ title, value }: { title: string; value: string }) => <div className="rounded-xl bg-slate-50 p-3"><h4 className="text-xs font-extrabold text-slate-700">{title}</h4><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{value}</p></div>;

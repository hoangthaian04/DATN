import { Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';

const initialDescription =
  'Biến mọi ý tưởng AI để hệ thống tự động vận hành dễ dàng hơn.';

const generatedDescription =
  'TechA Solutions là công ty công nghệ tiên phong tại Việt Nam, tập trung vào việc phát triển các sản phẩm AI ứng dụng, xây dựng nền tảng dữ liệu lớn (Data Platform) và cung cấp các giải pháp tự động hóa toàn diện cho doanh nghiệp.\n\nChúng tôi tự hào mang đến môi trường làm việc sáng tạo, nơi các kỹ sư được trực tiếp tham gia vào những dự án thách thức và ứng dụng công nghệ hiện đại để giải quyết các bài toán thực tế.';

export const CareerSiteSettingsCard = () => {
  const [description, setDescription] = useState(initialDescription);

  const generateDescription = () => {
    setDescription(generatedDescription);
    toast.success('Đã tạo nội dung mô tả mẫu');
  };

  return (
    <section className="!mt-6 space-y-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm shadow-slate-100/50">
      <h2 className="text-[17px] font-bold text-slate-800">Cấu hình Career Site</h2>

      <div className="max-w-3xl space-y-4">
        <div className="space-y-1 pb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
            Mô tả công ty
          </h3>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/50 p-2">
            <ToolbarButton label="In đậm" className="font-bold">B</ToolbarButton>
            <ToolbarButton label="In nghiêng" className="italic">I</ToolbarButton>
            <ToolbarButton label="Gạch chân" className="underline">U</ToolbarButton>
            <ToolbarButton label="Gạch ngang" className="line-through">S</ToolbarButton>
            <span className="mx-1 h-4 w-px bg-slate-300" />
            <ToolbarButton label="Danh sách">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </ToolbarButton>
            <ToolbarButton label="Danh sách đánh số">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
            </ToolbarButton>
          </div>

          <div className="relative">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, 1000))}
              rows={8}
              maxLength={1000}
              placeholder="Nhập mô tả công ty..."
              className="w-full resize-none p-4 pb-8 text-[13px] text-slate-700 outline-none"
            />
            <span className="absolute bottom-3 right-4 text-[10px] font-medium text-slate-400">
              {description.length}/1000 ký tự
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={generateDescription}
            className="flex items-center gap-2 rounded-lg bg-violet-700 px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-500/20 transition-colors hover:bg-violet-800"
          >
            <Sparkles className="h-4 w-4" />
            Tạo bằng AI
          </button>
        </div>
      </div>
    </section>
  );
};

const ToolbarButton = ({ children, className = '', label }: { children: ReactNode; className?: string; label: string }) => (
  <button
    type="button"
    aria-label={label}
    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded p-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-200 ${className}`}
  >
    {children}
  </button>
);

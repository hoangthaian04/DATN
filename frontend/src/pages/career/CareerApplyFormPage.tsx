import React, { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Upload,
  FileText,
  X,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success';

export const CareerApplyFormPage: React.FC = () => {
  const { companySlug = 'techa', slug } = useParams<{ companySlug: string; slug: string }>();
  const jobTitle = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Vị trí ứng tuyển';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập họ và tên';
    if (!email.trim() || !email.includes('@')) errs.email = 'Email không hợp lệ';
    if (!phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    if (!cvFile) errs.cv = 'Vui lòng đính kèm CV';
    if (!agree) errs.agree = 'Vui lòng đồng ý với điều khoản';
    return errs;
  };

  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'application/pdf' || file.type.includes('word') || file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setCvFile(file);
      setErrors((prev) => ({ ...prev, cv: '' }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setFormState('loading');
    setTimeout(() => setFormState('success'), 2000);
  };

  if (formState === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-8">
        {/* Success Animation */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <div className="absolute -top-2 -right-2 left-1/2 ml-8 flex gap-1">
            {['🎉', '⭐', '✨'].map((emoji, i) => (
              <span key={i} className="text-xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{emoji}</span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hồ sơ đã được gửi!</h1>
          <p className="text-base text-slate-500 font-semibold leading-relaxed max-w-md mx-auto">
            Cảm ơn <span className="text-slate-800">{name}</span> đã ứng tuyển vị trí <span className="text-primary-600">{jobTitle}</span> tại TechA Solutions. Chúng tôi sẽ liên hệ với bạn trong vòng <strong>3 ngày làm việc</strong>.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-3 max-w-sm mx-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thông tin đã gửi</p>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">👤 {name}</p>
            <p className="text-sm text-slate-500 font-semibold">✉️ {email}</p>
            <p className="text-sm text-slate-500 font-semibold">📄 {cvFile?.name}</p>
            <p className="text-sm font-extrabold text-primary-600">Mã hồ sơ: APP-2026-0001</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/company/${companySlug}/applications/track`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-all shadow-lg shadow-primary-500/20"
          >
            Tra cứu hồ sơ
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            to={`/company/${companySlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Xem thêm vị trí khác
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
        <Link to={`/company/${companySlug}`} className="hover:text-primary-500 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Về trang công ty
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/company/${companySlug}/jobs/${slug}`} className="hover:text-primary-500 transition-colors">{jobTitle}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600">Ứng tuyển</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card bg-white p-8 space-y-6">
            {/* Header */}
            <div className="space-y-1 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-800">Ứng tuyển: {jobTitle}</h1>
                  <p className="text-xs text-slate-400 font-semibold">TechA Solutions JSC · TP. Hồ Chí Minh</p>
                </div>
              </div>
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CV / Hồ sơ đính kèm *</label>
              {cvFile ? (
                <div className="flex items-center gap-4 p-4 bg-primary-50 border border-primary-200 rounded-2xl">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{cvFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{(cvFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button onClick={() => setCvFile(null)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <Upload className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600">
                    Kéo thả file vào đây hoặc{' '}
                    <span className="text-primary-500 underline underline-offset-2">chọn từ máy tính</span>
                  </p>
                  <p className="text-xs text-slate-400 font-semibold mt-1.5">Hỗ trợ PDF, DOC, DOCX · Tối đa 10MB</p>
                </div>
              )}
              {errors.cv && <p className="text-[11px] text-red-500 font-semibold">{errors.cv}</p>}
            </div>

            {/* Personal Info */}
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-slate-700 border-b border-slate-100 pb-3">Thông tin cá nhân</h3>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-800 transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-800 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 font-semibold">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-primary-500 text-sm font-semibold text-slate-800 transition-colors ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 font-semibold">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setAgree(!agree)}
                  className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    agree ? 'bg-primary-500 border-primary-500' : 'border-slate-300 group-hover:border-primary-300'
                  }`}
                >
                  {agree && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-primary-500 underline underline-offset-2">Điều khoản sử dụng</a>
                  {' '}và{' '}
                  <a href="#" className="text-primary-500 underline underline-offset-2">Chính sách bảo mật</a>
                  . Thông tin của tôi sẽ được sử dụng để liên hệ về cơ hội tuyển dụng.
                </p>
              </label>
              {errors.agree && <p className="text-[11px] text-red-500 font-semibold pl-8">{errors.agree}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={formState === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-all shadow-lg shadow-primary-500/20 cursor-pointer disabled:opacity-70"
            >
              {formState === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi hồ sơ...
                </>
              ) : (
                <>
                  Nộp hồ sơ ứng tuyển
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 font-semibold">
              🔒 Thông tin cá nhân được bảo mật. Chúng tôi không chia sẻ với bên thứ ba.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="premium-card bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-extrabold text-slate-800">Lời khuyên</h3>
            </div>
            <div className="space-y-3">
              {[
                'CV nên ngắn gọn (1-2 trang), tập trung vào kết quả đo lường được',
                'Định dạng PDF được khuyến nghị để giữ nguyên bố cục',
                'Thêm link GitHub/Portfolio nếu có dự án cá nhân',
                'Đọc kỹ JD và đảm bảo CV bao quát các yêu cầu chính',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="h-4 w-4 rounded-full bg-primary-100 text-primary-500 text-[9px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What's Next */}
          <div className="premium-card bg-white p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800">Điều gì xảy ra tiếp theo?</h3>
            <div className="space-y-3 relative pl-4">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
              {[
                'HR review hồ sơ trong 3 ngày làm việc',
                'Bạn nhận email thông báo kết quả',
                'Nếu phù hợp, HR liên hệ đặt lịch phỏng vấn',
              ].map((step, i) => (
                <div key={i} className="relative flex items-start gap-4 pl-6">
                  <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary-500 border-2 border-white ring-1 ring-primary-200 z-10" />
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

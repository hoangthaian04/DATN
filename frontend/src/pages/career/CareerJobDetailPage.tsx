import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  ChevronRight,
  Users,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Globe,
  Phone,
  UploadCloud,
  FileText
} from 'lucide-react';

// Mock job data by slug
const JOB_MAP: Record<string, {
  title: string; location: string; workType: string;
  salaryFrom: number; salaryTo: number; currency: string;
  experience: number; category: string; applicants: number; postedAt: string;
  description: string; requirements: string[]; benefits: string[];
}> = {
  'senior-ai-engineer': {
    title: 'Senior AI Engineer',
    location: 'TP. Hồ Chí Minh (Hybrid)',
    workType: 'Full-time',
    salaryFrom: 50, salaryTo: 90, currency: 'triệu VND',
    experience: 5,
    category: 'Kỹ thuật / AI',
    applicants: 24,
    postedAt: '2026-08-01',
    description: `Bạn sẽ tham gia xây dựng và cải tiến các hệ thống AI cốt lõi tại TechA — từ pipeline RAG, vector search đến LLM fine-tuning và production deployment.\n\nĐây là cơ hội hiếm có để làm việc với các vấn đề AI thực tế, tác động trực tiếp đến hàng nghìn người dùng mỗi ngày.`,
    requirements: [
      '5+ năm kinh nghiệm phát triển AI/ML trong môi trường production',
      'Thành thạo Python, Pytorch/Tensorflow, LangChain/LlamaIndex',
      'Kinh nghiệm với Vector Databases (Qdrant, Pinecone, Weaviate)',
      'Hiểu biết về LLM, RAG, Prompt Engineering',
      'Kinh nghiệm deploy ML model lên cloud (AWS/GCP)',
      'Tiếng Anh đủ để đọc tài liệu kỹ thuật',
    ],
    benefits: [
      'Lương 50–90 triệu VND + review 2 lần/năm',
      'Thưởng 13th month + performance bonus',
      'Bảo hiểm sức khỏe cao cấp (PVI Health)',
      'Budget học hỏi 10 triệu/năm (khóa học, conference)',
      'Làm việc hybrid: 3 ngày office, 2 ngày remote',
      'Cổ phần tùy theo vị trí',
    ],
  },
};

// Default job for unknown slugs
const DEFAULT_JOB = JOB_MAP['senior-ai-engineer'];

export const CareerJobDetailPage: React.FC = () => {
  const { companySlug = 'techa', slug } = useParams<{ companySlug: string; slug: string }>();
  const job = (slug && JOB_MAP[slug]) ? JOB_MAP[slug] : DEFAULT_JOB;
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
        <Link to={`/company/${companySlug}`} className="hover:text-primary-500 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Về trang công ty
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600">{job.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="premium-card bg-white p-8 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-primary-500 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full">
                {job.category}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{job.title}</h1>

            {/* Quick Info Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: DollarSign, label: 'Mức lương', value: `${job.salaryFrom}–${job.salaryTo} ${job.currency}`, color: 'text-emerald-600' },
                { icon: MapPin, label: 'Địa điểm', value: job.location, color: 'text-slate-700' },
                { icon: Clock, label: 'Hình thức', value: job.workType, color: 'text-slate-700' },
                { icon: Briefcase, label: 'Kinh nghiệm', value: `${job.experience}+ năm`, color: 'text-slate-700' },
              ].map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{info.label}</p>
                    </div>
                    <p className={`text-xs font-extrabold ${info.color}`}>{info.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {job.applicants} ứng viên đã nộp
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Đăng ngày {job.postedAt}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="premium-card bg-white p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Mô tả công việc</h2>
            <div className="text-sm text-slate-600 font-semibold leading-relaxed whitespace-pre-line">{job.description}</div>
          </div>

          {/* Requirements */}
          <div className="premium-card bg-white p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Yêu cầu ứng viên</h2>
            <div className="space-y-3">
              {job.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 font-semibold leading-relaxed">{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="premium-card bg-white p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Quyền lợi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-700">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <div className="premium-card bg-white p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800">Về TechA Solutions</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">TechA Solutions JSC</p>
                <p className="text-xs text-slate-400 font-semibold">Công ty Cổ phần</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: MapPin, text: 'TP. Hồ Chí Minh, Việt Nam' },
                { icon: Users, text: '120+ nhân viên' },
                { icon: Globe, text: 'www.techa.vn' },
                { icon: Phone, text: '+84 900 100 200' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Apply Inline Form */}
          <div className="premium-card bg-white p-6 sticky top-6">
            <div className="mb-5 pb-5 border-b border-slate-100">
               <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Ứng tuyển ngay</h3>
               <p className="text-xs text-slate-500 font-semibold mt-1">Gửi hồ sơ trực tiếp đến nhà tuyển dụng</p>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               {/* Upload CV */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-700">Hồ sơ đính kèm (CV) *</label>
                 <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all">
                    <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Tải lên từ thiết bị</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Chỉ nhận file PDF, DOC, DOCX. Tối đa 5MB.</p>
                 </div>
               </div>

               {/* Full Name */}
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700">Họ và tên *</label>
                 <input 
                   type="text" 
                   required
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-slate-400"
                   placeholder="Vd: Nguyễn Văn A"
                 />
               </div>

               {/* Phone */}
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700">Số điện thoại *</label>
                 <input 
                   type="tel" 
                   required
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-slate-400"
                   placeholder="Vd: 0912345678"
                 />
               </div>

               {/* Email */}
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700">Email liên hệ *</label>
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-slate-400"
                   placeholder="Vd: email@example.com"
                 />
               </div>
               
               <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-all shadow-lg shadow-primary-500/20">
                 Nộp hồ sơ
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

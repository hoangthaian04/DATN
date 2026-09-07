import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen, Building2, Check, ChevronDown, Edit3, Eye, GripVertical,
  KeyRound, Link as LinkIcon, List, ListOrdered, Loader2, Mail,
  MoreVertical, Plus, RefreshCw, Save, Search, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { CareerSiteSettingsCard } from '@/components/settings/CareerSiteSettingsCard';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';

type Tab = 'company' | 'general' | 'emails' | 'security';
type EmailTag = 'PASS' | 'FAIL' | 'INTERVIEW_INVITE' | 'OFFER' | 'APPLICATION_RECEIVED';
type EmailTemplate = { id: string; title: string; subject: string; tag: EmailTag; content: string };
type WhyCard = { id: string; text: string };

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
}).refine(data => data.newPassword !== data.currentPassword, {
  message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
  path: ['newPassword']
});

const defaultEmail = 'Xin chào {{candidate_name}},\n\nCảm ơn bạn đã quan tâm và ứng tuyển vào vị trí {{job_title}} tại {{company_name}}.\n\nChúng tôi đã nhận được hồ sơ của bạn và đội ngũ tuyển dụng sẽ xem xét kỹ lưỡng.\n\nChúng tôi sẽ liên hệ lại trong thời gian sớm nhất.\n\nTrân trọng,\n{{company_name}} Recruitment Team';

const makeTemplate = (id: string, title: string, subject: string, tag: EmailTag): EmailTemplate => ({
  id, title, subject, tag,
  content: id === 't2' ? 'Xin chào {{candidate_name}},\n\nChúc mừng bạn đã vượt qua vòng sơ loại CV.\n\nHR sẽ gọi điện cho bạn sớm nhé.' : defaultEmail
});

const initialTemplates = [
  makeTemplate('t1', 'Xác nhận nộp đơn thành công', 'Xác nhận ứng tuyển vị trí {{job_title}}', 'APPLICATION_RECEIVED'),
  makeTemplate('t2', 'Qua vòng CV Screening', '{{candidate_name}} — Chúc mừng qua vòng CV Screening', 'PASS'),
  makeTemplate('t3', 'Mời phỏng vấn kỹ thuật', 'Lời mời phỏng vấn — {{job_title}} tại {{company_name}}', 'INTERVIEW_INVITE'),
  makeTemplate('t4', 'Không đạt vòng Online Test', 'Kết quả vòng Test — {{candidate_name}}', 'FAIL'),
  makeTemplate('t5', 'Offer Letter', 'Thư mời nhận việc chính thức — {{candidate_name}}', 'OFFER'),
  makeTemplate('t6', 'Cảm ơn ứng viên', 'Cảm ơn {{candidate_name}} đã ứng tuyển', 'FAIL'),
  makeTemplate('t7', 'Qua vòng Online Test', 'Chúc mừng {{candidate_name}} qua vòng Test', 'PASS')
];

const fieldClass = 'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-primary-500';

const tagStyle = (tag: EmailTag) => 
  tag === 'PASS' ? 'border-blue-200 bg-blue-50 text-blue-500' : 
  tag === 'FAIL' ? 'border-red-200 bg-red-50 text-red-500' : 
  'border-slate-200 bg-slate-50 text-slate-500';

const tagName = (tag: EmailTag) => ({
  PASS: 'Pass (Đạt vòng)',
  FAIL: 'Fail (Trượt)',
  INTERVIEW_INVITE: 'Mời phỏng vấn',
  OFFER: 'Offer (Đề nghị nhận việc)',
  APPLICATION_RECEIVED: 'Đã nhận hồ sơ'
})[tag];

const Field = ({ label, value, onChange, required, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) => (
  <label className="block space-y-2 text-[13px] font-semibold text-slate-600">
    {label} {required && <span className="text-red-500">*</span>}
    <input type={type} value={value} onChange={event => onChange(event.target.value)} className={fieldClass} />
  </label>
);

const SelectField = ({ label, value, options, optionLabels, onChange, required }: { label: string; value: string; options: string[]; optionLabels?: string[]; onChange: (value: string) => void; required?: boolean }) => (
  <label className="block space-y-2 text-[13px] font-semibold text-slate-600">
    {label} {required && <span className="text-red-500">*</span>}
    <span className="relative block">
      <select value={value} onChange={event => onChange(event.target.value)} className={`${fieldClass} cursor-pointer appearance-none pr-10`}>
        {options.map((option, index) => <option key={option} value={option}>{optionLabels?.[index] ?? option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </span>
  </label>
);

const Tool = ({ label, className = '' }: { label: React.ReactNode; className?: string }) => (
  <button type="button" className={`flex h-7 w-7 items-center justify-center rounded p-1.5 text-xs text-slate-600 hover:bg-slate-200 ${className}`}>
    {label}
  </button>
);

const VariablePanel = () => (
  <aside className="col-span-12 xl:col-span-4">
    <div className="h-full rounded-xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="text-[12px] font-bold text-slate-800">Biến động sử dụng</h3>
      <p className="mb-4 mt-1 text-[10px] leading-relaxed text-slate-500">Click để sao chép biến và dán vào nội dung email.</p>
      
      <div className="space-y-3">
        {[
          ['{{candidate_name}}', 'Tên đầy đủ của ứng viên'], 
          ['{{job_title}}', 'Tên vị trí đang tuyển'], 
          ['{{company_name}}', 'Tên công ty (TechA.JSC)'], 
          ['{{interview_date}}', 'Ngày giờ phỏng vấn dự kiến']
        ].map(([variable, description]) => (
          <button 
            key={variable} 
            type="button" 
            onClick={() => { 
              navigator.clipboard?.writeText(variable); 
              toast.success(`Đã sao chép ${variable}`); 
            }} 
            className="block w-full rounded-lg border border-slate-100 bg-white p-2.5 text-left shadow-sm hover:border-primary-200"
          >
            <code className="rounded bg-primary-50 px-1 py-0.5 text-[10px] font-bold text-primary-600">{variable}</code>
            <p className="mt-1 text-[10px] font-medium text-slate-500">{description}</p>
          </button>
        ))}
      </div>
      
      <button onClick={() => toast('Danh sách đầy đủ sẽ được cập nhật sau')} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-50">
        <BookOpen className="h-3.5 w-3.5" />
        Xem danh sách 20+ biến
      </button>
    </div>
  </aside>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('company'); 
  const [saving, setSaving] = useState(false); 
  const [saved, setSaved] = useState(false); 
  const [logo, setLogo] = useState<string>();
  
  const [templates, setTemplates] = useState(initialTemplates); 
  const [selectedId, setSelectedId] = useState(initialTemplates[0].id); 
  const [search, setSearch] = useState('');
  
  const [company, setCompany] = useState({ 
    name: 'TechA.JSC', 
    size: '120+', 
    founded: '2019', 
    tax: '0312345678', 
    industry: 'Công nghệ thông tin', 
    slogan: 'Đổi mới để dẫn đầu', 
    introduction: 'Chúng tôi xây dựng tương lai bằng công nghệ và sự sáng tạo không ngừng nghỉ.', 
    phone: '+84 910 100 260', 
    website: 'www.techa.vn', 
    city: 'Hồ Chí Minh', 
    ward: 'Phường Thủ Đức', 
    address: 'Tầng 12, Tòa Lotus, 68 Nguyễn Huệ, Q.1, TP. HCM', 
    services: 'AI Product Development, Data Platform, Cloud Engineering' 
  });
  
  const [reasons, setReasons] = useState<WhyCard[]>([
    { id: '1', text: 'Làm việc với các công nghệ AI mới nhất, từ LLM đến Vector Embedding trong môi trường thực tế.' }, 
    { id: '2', text: 'Môi trường cạnh tranh - equity - review 2 lần/năm - 13th month - bảo hiểm sức khỏe cao cấp.' }, 
    { id: '3', text: 'Budget học hỏi hàng năm, mentorship từ senior engineers, cơ hội làm việc với khách hàng quốc tế.' }
  ]);
  
  const form = useForm<z.infer<typeof passwordSchema>>({ 
    resolver: zodResolver(passwordSchema), 
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } 
  });
  
  const selected = templates.find(item => item.id === selectedId) ?? templates[0]; 
  const shown = templates.filter(item => item.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  
  const setCompanyValue = (key: keyof typeof company, value: string) => setCompany(current => ({ ...current, [key]: value }));
  const updateTemplate = (changes: Partial<EmailTemplate>) => setTemplates(current => current.map(item => item.id === selected.id ? { ...item, ...changes } : item));
  
  const saveCompany = () => { 
    setSaving(true); 
    window.setTimeout(() => { 
      setSaving(false); 
      setSaved(true); 
      toast.success('Đã lưu thông tin công ty'); 
      window.setTimeout(() => setSaved(false), 1800); 
    }, 500); 
  };
  
  const addTemplate = () => { 
    const id = `template-${Date.now()}`; 
    setTemplates(current => [{ id, title: 'Mẫu email mới', subject: '', tag: 'PASS', content: '' }, ...current]); 
    setSelectedId(id); 
  };
  
  const deleteTemplate = () => { 
    if (templates.length === 1) return toast.error('Cần giữ lại ít nhất một mẫu email'); 
    const next = templates.filter(item => item.id !== selected.id); 
    setTemplates(next); 
    setSelectedId(next[0].id); 
  };
  
  const changeLogo = (event: ChangeEvent<HTMLInputElement>) => { 
    const file = event.target.files?.[0]; 
    if (!file) return; 
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return toast.error('Chỉ chấp nhận ảnh PNG/JPG tối đa 2MB'); 
    setLogo(URL.createObjectURL(file)); 
  };
  
  const changePassword = async (data: z.infer<typeof passwordSchema>) => { 
    try { 
      await AuthService.changePassword(data); 
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.'); 
      window.setTimeout(() => { 
        AuthService.logout(); 
        navigate('/login'); 
      }, 1500); 
    } catch (error: unknown) { 
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'); 
    } 
  };
  
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'company', label: 'Thông tin chung', icon: Building2 }, 
    { id: 'emails', label: 'Email Templates', icon: Mail },
    { id: 'security', label: 'Bảo mật', icon: KeyRound }
  ];
  
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#F8FAFC] p-8">
      <div className="mx-auto max-w-[1400px] space-y-8 text-left">
        <header className="space-y-1 select-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            Dashboard <span className="text-[10px]">&gt;</span><span className="text-slate-500">Cài đặt</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Cài đặt hệ thống</h1>
          <p className="text-sm font-medium text-slate-500">Quản lý thông tin công ty và cấu hình Career Site.</p>
        </header>

        <nav className="flex items-center gap-2 overflow-x-auto border-b border-slate-200">
          {tabs.map(tab => { 
            const Icon = tab.icon; 
            const on = activeTab === tab.id; 
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`-mb-[1px] flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-bold transition-all duration-200 ${on ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}
              >
                <Icon className={`h-4 w-4 ${on ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ); 
          })}
        </nav>

        {activeTab === 'company' && <OnboardingPage settings />}

        {activeTab === 'general' && (
          <div className="flex flex-col gap-6 pt-2">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/50 sm:p-8">
              <h2 className="text-xl font-bold text-slate-800">Thông tin công ty</h2>
              <p className="mb-8 mt-1 text-sm text-slate-500">Cập nhật thông tin doanh nghiệp sẽ hiển thị trên Career Site.</p>
              
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-[#e6f0f9] text-xl font-extrabold text-primary-500">
                  {logo ? (
                    <img src={logo} alt="Logo công ty" className="h-full w-full object-cover" />
                  ) : (
                    company.name[0]
                  )}
                </div>
                <div>
                  <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Upload logo
                    <input className="sr-only" type="file" accept="image/png,image/jpeg" onChange={changeLogo} />
                  </label>
                  <p className="mt-2 text-[10px] font-medium uppercase text-slate-400">PNG, JPG tối đa 2MB</p>
                </div>
              </div>

              <div className="max-w-4xl space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Field label="Tên công ty" value={company.name} required onChange={value => setCompanyValue('name', value)} />
                  <SelectField label="Quy mô nhân sự" value={company.size} options={['120+', '50-100', '1-50']} onChange={value => setCompanyValue('size', value)} />
                  <Field label="Năm thành lập" value={company.founded} onChange={value => setCompanyValue('founded', value)} />
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Mã số thuế" value={company.tax} onChange={value => setCompanyValue('tax', value)} />
                  <Field label="Lĩnh vực hoạt động" value={company.industry} onChange={value => setCompanyValue('industry', value)} />
                </div>
                
                <Field label="Slogan (câu công ty)" value={company.slogan} onChange={value => setCompanyValue('slogan', value)} />
                
                <label className="block space-y-2 text-[13px] font-semibold text-slate-600">
                  Giới thiệu công ty (tối đa 200 ký tự)
                  <textarea rows={3} maxLength={200} value={company.introduction} onChange={event => setCompanyValue('introduction', event.target.value)} className={`${fieldClass} resize-none`} />
                </label>
                
                <div className="grid gap-6 border-b border-slate-100 pb-6 md:grid-cols-2">
                  <Field label="Số điện thoại" type="tel" value={company.phone} onChange={value => setCompanyValue('phone', value)} />
                  <Field label="Website (nếu có)" type="url" value={company.website} onChange={value => setCompanyValue('website', value)} />
                </div>
                
                <div className="border-b border-slate-100 py-2 pb-6">
                  <h3 className="mb-5 text-[15px] font-bold text-slate-800">Địa điểm công ty</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <SelectField label="Tỉnh / Thành phố" value={company.city} options={['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']} onChange={value => setCompanyValue('city', value)} />
                    <SelectField label="Xã / Phường" value={company.ward} options={['Phường Thủ Đức', 'Phường Bến Nghé']} onChange={value => setCompanyValue('ward', value)} />
                  </div>
                  <div className="mt-6">
                    <Field label="Địa chỉ cụ thể" value={company.address} onChange={value => setCompanyValue('address', value)} />
                  </div>
                  <div className="mt-6">
                    <Field label="Dịch vụ / Sản phẩm chính" value={company.services} onChange={value => setCompanyValue('services', value)} />
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="mb-1 text-[15px] font-bold text-slate-800">Lý do chọn công ty</h3>
                  <p className="mb-4 text-[12px] text-slate-500">Các lý do nổi bật về văn hóa, cơ hội phát triển hiển thị trên Career Site.</p>
                  
                  <div className="space-y-3">
                    {reasons.map((reason, index) => (
                      <div key={reason.id} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300">
                        <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                        <input 
                          value={reason.text} 
                          onChange={event => setReasons(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item))} 
                          className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-700 outline-none" 
                        />
                        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setReasons(items => items.filter(item => item.id !== reason.id))} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button onClick={() => setReasons(items => [...items, { id: `${Date.now()}`, text: 'Lý do mới' }])} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-[13px] font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-50">
                      <Plus className="h-4 w-4" />Thêm lý do mới
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end pt-6">
                  <button disabled={saving} onClick={saveCompany} className="flex items-center gap-2 rounded-lg bg-[#2563eb] hover:bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 disabled:opacity-60 transition-colors cursor-pointer">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saved ? 'Đã lưu' : 'Lưu thông tin'}
                  </button>
                </div>
              </div>
            </section>
            
            <CareerSiteSettingsCard />
          </div>
        )}

        {activeTab === 'emails' && (
          <section className="grid items-start gap-6 lg:grid-cols-12">
            <aside className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100/50 lg:col-span-4 xl:col-span-3">
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm kiếm mẫu email..." className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-[13px] outline-none focus:border-primary-500 transition-colors" />
                </label>
                <button onClick={addTemplate} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />Tạo mẫu
                </button>
              </div>
              
              <div className="flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1">
                {shown.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setSelectedId(item.id)} 
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors cursor-pointer ${selected.id === item.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="mr-2 min-w-0 flex-1 overflow-hidden">
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[13px] font-bold ${selected.id === item.id ? 'text-blue-900' : 'text-slate-800'}`}>{item.title}</p>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{tagName(item.tag)}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 uppercase rounded border px-2 py-0.5 text-[10px] font-extrabold ${tagStyle(item.tag)}`}>{item.tag}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center gap-4 border-t border-slate-100 pt-2 text-xs font-bold text-slate-500">
                <button className="p-1 hover:text-slate-800 cursor-pointer">&lt;</button>
                <span>1 / {templates.length}</span>
                <button className="p-1 hover:text-slate-800 cursor-pointer">&gt;</button>
              </div>
            </aside>
            
            <div className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/50 sm:p-6 lg:col-span-8 xl:col-span-9">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:justify-between">
                <div className="min-w-0 flex-1 max-w-xl">
                  <input value={selected.title} onChange={event => updateTemplate({ title: event.target.value })} className="w-full bg-transparent text-lg font-extrabold text-slate-800 border-none outline-none focus:outline-none" placeholder="Nhập tên mẫu email..." />
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] uppercase ${tagStyle(selected.tag)}`}>{selected.tag}</span>
                    <span>Đã gửi 25 lần</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Cập nhật lần cuối: 12/05/2024 14:30</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => toast.success('Bản xem trước đã sẵn sàng')} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer">
                    <Eye className="h-3.5 w-3.5" />Xem trước
                  </button>
                  <button onClick={() => toast.success('Đã lưu thay đổi')} className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer">
                    <Save className="h-3.5 w-3.5" />Lưu thay đổi
                  </button>
                  <button onClick={deleteTemplate} className="rounded-lg border border-slate-200 p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 flex flex-col gap-5 xl:col-span-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField 
                      label="Loại Email / Trạng thái" 
                      required 
                      value={selected.tag} 
                      options={['APPLICATION_RECEIVED', 'PASS', 'FAIL', 'INTERVIEW_INVITE', 'OFFER']} 
                      optionLabels={['Đã nhận hồ sơ', 'Pass (Đạt vòng)', 'Fail (Trượt)', 'Interview (Mời phỏng vấn)', 'Offer (Đề nghị nhận việc)']} 
                      onChange={value => updateTemplate({ tag: value as EmailTag })} 
                    />
                    <Field label="Tiêu đề (Subject)" required value={selected.subject} onChange={value => updateTemplate({ subject: value })} />
                  </div>
                  
                  <div>
                    <p className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600">
                      Nội dung email <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 focus-within:border-blue-500 transition-colors">
                      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 p-2">
                        <Tool label="B" className="font-bold" />
                        <Tool label="I" className="italic" />
                        <Tool label="U" className="underline" />
                        <Tool label="S" className="line-through" />
                        <i className="mx-1 h-4 w-px bg-slate-300" />
                        <Tool label={<LinkIcon className="h-3.5 w-3.5" />} />
                        <Tool label={<List className="h-3.5 w-3.5" />} />
                        <Tool label={<ListOrdered className="h-3.5 w-3.5" />} />
                        <div className="mx-1 h-4 w-px bg-slate-300" />
                        <div className="ml-auto mt-1 sm:mt-0">
                          <button className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 cursor-pointer">
                            Chèn biến <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <textarea 
                        rows={14} 
                        value={selected.content} 
                        onChange={event => updateTemplate({ content: event.target.value })} 
                        className="w-full resize-none p-4 text-[13px] leading-relaxed text-slate-700 outline-none bg-white" 
                      />
                    </div>
                  </div>
                </div>
                
                <VariablePanel />
              </div>
            </div>
          </section>
        )}

        {activeTab === 'security' && (
          <section className="max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100/50 sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <div className="rounded-xl bg-primary-50 p-2.5">
                <KeyRound className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Đổi mật khẩu</h2>
                <p className="text-sm text-slate-500">Dùng mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
              </div>
            </div>
            
            <form onSubmit={form.handleSubmit(changePassword)} className="max-w-md space-y-5">
              {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map(key => (
                <label key={key} className="block text-[13px] font-semibold text-slate-600">
                  {key === 'currentPassword' ? 'Mật khẩu hiện tại' : key === 'newPassword' ? 'Mật khẩu mới' : 'Xác nhận mật khẩu mới'}
                  <input type="password" {...form.register(key)} className={`mt-2 ${fieldClass}`} placeholder="••••••••" />
                  {form.formState.errors[key] && <span className="mt-1 block text-xs text-red-500">{form.formState.errors[key]?.message}</span>}
                </label>
              ))}
              
              <button disabled={form.formState.isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] hover:bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 disabled:opacity-60 transition-colors cursor-pointer">
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Cập nhật mật khẩu
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

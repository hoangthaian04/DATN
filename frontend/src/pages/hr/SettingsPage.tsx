import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2, ChevronDown, Edit3, Eye,
  KeyRound, Link as LinkIcon, List, ListOrdered, Loader2, Mail,
  Plus, Search, Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';
import { useLocation, useNavigate } from 'react-router-dom';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';
import { emailTemplateService } from '@/services/email-template.service';
import type { EmailTemplateApi } from '@/types/email-template.types';

type Tab = 'company' | 'emails' | 'security';
type EmailTag = 'PASS' | 'FAIL' | 'INTERVIEW_INVITE' | 'OFFER' | 'APPLICATION_RECEIVED';
type EmailTemplate = { id: string; title: string; subject: string; tag: EmailTag; content: string; metadataLocked?: boolean; scope?: 'SYSTEM' | 'CUSTOM' };
type NewTemplateForm = { subject: string; tag: EmailTag | ''; title: string };
type NewTemplateErrors = Partial<Record<keyof NewTemplateForm, string>>;

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

const defaultEmail = 'Xin chào {{candidateName}},\n\nCảm ơn bạn đã quan tâm và ứng tuyển vào vị trí {{jobTitle}} tại {{companyName}}.\n\nChúng tôi đã nhận được hồ sơ của bạn và đội ngũ tuyển dụng sẽ xem xét kỹ lưỡng.\n\nChúng tôi sẽ liên hệ lại trong thời gian sớm nhất.\n\nTrân trọng,\n{{companyName}} Recruitment Team';

const makeTemplate = (id: string, title: string, subject: string, tag: EmailTag): EmailTemplate => ({
  id, title, subject, tag,
  content: id === 't2' ? 'Xin chào {{candidateName}},\n\nChúc mừng bạn đã vượt qua vòng sơ loại CV.\n\nHR sẽ gọi điện cho bạn sớm nhé.' : defaultEmail
});

const initialTemplates = [
  makeTemplate('t1', 'Xác nhận nộp đơn thành công', 'Xác nhận ứng tuyển vị trí {{jobTitle}}', 'APPLICATION_RECEIVED'),
  makeTemplate('t2', 'Qua vòng CV Screening', '{{candidateName}} — Chúc mừng qua vòng CV Screening', 'PASS'),
  makeTemplate('t3', 'Mời phỏng vấn kỹ thuật', 'Lời mời phỏng vấn — {{jobTitle}} tại {{companyName}}', 'INTERVIEW_INVITE'),
  makeTemplate('t4', 'Không đạt vòng Online Test', 'Kết quả vòng Test — {{candidateName}}', 'FAIL'),
  makeTemplate('t5', 'Offer Letter', 'Thư mời nhận việc chính thức — {{candidateName}}', 'OFFER'),
  makeTemplate('t6', 'Cảm ơn ứng viên', 'Cảm ơn {{candidateName}} đã ứng tuyển', 'FAIL'),
  makeTemplate('t7', 'Qua vòng Online Test', 'Chúc mừng {{candidateName}} qua vòng Test', 'PASS')
];

const fromApiTemplate = (template: EmailTemplateApi): EmailTemplate => ({
  id: String(template.id), title: template.templateName, subject: template.subject, tag: template.type,
  content: template.bodyHtml, metadataLocked: true, scope: template.templateScope
});

const emptyNewTemplate: NewTemplateForm = { subject: '', tag: '', title: '' };
const supportedTemplateVariables = new Set(['candidateName', 'jobTitle', 'companyName', 'interviewDate']);
const previewVariableValues: Record<string, string> = {
  candidateName: 'Nguyễn Minh Anh',
  jobTitle: 'Frontend Engineer',
  companyName: 'EasyHire Demo Company',
  interviewDate: '09:00, 15/10/2026'
};
const emailTagOptions: { value: EmailTag; label: string }[] = [
  { value: 'APPLICATION_RECEIVED', label: 'Đã nhận hồ sơ' },
  { value: 'PASS', label: 'Pass (Đạt vòng)' },
  { value: 'FAIL', label: 'Fail (Trượt)' },
  { value: 'INTERVIEW_INVITE', label: 'Mời phỏng vấn' },
  { value: 'OFFER', label: 'Offer (Đề nghị nhận việc)' }
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

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[character] || character));

const previewText = (value: string) => value.replace(/\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g, (_, variable: string) => previewVariableValues[variable] || `{{${variable}}}`);

const buildPreviewDocument = (subject: string, body: string) => `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; padding: 24px; background: #f8fafc; color: #334155; font-family: Arial, sans-serif; line-height: 1.6; }
      main { max-width: 680px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; }
      h1 { margin: 0 0 20px; color: #0f172a; font-size: 20px; }
      .body { white-space: pre-wrap; overflow-wrap: anywhere; }
    </style>
  </head>
  <body><main><h1>${escapeHtml(previewText(subject))}</h1><div class="body">${previewText(body).replace(/\n/g, '<br />')}</div></main></body>
</html>`;

const Field = ({ label, value, onChange, required, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; disabled?: boolean }) => (
  <label className="block space-y-2 text-[13px] font-semibold text-slate-600">
    {label} {required && <span className="text-red-500">*</span>}
    <input type={type} value={value} onChange={event => onChange(event.target.value)} disabled={disabled} className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`} />
  </label>
);

const SelectField = ({ label, value, options, optionLabels, onChange, required, disabled = false }: { label: string; value: string; options: string[]; optionLabels?: string[]; onChange: (value: string) => void; required?: boolean; disabled?: boolean }) => (
  <label className="block space-y-2 text-[13px] font-semibold text-slate-600">
    {label} {required && <span className="text-red-500">*</span>}
    <span className="relative block">
      <select value={value} onChange={event => onChange(event.target.value)} disabled={disabled} className={`${fieldClass} cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}>
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
          ['{{candidateName}}', 'Tên đầy đủ của ứng viên'],
          ['{{jobTitle}}', 'Tên vị trí đang tuyển'],
          ['{{companyName}}', 'Tên công ty của doanh nghiệp'],
          ['{{interviewDate}}', 'Ngày giờ phỏng vấn dự kiến']
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
      
    </div>
  </aside>
);

export const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeTab: Tab = location.pathname.endsWith('/email-templates') ? 'emails' : 'company';
  const [activeTab, setActiveTab] = useState<Tab>(routeTab);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [templates, setTemplates] = useState(initialTemplates); 
  const [selectedId, setSelectedId] = useState(initialTemplates[0].id); 
  const [search, setSearch] = useState('');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<NewTemplateForm>(emptyNewTemplate);
  const [createTemplateErrors, setCreateTemplateErrors] = useState<NewTemplateErrors>({});
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingOriginalContent, setEditingOriginalContent] = useState('');
  const queryClient = useQueryClient();
  const { data: emailTemplatePage, isLoading: isEmailTemplatesLoading, isError: isEmailTemplatesError } = useQuery({
    queryKey: ['email-templates'], queryFn: () => emailTemplateService.list(), enabled: activeTab === 'emails'
  });
  
  const form = useForm<z.infer<typeof passwordSchema>>({ 
    resolver: zodResolver(passwordSchema), 
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } 
  });
  
  const selected = templates.find(item => item.id === selectedId) ?? templates[0]; 
  const shown = templates.filter(item => item.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

  useEffect(() => {
    setActiveTab(routeTab);
    setIsPreviewOpen(false);
  }, [routeTab]);

  useEffect(() => {
    if (!emailTemplatePage) return;
    const serverTemplates = emailTemplatePage.content.map(fromApiTemplate);
    setTemplates(serverTemplates);
    setSelectedId(current => serverTemplates.some(item => item.id === current) ? current : (serverTemplates[0]?.id ?? ''));
    setIsEditingTemplate(false);
  }, [emailTemplatePage]);

  useEffect(() => {
    if (!isCreateTemplateOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCreateTemplateOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isCreateTemplateOpen]);
  
  const updateTemplate = (changes: Partial<EmailTemplate>) => setTemplates(current => current.map(item => item.id === selected.id ? { ...item, ...changes } : item));
  
  const openCreateTemplateModal = () => {
    setNewTemplate(emptyNewTemplate);
    setCreateTemplateErrors({});
    setIsCreateTemplateOpen(true);
  };

  const closeCreateTemplateModal = () => {
    setIsCreateTemplateOpen(false);
    setCreateTemplateErrors({});
  };

  const updateNewTemplate = <Key extends keyof NewTemplateForm>(key: Key, value: NewTemplateForm[Key]) => {
    setNewTemplate(current => ({ ...current, [key]: value }));
    setCreateTemplateErrors(current => ({ ...current, [key]: undefined }));
  };

  const validateNewTemplate = (): NewTemplateErrors => {
    const errors: NewTemplateErrors = {};
    const title = newTemplate.title.trim();

    if (!newTemplate.subject.trim()) errors.subject = 'Vui lòng nhập tiêu đề email.';
    else if (newTemplate.subject.trim().length > 255) errors.subject = 'Tiêu đề email không được vượt quá 255 ký tự.';
    if (!newTemplate.tag) errors.tag = 'Vui lòng chọn loại email.';
    if (!title) errors.title = 'Vui lòng nhập tên email.';
    else if (title.length > 120) errors.title = 'Tên email không được vượt quá 120 ký tự.';
    else if (templates.some(template => template.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase())) {
      errors.title = 'Tên email template đã tồn tại. Vui lòng dùng tên khác.';
    }

    return errors;
  };

  const confirmCreateTemplate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateNewTemplate();
    if (Object.keys(errors).length) {
      setCreateTemplateErrors(errors);
      return;
    }

    const id = `draft-${Date.now()}`;
    setTemplates(current => [{
      id,
      title: newTemplate.title.trim(),
      subject: newTemplate.subject.trim(),
      tag: newTemplate.tag as EmailTag,
      content: '',
      metadataLocked: true
    }, ...current]);
    setSelectedId(id);
    setEditingOriginalContent('');
    setIsEditingTemplate(true);
    setSearch('');
    setIsCreateTemplateOpen(false);
    setNewTemplate(emptyNewTemplate);
    setCreateTemplateErrors({});
    window.setTimeout(() => editorRef.current?.focus(), 0);
    toast.success('Đã tạo mẫu. Hãy soạn nội dung email.');
  };
  
  const saveEmailTemplate = async () => {
    if (!selected.content.trim()) return toast.error('Vui lòng nhập nội dung email trước khi lưu.');
    const variables = [...`${selected.subject}\n${selected.content}`.matchAll(/\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g)].map(match => match[1]);
    const unsupportedVariable = variables.find(variable => !supportedTemplateVariables.has(variable));
    if (unsupportedVariable) return toast.error(`Biến {{${unsupportedVariable}}} không được hỗ trợ. Hãy dùng danh sách biến gợi ý.`);
    try {
      setIsSavingTemplate(true);
      const saved = selected.id.startsWith('draft-')
        ? await emailTemplateService.create({ templateName: selected.title, type: selected.tag, subject: selected.subject, bodyHtml: selected.content, isActive: true })
        : await emailTemplateService.update(Number(selected.id), { bodyHtml: selected.content });
      const mapped = fromApiTemplate(saved);
      setTemplates(current => current.map(item => item.id === selected.id ? mapped : item));
      setSelectedId(mapped.id);
      setIsEditingTemplate(false);
      await queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Đã lưu mẫu email');
    } catch (error) {
      toast.error((error as { customMessage?: string })?.customMessage || 'Không thể lưu mẫu email. Vui lòng thử lại.');
    } finally { setIsSavingTemplate(false); }
  };

  const deleteTemplate = async () => {
    if (selected.scope === 'SYSTEM') return toast.error('Không thể xóa mẫu email mặc định của hệ thống.');
    if (!window.confirm(`Bạn có chắc muốn xóa email “${selected.title}”? Hành động này không thể hoàn tác.`)) return;
    if (selected.id.startsWith('draft-')) {
      const next = templates.filter(item => item.id !== selected.id); setTemplates(next); setSelectedId(next[0]?.id ?? ''); return;
    }
    try {
      await emailTemplateService.remove(Number(selected.id));
      const next = templates.filter(item => item.id !== selected.id); setTemplates(next); setSelectedId(next[0]?.id ?? '');
      await queryClient.invalidateQueries({ queryKey: ['email-templates'] }); toast.success('Đã xóa mẫu email');
    } catch (error) { toast.error((error as { customMessage?: string })?.customMessage || 'Không thể xóa mẫu email.'); }
  };

  const startEditingTemplate = () => {
    setEditingOriginalContent(selected.content);
    setIsEditingTemplate(true);
    window.setTimeout(() => editorRef.current?.focus(), 0);
  };

  const cancelEditingTemplate = () => {
    updateTemplate({ content: editingOriginalContent });
    setIsEditingTemplate(false);
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
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px] space-y-6 text-left">
        <header className="space-y-3 select-none">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
            Dashboard <span className="text-slate-300">&gt;</span><span className="text-slate-500">Cài đặt</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cài đặt hệ thống</h1>
        </header>

        <nav className="flex items-center gap-8 overflow-x-auto border-b border-slate-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const on = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'company') navigate('/dashboard/settings');
                  if (tab.id === 'emails') navigate('/dashboard/settings/email-templates');
                }}
                className={`-mb-[1px] flex shrink-0 cursor-pointer items-center gap-2.5 border-b-2 px-1 py-3 text-sm font-semibold transition-all duration-200 ${on ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}
              >
                <Icon className={`h-4 w-4 ${on ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ); 
          })}
        </nav>

        {activeTab === 'company' && <OnboardingPage settings />}

        {activeTab === 'emails' && (
          <section className="grid items-start gap-6 lg:grid-cols-12">
            <aside className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100/50 lg:col-span-4 xl:col-span-3">
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm kiếm mẫu email..." className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-[13px] outline-none focus:border-primary-500 transition-colors" />
                </label>
                <button onClick={openCreateTemplateModal} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />Tạo mẫu
                </button>
              </div>
              
              <div className="flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1">
                {isEmailTemplatesLoading ? <div className="py-8 text-center text-xs text-slate-500">Đang tải mẫu email...</div> : isEmailTemplatesError ? <div className="py-8 text-center text-xs text-red-500">Không thể tải mẫu email. Vui lòng tải lại trang.</div> : shown.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { setSelectedId(item.id); setIsEditingTemplate(false); }} 
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
                  <input value={selected.title} onChange={event => updateTemplate({ title: event.target.value })} disabled={selected.metadataLocked} className="w-full border-none bg-transparent text-lg font-extrabold text-slate-800 outline-none focus:outline-none disabled:cursor-not-allowed disabled:text-slate-800" placeholder="Nhập tên mẫu email..." />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!selected.content.trim() || isSavingTemplate}
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" />Xem trước
                  </button>
                  <button disabled={isEditingTemplate || isSavingTemplate} onClick={startEditingTemplate} className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                    <Edit3 className="h-3.5 w-3.5" />Chỉnh sửa
                  </button>
                  {selected.scope !== 'SYSTEM' && <button onClick={deleteTemplate} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />Xóa email
                  </button>}
                </div>
              </div>
              
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 flex flex-col gap-5 xl:col-span-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField 
                      label="Loại Email / Trạng thái" 
                      required 
                      value={selected.tag} 
                      options={emailTagOptions.map(option => option.value)}
                      optionLabels={emailTagOptions.map(option => option.label)}
                      onChange={value => updateTemplate({ tag: value as EmailTag })} 
                      disabled={selected.metadataLocked}
                    />
                    <Field label="Tiêu đề (Subject)" required value={selected.subject} onChange={value => updateTemplate({ subject: value })} disabled={selected.metadataLocked} />
                  </div>
                  
                  <div>
                    <p className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600">
                      Nội dung email <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 focus-within:border-blue-500 transition-colors">
                      <div className={`flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 p-2 ${isEditingTemplate ? '' : 'pointer-events-none opacity-50'}`}>
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
                        ref={editorRef}
                        rows={14} 
                        value={selected.content} 
                        onChange={event => updateTemplate({ content: event.target.value })} 
                        disabled={!isEditingTemplate}
                        className="w-full resize-none bg-white p-4 text-[13px] leading-relaxed text-slate-700 outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600" 
                      />
                    </div>
                    {isEditingTemplate && <div className="mt-4 flex justify-end gap-3">
                      <button type="button" disabled={isSavingTemplate} onClick={cancelEditingTemplate} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Hủy chỉnh sửa</button>
                      <button type="button" disabled={isSavingTemplate} onClick={saveEmailTemplate} className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSavingTemplate && <Loader2 className="h-4 w-4 animate-spin" />}Lưu</button>
                    </div>}
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

        {isPreviewOpen && selected && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={event => {
              if (event.target === event.currentTarget) setIsPreviewOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-preview-title"
              className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email Template Preview</p>
                  <h2 id="email-preview-title" className="mt-1 text-lg font-bold text-slate-800">{previewText(selected.subject)}</h2>
                  <p className="mt-1 text-xs text-slate-500">Các biến mẫu được thay bằng dữ liệu minh họa, không gửi email thật.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  aria-label="Đóng xem trước email"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
                <iframe
                  title="Nội dung xem trước email"
                  sandbox=""
                  srcDoc={buildPreviewDocument(selected.subject, selected.content)}
                  className="h-[min(65vh,620px)] w-full rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <footer className="flex justify-end border-t border-slate-100 px-6 py-4">
                <button type="button" onClick={() => setIsPreviewOpen(false)} className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Đóng</button>
              </footer>
            </section>
          </div>
        )}

        {isCreateTemplateOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={event => {
              if (event.target === event.currentTarget) closeCreateTemplateModal();
            }}
          >
            <form
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-template-title"
              onSubmit={confirmCreateTemplate}
              className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
            >
              <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 id="create-template-title" className="text-lg font-bold text-slate-800">Tạo email template mới</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Nhập thông tin cơ bản trước khi soạn nội dung email.</p>
                </div>
                <button
                  type="button"
                  onClick={closeCreateTemplateModal}
                  aria-label="Đóng popup tạo email template"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="space-y-5 px-6 py-5">
                <label className="block text-[13px] font-semibold text-slate-700" htmlFor="new-template-subject">
                  Tiêu đề email (Subject) <span className="text-red-500">*</span>
                  <input
                    id="new-template-subject"
                    autoFocus
                    value={newTemplate.subject}
                    onChange={event => updateNewTemplate('subject', event.target.value)}
                    maxLength={255}
                    aria-invalid={Boolean(createTemplateErrors.subject)}
                    aria-describedby={createTemplateErrors.subject ? 'new-template-subject-error' : undefined}
                    placeholder="VD: Xác nhận ứng tuyển vị trí {{jobTitle}}"
                    className={`mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-primary-500 ${createTemplateErrors.subject ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  <span className="mt-1 block text-[11px] font-normal text-slate-400">Tiêu đề hiển thị trong email gửi cho ứng viên.</span>
                  {createTemplateErrors.subject && <span id="new-template-subject-error" className="mt-1 block text-xs font-medium text-red-500">{createTemplateErrors.subject}</span>}
                </label>

                <label className="block text-[13px] font-semibold text-slate-700" htmlFor="new-template-tag">
                  Loại email <span className="text-red-500">*</span>
                  <span className="relative mt-2 block">
                    <select
                      id="new-template-tag"
                      value={newTemplate.tag}
                      onChange={event => updateNewTemplate('tag', event.target.value as EmailTag | '')}
                      aria-invalid={Boolean(createTemplateErrors.tag)}
                      aria-describedby={createTemplateErrors.tag ? 'new-template-tag-error' : undefined}
                      className={`w-full appearance-none rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-primary-500 ${createTemplateErrors.tag ? 'border-red-400' : 'border-slate-200'}`}
                    >
                      <option value="" disabled>Chọn loại email</option>
                      {emailTagOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </span>
                  {createTemplateErrors.tag && <span id="new-template-tag-error" className="mt-1 block text-xs font-medium text-red-500">{createTemplateErrors.tag}</span>}
                </label>

                <label className="block text-[13px] font-semibold text-slate-700" htmlFor="new-template-name">
                  Tên email <span className="text-red-500">*</span>
                  <input
                    id="new-template-name"
                    value={newTemplate.title}
                    onChange={event => updateNewTemplate('title', event.target.value)}
                    maxLength={120}
                    aria-invalid={Boolean(createTemplateErrors.title)}
                    aria-describedby={createTemplateErrors.title ? 'new-template-name-error' : undefined}
                    placeholder="VD: Xác nhận nhận hồ sơ"
                    className={`mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-primary-500 ${createTemplateErrors.title ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  <span className="mt-1 block text-[11px] font-normal text-slate-400">Tên nội bộ để nhận diện template trong danh sách.</span>
                  {createTemplateErrors.title && <span id="new-template-name-error" className="mt-1 block text-xs font-medium text-red-500">{createTemplateErrors.title}</span>}
                </label>
              </div>

              <footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <button type="button" onClick={closeCreateTemplateModal} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                  Huỷ
                </button>
                <button type="submit" className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-colors hover:bg-blue-700">
                  Xác nhận và soạn nội dung
                </button>
              </footer>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

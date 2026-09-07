import {useState} from 'react';
import {z} from 'zod';
export const passwordSchema=z.string().min(8,'Mật khẩu phải có ít nhất 8 ký tự').max(72,'Mật khẩu tối đa 72 ký tự').regex(/[A-Z]/,'Mật khẩu phải có chữ hoa').regex(/[0-9]/,'Mật khẩu phải có chữ số');
export const companySchema=z.object({
 companyName:z.string().trim().min(1,'Vui lòng nhập tên công ty').max(255),
 taxCode:z.string().regex(/^[0-9]{10}(-?[0-9]{3})?$/,'Mã số thuế gồm 10 hoặc 13 chữ số'),
 phone:z.string().regex(/^\+?[0-9][0-9 .()-]{7,19}$/,'Số điện thoại không hợp lệ'),
 address:z.string().trim().min(1,'Vui lòng nhập địa chỉ').max(2000),
 subdomain:z.string().min(1,'Vui lòng nhập subdomain').max(63).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Chỉ dùng chữ thường, số và dấu gạch ngang'),
 industry:z.string().trim().min(1,'Vui lòng nhập ngành nghề').max(255),
 companySize:z.enum(['1-10','11-50','50-100','51-200','201-500','501-1000','1000+','1001+'],{message:'Vui lòng chọn quy mô công ty'}),
 website:z.string().max(255).refine(value=>!value || /^https?:\/\/\S+$/.test(value),'Website phải bắt đầu bằng http:// hoặc https://'),
 description:z.string().trim().min(1,'Vui lòng nhập mô tả công ty').max(5000),
});
export function Field({label,error,type='text',...props}:React.InputHTMLAttributes<HTMLInputElement>&{label:string;error?:string}){
 const [visible,setVisible]=useState(false);
 return <div className="space-y-1"><label className="block text-sm font-medium">{label}{props.required?' *':''}
 <div className="flex gap-2"><input {...props} aria-invalid={!!error} type={type==='password'&&visible?'text':type} className="w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100"/>
 {type==='password'&&<button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Ẩn mật khẩu':'Hiện mật khẩu'}>{visible?'Ẩn':'Hiện'}</button>}</div></label>
 {error&&<p className="text-sm text-red-600" role="alert">{error}</p>}</div>;
}
export const buttonClass='rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-50';
export function Confirm({text,onConfirm,onCancel,busy=false}:{text:string;onConfirm:()=>void;onCancel:()=>void;busy?:boolean}){
 return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div role="dialog" aria-modal="true" aria-label="Xác nhận thao tác" className="max-w-lg space-y-5 rounded-xl bg-white p-6"><p>{text}</p><button disabled={busy} onClick={onConfirm} className={buttonClass}>Xác nhận</button><button disabled={busy} onClick={onCancel} className="ml-4">Hủy</button></div></div>;
}

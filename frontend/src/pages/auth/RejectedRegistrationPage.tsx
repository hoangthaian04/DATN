import {useEffect,useState} from 'react';
import {AuthService} from '@/services/auth.service';
import {useAuth} from '@/contexts/AuthContext';
import {useNavigate} from 'react-router-dom';
import {Field,Confirm,buttonClass} from '@/components/auth/FormFields';
import {errorMessage} from '@/services/api';
import type {CompanyDetail,RegistrationUpdate} from '@/types/auth.types';
import {z} from 'zod';
const registrationUpdateSchema=z.object({
 companyName:z.string().trim().min(1,'Vui lòng nhập tên công ty').max(255),
 taxCode:z.string().regex(/^[0-9]{10}(-?[0-9]{3})?$/,'Mã số thuế gồm 10 hoặc 13 chữ số'),
 phone:z.string().regex(/^\+?[0-9][0-9 .()-]{7,19}$/,'Số điện thoại không hợp lệ'),
 address:z.string().trim().min(1,'Vui lòng nhập địa chỉ').max(2000),
 subdomain:z.string().min(1,'Vui lòng nhập subdomain').max(63).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Subdomain không hợp lệ'),
});
export const RejectedRegistrationPage=()=>{
 const [company,setCompany]=useState<CompanyDetail>(),[form,setForm]=useState<RegistrationUpdate>({companyName:'',taxCode:'',phone:'',address:'',subdomain:''});
 const [edit,setEdit]=useState(false),[confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[errors,setErrors]=useState<Record<string,string>>({});
 const {refreshUser,logout}=useAuth(),navigate=useNavigate();
 useEffect(()=>{AuthService.getCompany().then(c=>{setCompany(c);setForm({companyName:c.name,taxCode:c.taxCode||'',phone:c.phone||'',address:c.address||'',subdomain:c.subdomain||''});}).catch(e=>setError(errorMessage(e)));},[]);
 const submit=async()=>{setBusy(true);try{await AuthService.resubmit(form);await refreshUser();navigate('/pending',{replace:true});}catch(e){setError(errorMessage(e));setConfirm(false);}finally{setBusy(false);}};
 return <main className="max-w-2xl mx-auto p-8 space-y-5"><h1 className="text-2xl font-bold">Hồ sơ doanh nghiệp bị từ chối</h1>
 <p>{company?.name}</p><p>Lý do: {company?.rejectedReason}</p><p>Email đăng nhập: {company?.email}</p>
 {error&&<p role="alert" className="text-red-600">{error}</p>}
 {edit?<form className="space-y-4" onSubmit={e=>{e.preventDefault();const result=registrationUpdateSchema.safeParse(form);if(!result.success){setErrors(Object.fromEntries(result.error.issues.map(i=>[String(i.path[0]),i.message])));return;}setErrors({});setConfirm(true);}}>
 {(['companyName','taxCode','phone','address','subdomain'] as const).map((key,i)=><Field key={key} label={['Tên công ty','Mã số thuế','Số điện thoại','Địa chỉ','Subdomain'][i]} required error={errors[key]} value={form[key]} disabled={key==='taxCode'&&!/thuế|mst|tax/i.test(company?.rejectedReason||'')} onChange={e=>setForm({...form,[key]:e.target.value})}/>)}
 <button className={buttonClass}>Xác nhận gửi lại</button><button type="button" className="ml-4" onClick={()=>setEdit(false)}>Hủy chỉnh sửa</button>
 </form>:<button className={buttonClass} disabled={!company} onClick={()=>setEdit(true)}>Chỉnh sửa & gửi lại hồ sơ</button>}
 <button className="block" disabled={busy} onClick={async()=>{try{await logout();navigate('/login',{replace:true});}catch(e){setError(errorMessage(e));}}}>Đăng xuất</button>
 {confirm&&<Confirm busy={busy} text="Bạn sắp gửi lại hồ sơ đăng ký. Hồ sơ sẽ vào hàng chờ xem xét của Admin." onConfirm={()=>void submit()} onCancel={()=>setConfirm(false)}/>}
 </main>;
};

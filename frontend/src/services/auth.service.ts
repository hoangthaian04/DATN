import api, {clearCsrf} from './api';
import type {BaseResponse} from '@/types/api.types';
import type {User,LoginRequest,LoginResponse,RegisterRequest,OnboardingRequest,CompanyDetail,PasswordResetRequest,PasswordChangeRequest,RegistrationUpdate} from '@/types/auth.types';
export const AuthService={
 login:async(data:LoginRequest)=>(await api.post<BaseResponse<LoginResponse>>('/auth/login',data)).data.data,
 adminLogin:async(data:LoginRequest)=>(await api.post<BaseResponse<LoginResponse>>('/admin/auth/login',data)).data.data,
 register:async(data:RegisterRequest)=>{await api.post('/auth/register',data);return AuthService.getMe();},
 getMe:async():Promise<User>=>(await api.get<BaseResponse<User>>('/auth/me')).data.data,
 getCompany:async()=>(await api.get<BaseResponse<CompanyDetail>>('/companies/me')).data.data,
 onboarding:async(data:OnboardingRequest)=>(await api.patch<BaseResponse<CompanyDetail>>('/company-profiles/me',data)).data.data,
 uploadLogo:async(file:File)=>{const body=new FormData();body.append('file',file);return (await api.post<BaseResponse<CompanyDetail>>('/company-profiles/me/logo',body)).data.data;},
 resubmit:async(data:RegistrationUpdate)=>(await api.post<BaseResponse<CompanyDetail>>('/companies/me/resubmit',data)).data.data,
 logout:async()=>{await api.post('/auth/logout');clearCsrf();window.dispatchEvent(new Event('auth:expired'));},
 forgotPassword:async(data:{email:string})=>{await api.post('/auth/forgot-password',data);},
 verifyOtp:async(data:{email:string;otp:string})=>(await api.post<BaseResponse<{resetToken:string;expiresInSeconds:number}>>('/auth/verify-otp',data)).data.data,
 resetPassword:async(data:PasswordResetRequest)=>{await api.post('/auth/reset-password',data);},
 changePassword:async(data:PasswordChangeRequest)=>{await api.post('/auth/change-password',data);}
};

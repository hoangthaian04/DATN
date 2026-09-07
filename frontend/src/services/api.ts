import axios from 'axios';
import type { BaseResponse } from '@/types/api.types';
const baseURL=import.meta.env.VITE_API_URL || '/api/v1';
const transport=axios.create({baseURL,withCredentials:true});
export const api=axios.create({baseURL,withCredentials:true});
let csrf: Promise<string> | undefined;
let refreshing: Promise<void> | undefined;
export function clearCsrf(){csrf=undefined;}
async function csrfToken(){
 csrf ??= transport.get<BaseResponse<{token:string}>>('/auth/csrf').then(r=>r.data.data.token).catch(e=>{csrf=undefined;throw e;});
 return csrf;
}
api.interceptors.request.use(async config=>{
 if(!['get','head','options'].includes(config.method || 'get'))config.headers.set('X-XSRF-TOKEN',await csrfToken());
 return config;
});
api.interceptors.response.use(r=>r,async error=>{
 const req=error.config;
 error.customMessage=error.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.';
 if(!req)throw error;
 if(error.response?.status===403 && !req._csrfRetry && error.customMessage.includes('CSRF')){
  req._csrfRetry=true;clearCsrf();return api(req);
 }
 const publicAuth=/\/(?:auth\/(?:login|register|google|forgot-password|verify-otp|reset-password|refresh|logout))$/.test(req.url || '');
 if(error.response?.status===401 && !publicAuth && !req._retry){
  req._retry=true;
  try {
   refreshing ??= csrfToken().then(token=>transport.post('/auth/refresh',{}, {headers:{'X-XSRF-TOKEN':token}})).then(()=>{}).finally(()=>{refreshing=undefined;});
   await refreshing;
   return api(req);
  }catch{
   window.dispatchEvent(new Event('auth:expired'));
   const protectedPage=/^\/(dashboard|admin(?!\/login)|onboarding|pending|registration)/.test(window.location.pathname);
   if(protectedPage)window.location.replace(window.location.pathname.startsWith('/admin')?'/admin/login?reason=session-expired':'/login?reason=session-expired');
  }
 }
 throw error;
});
export default api;
export function errorMessage(error:unknown){return axios.isAxiosError(error)?error.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.':'Có lỗi xảy ra. Vui lòng thử lại.';}

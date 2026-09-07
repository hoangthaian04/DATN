import {Navigate,useLocation} from 'react-router-dom';
import {useAuth} from '@/contexts/AuthContext';
import type {User,UserRole} from '@/types/auth.types';
export function getPostLoginPath(user:User):string{
 if(user.status==='BLOCKED'||user.status==='INACTIVE'||user.companyStatus==='BLOCKED')return '/403';
 if(user.role==='ADMIN')return user.status==='ACTIVE'?'/admin/dashboard':'/403';
 if(user.companyStatus==='PENDING')return '/pending';
 if(user.companyStatus==='REJECTED')return '/registration/rejected';
 if(user.status!=='ACTIVE'||user.companyStatus!=='ACTIVE')return '/403';
 return user.onboardingCompleted?'/dashboard':'/onboarding';
}
export function PublicOnlyRoute({children}:{children:React.ReactNode}){
 const {user,isLoading}=useAuth();
 if(isLoading)return <p role="status">Đang kiểm tra phiên đăng nhập…</p>;
 return user?<Navigate to={getPostLoginPath(user)} replace/>:<>{children}</>;
}
export function PrivateRoute({children,role,redirectTo='/login',restricted=false}:{children:React.ReactNode;role?:UserRole;redirectTo?:string;restricted?:boolean}){
 const {user,isLoading}=useAuth();const location=useLocation();
 if(isLoading)return <p role="status">Đang kiểm tra phiên đăng nhập…</p>;
 if(!user)return <Navigate to={redirectTo} replace/>;
 const target=getPostLoginPath(user);
 if(role==='ADMIN'&&user.role!=='ADMIN'||role==='HR'&&user.role==='ADMIN')return <Navigate to={target} replace/>;
 if(target==='/403')return <Navigate to="/403" replace/>;
 if(user.role!=='ADMIN'){
  if(restricted && location.pathname!==target)return <Navigate to={target} replace/>;
  if(!restricted && target!=='/dashboard')return <Navigate to={target} replace/>;
 }
 return <>{children}</>;
}

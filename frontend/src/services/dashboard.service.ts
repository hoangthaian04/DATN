import api from './api';
import type {BaseResponse} from '@/types/api.types';
import type {DashboardOverviewResponse} from '@/types/dashboard.types';
export interface DashboardStats {totalApplications:number;processingApplications:number;passedApplications:number;rejectedApplications:number;conversionRate:number;averageHiringDays:number;totalActiveJobs:number;newApplications:number;upcomingInterviews:number;hireRate:number;}
export interface ChartData {range:string;metric:string;points:{label:string;value:number}[];}
export interface TopJobs {items:{id:number;title:string;department:string;location:string;applicationCount:number;status:string}[];total:number;}
export interface Todo {type:string;title:string;referenceId:number;createdAt:string;}
async function get<T>(url:string,range:string){return (await api.get<BaseResponse<T>>(url,{params:{range}})).data.data;}
export const dashboardService={
 getStats:(range:string)=>get<DashboardStats>('/dashboard/stats',range),
 getCharts:(range:string)=>get<ChartData>('/dashboard/charts',range),
 getTopJobs:(range:string)=>get<TopJobs>('/dashboard/top-jobs',range),
 getTodos:()=>get<Todo[]>('/dashboard/todos','30d'),
 getOverview:async(range:string):Promise<DashboardOverviewResponse>=>{
  const [stats,charts,topJobs]=await Promise.all([
   get<DashboardStats>('/dashboard/stats',range),
   get<ChartData>('/dashboard/charts',range),
   get<TopJobs>('/dashboard/top-jobs',range)
  ]);
  return {
   stats:{
    totalApplicants:stats.totalApplications,
    processingApplicants:stats.processingApplications,
    passedApplicants:stats.passedApplications,
    failedApplicants:stats.rejectedApplications
   },
   chartData:charts.points.map(point=>({date:point.label,count:point.value})),
   effectiveness:{
    conversionRate:stats.conversionRate,
    avgHireTimeDays:stats.averageHiringDays,
    topSource:'Website',
    offerAcceptanceRate:92
   },
   topJobs:topJobs.items.map(job=>({
    title:job.title,
    department:job.department,
    location:job.location,
    applicationsCount:job.applicationCount,
    status:job.status
   }))
  };
 }
};

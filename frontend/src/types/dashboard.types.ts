export interface TopStats {
  totalApplicants: number;
  processingApplicants: number;
  passedApplicants: number;
  failedApplicants: number;
}

export interface ChartData {
  date: string;
  count: number;
}

export interface Effectiveness {
  conversionRate: number;
  avgHireTimeDays: number;
  topSource: string;
  offerAcceptanceRate: number;
}

export interface TopJob {
  title: string;
  department: string;
  location: string;
  applicationsCount: number;
  status: string;
}

export interface DashboardOverviewResponse {
  stats: TopStats;
  chartData: ChartData[];
  effectiveness: Effectiveness;
  topJobs: TopJob[];
}

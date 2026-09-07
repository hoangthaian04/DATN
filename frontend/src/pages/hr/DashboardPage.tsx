import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboard.service';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardOverviewResponse } from '@/types/dashboard.types';
import type { CompanyDetail } from '@/types/auth.types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [companyLoaded, setCompanyLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range] = useState('6m');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getOverview(range);
        if (response) {
          setData(response);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  useEffect(() => {
    let active = true;
    AuthService.getCompany()
      .then((response) => {
        if (active) setCompany(response);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setCompanyLoaded(true);
      });
    return () => { active = false; };
  }, []);

  if (loading || !data) {
    return <div className="flex-1 p-8 bg-[#F8FAFC] min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Calculate SVG Chart Points
  const maxVal = Math.max(400, ...(data.chartData?.map(d => d.count) || []));
  const svgHeight = 170; // From y=30 to y=200
  const startY = 200;
  
  const points = (data.chartData || []).map((d, i) => {
    const x = 80 + i * 170;
    const y = startY - (d.count / maxVal) * svgHeight;
    return { x, y, label: d.date, count: d.count };
  });
  
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const polygonPoints = `80,200 ${polylinePoints} 930,200`;
  const completedSteps = company?.profile?.completedSteps ?? 0;
  const needsProfileReminder = companyLoaded && (user?.profileCompleted === false || completedSteps < 3);

  return (
    <div className="flex-1 p-8 bg-[#F8FAFC] min-h-screen">
      {needsProfileReminder && (
        <div className="mb-6 max-w-[1440px] mx-auto rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 text-sm font-bold">
                <span>Hồ sơ doanh nghiệp chưa hoàn thiện</span>
                <span className="shrink-0">{completedSteps}/3 bước</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, (completedSteps / 3) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-amber-800">Hãy bổ sung thông tin còn thiếu để Career Site hiển thị đầy đủ.</p>
            </div>
            <Link to="/dashboard/settings/company" className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700">
              Hoàn thiện hồ sơ công ty
            </Link>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tổng quan tuyển dụng</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            6 tháng qua
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-primary-600 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-[13px] font-bold">Tổng số ứng viên</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-3">{data.stats.totalApplicants}</div>
              <div className="flex items-center text-emerald-500 text-[11px] font-bold">
                18% <span className="text-slate-400 ml-1 font-semibold">so với 6 tháng trước</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative">
            <div className="flex justify-between items-start">
              <span className="text-slate-800 text-[13px] font-bold">Đang xử lý</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-5 mt-1">{data.stats.processingApplicants}</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${data.stats.totalApplicants > 0 ? (data.stats.processingApplicants / data.stats.totalApplicants) * 100 : 0}%` }}></div>
              </div>
              <div className="text-[11px] font-bold text-blue-600"><span className="text-slate-400 font-semibold mr-1">{data.stats.totalApplicants > 0 ? Math.round((data.stats.processingApplicants / data.stats.totalApplicants) * 100) : 0}%</span> tổng ứng viên</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative">
            <div className="flex justify-between items-start">
              <span className="text-slate-800 text-[13px] font-bold">Đạt</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-5 mt-1">{data.stats.passedApplicants}</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${data.stats.totalApplicants > 0 ? (data.stats.passedApplicants / data.stats.totalApplicants) * 100 : 0}%` }}></div>
              </div>
              <div className="text-[11px] font-bold text-blue-600"><span className="text-slate-400 font-semibold mr-1">{data.stats.totalApplicants > 0 ? Math.round((data.stats.passedApplicants / data.stats.totalApplicants) * 100) : 0}%</span> tổng ứng viên</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative">
            <div className="flex justify-between items-start">
              <span className="text-slate-800 text-[13px] font-bold">Không đạt</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-5 mt-1">{data.stats.failedApplicants}</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${data.stats.totalApplicants > 0 ? (data.stats.failedApplicants / data.stats.totalApplicants) * 100 : 0}%` }}></div>
              </div>
              <div className="text-[11px] font-bold text-blue-600"><span className="text-slate-400 font-semibold mr-1">{data.stats.totalApplicants > 0 ? Math.round((data.stats.failedApplicants / data.stats.totalApplicants) * 100) : 0}%</span> tổng ứng viên</div>
            </div>
          </div>
        </div>

        {/* Middle Row: Chart & Effectiveness */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-extrabold text-slate-800">Xu hướng ứng tuyển</h3>
                <p className="text-slate-400 text-xs font-semibold mt-1">Số lượng ứng tuyển trong 6 tháng gần nhất</p>
              </div>
              <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg flex items-center border border-emerald-100">
                18%
              </div>
            </div>
            
            {/* Custom SVG Area Chart to match design closely */}
            <div className="flex-1 min-h-[260px] relative w-full mt-2 flex flex-col">
              {/* Y Axis Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-8 text-[11px] text-slate-400 font-semibold">
                <div className="flex items-center gap-4"><span className="w-6 text-right">{maxVal}</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
                <div className="flex items-center gap-4"><span className="w-6 text-right">{Math.round(maxVal * 0.75)}</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
                <div className="flex items-center gap-4"><span className="w-6 text-right">{Math.round(maxVal * 0.5)}</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
                <div className="flex items-center gap-4"><span className="w-6 text-right">{Math.round(maxVal * 0.25)}</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
                <div className="flex items-center gap-4"><span className="w-6 text-right">0</span><div className="flex-1 border-b border-slate-100"></div></div>
              </div>

              {/* Chart SVG */}
              <div className="absolute inset-0 pl-10 pb-8 pt-2">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  {/* Area */}
                  {points.length > 0 && <polygon points={polygonPoints} fill="url(#blueGradient)" />}
                  {/* Line */}
                  {points.length > 0 && <polyline points={polylinePoints} fill="none" stroke="#3B82F6" strokeWidth="2.5" />}
                  
                  {/* Data Points */}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3B82F6" className={i === 0 ? "ring-4 ring-white" : ""} />
                  ))}
                </svg>
              </div>

              {/* X Axis Labels & Tooltips */}
              <div className="absolute inset-0 pl-10 pt-2 pb-0">
                <div className="w-full h-full relative">
                  {points.map((p, i) => {
                    const leftPct = (p.x / 1000) * 100;
                    const topPct = (p.y / 200) * 100;
                    return (
                      <React.Fragment key={i}>
                        <div className="absolute bottom-0 -translate-x-1/2 text-[11px] font-bold text-slate-400" style={{ left: `${leftPct}%` }}>{p.label}</div>
                        <div className="absolute -translate-x-1/2 text-[11px] font-extrabold text-slate-800 bg-white/80 px-1.5 rounded" style={{ left: `${leftPct}%`, top: `calc(${topPct}% - 24px)` }}>{p.count}</div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Effectiveness Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-extrabold text-slate-800">Hiệu quả tuyển dụng</h3>
              <Link to="/dashboard" className="text-blue-500 text-xs font-bold flex items-center hover:underline">
                Xem chi tiết
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Card 1 */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-white shadow-sm relative">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Tỷ lệ chuyển đổi</div>
                <div className="text-2xl font-extrabold text-slate-900 mb-1">{data.effectiveness.conversionRate}%</div>
                <div className="text-[10px] text-slate-400 font-semibold">Ứng viên → Phỏng vấn</div>
              </div>
              
              {/* Card 2 */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-white shadow-sm relative">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Thời gian tuyển dụng TB</div>
                <div className="text-2xl font-extrabold text-slate-900 mb-1">{data.effectiveness.avgHireTimeDays} ngày</div>
                <div className="text-[10px] text-slate-400 font-semibold">Giảm 15% so với kỳ trước</div>
              </div>

              {/* Card 3 */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-white shadow-sm relative">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Nguồn ứng viên hiệu quả</div>
                <div className="text-lg font-extrabold text-slate-900 mb-1 leading-tight mt-1">{data.effectiveness.topSource}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">42% tổng ứng viên</div>
              </div>

              {/* Card 4 */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-white shadow-sm relative">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Tỷ lệ chấp nhận offer</div>
                <div className="text-2xl font-extrabold text-slate-900 mb-1">{data.effectiveness.offerAcceptanceRate}%</div>
                <div className="text-[10px] text-slate-400 font-semibold">Tăng 8% so với kỳ trước</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="w-full mb-8">
          {/* Top Jobs Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-extrabold text-slate-800">Tin tuyển dụng nổi bật</h3>
              <Link to="/dashboard/jobs" className="text-blue-500 text-xs font-bold flex items-center hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 font-semibold">Vị trí tuyển dụng</th>
                    <th className="px-4 py-3 font-semibold">Phòng ban</th>
                    <th className="px-4 py-3 font-semibold">Địa điểm</th>
                    <th className="px-4 py-3 font-semibold">Ứng viên</th>
                    <th className="py-3 font-semibold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.topJobs.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                         <div className="flex items-center gap-3">
                           <div className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                             {row.title}
                             {idx === 0 && <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-blue-50 border border-blue-100 text-blue-600 font-extrabold tracking-widest">Featured</span>}
                           </div>
                         </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-500">{row.department}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-500">{row.location}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.applicationsCount}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center text-[10px] font-extrabold ${row.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {row.status === 'ACTIVE' ? 'Đang mở' : 'Đóng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';


export const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="mb-8 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tổng quan tuyển dụng</h2>
          <p className="text-sm text-slate-500 font-semibold mt-1">Cập nhật dữ liệu đến 20/06/2025, 09:30 AM</p>
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
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-3">1.284</div>
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
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-5 mt-1">312</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
              </div>
              <div className="text-[11px] font-bold text-blue-600"><span className="text-slate-400 font-semibold mr-1">24%</span> tổng ứng viên</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative">

            <div className="flex justify-between items-start">
              <span className="text-slate-800 text-[13px] font-bold">Đạt</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-5 mt-1">487</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '38%' }}></div>
              </div>
              <div className="text-[11px] font-bold text-blue-600"><span className="text-slate-400 font-semibold mr-1">38%</span> tổng ứng viên</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative">

            <div className="flex justify-between items-start">
              <span className="text-slate-800 text-[13px] font-bold">Không đạt</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-5 mt-1">485</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '38%' }}></div>
              </div>
              <div className="text-[11px] font-bold text-blue-600"><span className="text-slate-400 font-semibold mr-1">38%</span> tổng ứng viên</div>
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
                <div className="flex items-center gap-4"><span className="w-6 text-right">400</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
                <div className="flex items-center gap-4"><span className="w-6 text-right">300</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
                <div className="flex items-center gap-4"><span className="w-6 text-right">200</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
                <div className="flex items-center gap-4"><span className="w-6 text-right">100</span><div className="flex-1 border-b border-dashed border-slate-100"></div></div>
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
                  <polygon points="80,200 80,129 250,101 420,112 590,80 760,55 930,30 930,200" fill="url(#blueGradient)" />
                  {/* Line */}
                  <polyline points="80,129 250,101 420,112 590,80 760,55 930,30" fill="none" stroke="#3B82F6" strokeWidth="2.5" />
                  
                  {/* Data Points */}
                  <circle cx="80" cy="129" r="4" fill="#3B82F6" className="ring-4 ring-white" />
                  <circle cx="250" cy="101" r="4" fill="#3B82F6" />
                  <circle cx="420" cy="112" r="4" fill="#3B82F6" />
                  <circle cx="590" cy="80" r="4" fill="#3B82F6" />
                  <circle cx="760" cy="55" r="4" fill="#3B82F6" />
                  <circle cx="930" cy="30" r="4" fill="#3B82F6" />
                </svg>
              </div>

              {/* X Axis Labels & Tooltips */}
              <div className="absolute inset-0 pl-10 pt-2 pb-0">
                <div className="w-full h-full relative">
                   {/* T1 */}
                   <div className="absolute bottom-0 left-[8%] -translate-x-1/2 text-[11px] font-bold text-slate-400">T1</div>
                   <div className="absolute bottom-[40%] left-[8%] -translate-x-1/2 text-[11px] font-extrabold text-slate-800 bg-white/80 px-1.5 rounded">142</div>
                   {/* T2 */}
                   <div className="absolute bottom-0 left-[25%] -translate-x-1/2 text-[11px] font-bold text-slate-400">T2</div>
                   <div className="absolute bottom-[54%] left-[25%] -translate-x-1/2 text-[11px] font-extrabold text-slate-800 bg-white/80 px-1.5 rounded">198</div>
                   {/* T3 */}
                   <div className="absolute bottom-0 left-[42%] -translate-x-1/2 text-[11px] font-bold text-slate-400">T3</div>
                   <div className="absolute bottom-[48%] left-[42%] -translate-x-1/2 text-[11px] font-extrabold text-slate-800 bg-white/80 px-1.5 rounded">176</div>
                   {/* T4 */}
                   <div className="absolute bottom-0 left-[59%] -translate-x-1/2 text-[11px] font-bold text-slate-400">T4</div>
                   <div className="absolute bottom-[64%] left-[59%] -translate-x-1/2 text-[11px] font-extrabold text-slate-800 bg-white/80 px-1.5 rounded">240</div>
                   {/* T5 */}
                   <div className="absolute bottom-0 left-[76%] -translate-x-1/2 text-[11px] font-bold text-slate-400">T5</div>
                   <div className="absolute bottom-[76%] left-[76%] -translate-x-1/2 text-[11px] font-extrabold text-slate-800 bg-white/80 px-1.5 rounded">289</div>
                   {/* T6 */}
                   <div className="absolute bottom-0 left-[93%] -translate-x-1/2 text-[11px] font-bold text-slate-400">T6</div>
                   <div className="absolute bottom-[89%] left-[93%] -translate-x-1/2 text-[11px] font-extrabold text-slate-800 bg-white/80 px-1.5 rounded">339</div>
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
                <div className="text-2xl font-extrabold text-slate-900 mb-1">38%</div>
                <div className="text-[10px] text-slate-400 font-semibold">Ứng viên → Phỏng vấn</div>
              </div>
              
              {/* Card 2 */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-white shadow-sm relative">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Thời gian tuyển dụng TB</div>
                <div className="text-2xl font-extrabold text-slate-900 mb-1">21 ngày</div>
                <div className="text-[10px] text-slate-400 font-semibold">Giảm 15% so với kỳ trước</div>
              </div>

              {/* Card 3 */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-white shadow-sm relative">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Nguồn ứng viên hiệu quả</div>
                <div className="text-lg font-extrabold text-slate-900 mb-1 leading-tight mt-1">Website</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">42% tổng ứng viên</div>
              </div>

              {/* Card 4 */}
              <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-white shadow-sm relative">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">Tỷ lệ chấp nhận offer</div>
                <div className="text-2xl font-extrabold text-slate-900 mb-1">92%</div>
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
                  {[
                    { title: 'Senior AI Engineer', featured: true, dept: 'AI R&D', loc: 'TP. HCM (Hybrid)', apps: 86, status: 'Đang mở' },
                    { title: 'Product Designer', featured: false, dept: 'Product', loc: 'TP. HCM', apps: 64, status: 'Đang mở' },
                    { title: 'Backend Developer (Java)', featured: false, dept: 'Engineering', loc: 'Hà Nội', apps: 73, status: 'Đang mở' },
                    { title: 'Data Analyst', featured: false, dept: 'Analytics', loc: 'TP. HCM', apps: 58, status: 'Đang mở' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                         <div className="flex items-center gap-3">
                           <div className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                             {row.title}
                             {row.featured && <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-blue-50 border border-blue-100 text-blue-600 font-extrabold tracking-widest">Featured</span>}
                           </div>
                         </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-500">{row.dept}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-500">{row.loc}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.apps}</td>
                      <td className="py-4 text-right">
                        <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-600">
                          Đang mở
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

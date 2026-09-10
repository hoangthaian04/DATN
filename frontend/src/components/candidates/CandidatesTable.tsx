import React from 'react';
import type { ApplicationListDTO } from '../../types/application.types';
import type { BasePagination } from '../../types/api.types';

interface Props {
  pagination?: BasePagination<ApplicationListDTO>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export const CandidatesTable: React.FC<Props> = ({ pagination, isLoading, onPageChange }) => {
  // Hàm mock priority theo mockup
  const getPriorityBadge = (index: number) => {
    if (index % 3 === 0) {
      return (
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">
          Ưu tiên cao
        </span>
      );
    }
    if (index % 3 === 1) {
      return (
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-200">
          Ưu tiên trung bình
        </span>
      );
    }
    return null;
  };

  // Hàm mock progress badge (Đạt X / Y vòng)
  const getProgressBadge = (status: string, index: number) => {
    let text = `Đạt ${index % 4} / 4 vòng`;
    if (status === 'PASSED') text = `Đạt 4 / 4 vòng`;
    
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
        {text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
        <div className="animate-pulse flex flex-col">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 border-b border-slate-100 bg-slate-50/50 m-2 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const apps = pagination?.data || [];

  if (apps.length === 0) {
    return (
      <div className="bg-white border border-slate-100 p-12 text-center shadow-sm rounded-2xl">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <span className="text-2xl font-bold text-slate-300">!</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Không có ứng viên nào</h3>
        <p className="text-slate-500 text-sm font-medium">Chưa có ứng viên nào cho công việc và bộ lọc này.</p>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm border border-slate-100 rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-xs font-extrabold text-slate-500 uppercase tracking-wider select-none">
              <th className="px-6 py-5 w-12 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20 cursor-pointer" />
              </th>
              <th className="px-6 py-5 whitespace-nowrap">Ứng viên</th>
              <th className="px-6 py-5 whitespace-nowrap">Vị trí ứng tuyển</th>
              <th className="px-6 py-5 whitespace-nowrap">Số điện thoại</th>
              <th className="px-6 py-5 whitespace-nowrap">Email</th>
              <th className="px-6 py-5 whitespace-nowrap text-center">Trạng thái</th>
              <th className="px-6 py-5 text-center whitespace-nowrap">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {apps.map((app, index) => (
              <tr 
                key={app.applicationId} 
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20 cursor-pointer" />
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="font-bold text-slate-800 text-sm">
                    {app.fullName}
                  </div>
                  {getPriorityBadge(index)}
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="font-bold text-slate-700 text-sm">
                    {app.jobTitle}
                  </div>
                  <div className="text-slate-400 text-xs mt-1 font-medium">
                    {index % 2 === 0 ? 'TP. HCM' : 'Hà Nội'}
                  </div>
                </td>
                <td className="px-6 py-4 align-top text-slate-800 font-bold text-sm">
                  {app.phone || 'Chưa cập nhật'}
                </td>
                <td className="px-6 py-4 align-top text-slate-500 font-medium text-sm">
                  {app.email}
                </td>
                <td className="px-6 py-4 align-top text-center">
                  {getProgressBadge(app.applicationStatus, index)}
                </td>
                <td className="px-6 py-4 align-top text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => alert(`Xem chi tiết ứng viên: ${app.fullName}`)}
                      className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Xem chi tiết"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => alert(`Xóa ứng viên: ${app.fullName}`)}
                      className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Xóa ứng viên"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 select-none bg-white">
          <span className="text-xs font-semibold text-slate-400">
            Hiển thị <span className="text-slate-600 font-bold">{pagination.current_page}</span> trên <span className="text-slate-600 font-bold">{pagination.last_page}</span> trang 
            (Tổng: {pagination.total} kết quả)
          </span>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className={`px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-all ${
                pagination.current_page === 1 
                  ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              &lt; Trước
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/10 transition-all cursor-default">
              {pagination.current_page}
            </button>
            <button 
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className={`px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-all ${
                pagination.current_page === pagination.last_page 
                  ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              Sau &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

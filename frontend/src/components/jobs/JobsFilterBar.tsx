import React, { useState, useEffect } from 'react';

interface Props {
  onSearch: (keyword: string) => void;
  onFilterStatus: (status: string) => void;
}

export const JobsFilterBar: React.FC<Props> = ({ onSearch, onFilterStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề tin tuyển dụng..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-medium transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Dropdown Selector */}
      <select
        className="w-full sm:w-auto inline-flex items-center justify-between gap-6 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer outline-none focus:border-primary-500"
        onChange={(e) => onFilterStatus(e.target.value)}
        defaultValue=""
      >
        <option value="">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang mở</option>
        <option value="INACTIVE">Bản nháp / Tạm dừng</option>
        <option value="CLOSED">Đã đóng</option>
      </select>
    </div>
  );
};

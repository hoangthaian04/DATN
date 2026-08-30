import React from 'react';
import { Link } from 'react-router-dom';

export const PublicHeader: React.FC = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-800 tracking-tight block">EasyTech</span>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-1 uppercase tracking-wider">EasyTech Platform</span>
          </div>
        </Link>

        {/* Basic Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Trang chủ</Link>
          <a href="#features" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Tính năng</a>
          <a href="#enterprise" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Doanh nghiệp</a>
          <a href="#contact" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Liên hệ</a>
        </nav>

        {/* Support Widget */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trực tuyến</span>
        </div>
      </div>
    </header>
  );
};

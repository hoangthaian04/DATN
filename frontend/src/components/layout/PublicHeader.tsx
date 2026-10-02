import React from 'react';
import { Link } from 'react-router-dom';

export const PublicHeader: React.FC = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/careers" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
            <img src="/logo.png" alt="EasyHire Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-800 tracking-tight block">EasyHire</span>
          </div>
        </Link>

        {/* Basic Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/careers" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Trang chủ</Link>
          <a href="#features" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Tính năng</a>
          <a href="#enterprise" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Doanh nghiệp</a>
          <a href="#contact" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">Liên hệ</a>
        </nav>

      </div>
    </header>
  );
};

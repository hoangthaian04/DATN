import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 py-8 select-none text-slate-400">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side Info */}
        <div className="text-center md:text-left">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            © {new Date().getFullYear()} EasyHire Platform
          </p>
          <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            Nền tảng tuyển dụng EasyHire
          </p>
        </div>

        {/* Right Side Links */}
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider">
          <Link to="/careers" className="hover:text-white transition-colors">Trang tuyển dụng</Link>
          <Link to="/login" className="hover:text-white transition-colors">Đăng nhập HR</Link>
          <a href="mailto:support@easyhire.local" className="hover:text-white transition-colors">Liên hệ hỗ trợ</a>
        </div>
      </div>
    </footer>
  );
};

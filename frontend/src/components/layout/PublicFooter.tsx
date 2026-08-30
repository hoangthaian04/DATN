import React from 'react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 py-8 select-none text-slate-400">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side Info */}
        <div className="text-center md:text-left">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            © {new Date().getFullYear()} EasyTech Platform
          </p>
          <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            Hệ thống quản trị và tự động hóa quy trình tuyển dụng
          </p>
        </div>

        {/* Right Side Links */}
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider">
          <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-white transition-colors">Trung tâm hỗ trợ</a>
        </div>
      </div>
    </footer>
  );
};

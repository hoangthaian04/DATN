import { Outlet } from 'react-router-dom';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicHeader } from '@/components/layout/PublicHeader';

export const CareerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PublicHeader />

      <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
};

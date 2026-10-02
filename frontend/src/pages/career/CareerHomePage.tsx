import { Link } from 'react-router-dom';

export const CareerHomePage: React.FC = () => (
  <section className="flex min-h-[60vh] items-center justify-center py-12">
    <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Career Site EasyHire</h1>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        Dành cho nhà tuyển dụng
      </Link>
    </div>
  </section>
);

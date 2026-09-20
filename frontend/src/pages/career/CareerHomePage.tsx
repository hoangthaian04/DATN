import { BriefcaseBusiness, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CareerHomePage: React.FC = () => (
  <section className="flex min-h-[60vh] items-center justify-center py-12">
    <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <BriefcaseBusiness className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">Career Site EasyHire</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Hãy mở đường dẫn Career Site của doanh nghiệp để xem các vị trí đang tuyển dụng.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        Dành cho nhà tuyển dụng
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  </section>
);

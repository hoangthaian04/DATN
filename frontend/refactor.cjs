const fs = require('fs');

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports
  content = content.replace(
    /import \{ Link, useParams \} from 'react-router-dom';/,
    `import { Link, useParams } from 'react-router-dom';\nimport { useQuery } from '@tanstack/react-query';\nimport { publicService } from '../../services/public.service';\nimport { Loader2 } from 'lucide-react';`
  );

  // Remove constants
  content = content.replace(/const COMPANY = \{[\s\S]*?\};\n\nconst JOBS = \[[\s\S]*?\];\n\n/, '');

  // Add hooks
  content = content.replace(
    /const \{ companySlug \} = useParams<\s*\{\s*companySlug:\s*string\s*\}\s*>\(\);\s*const \[search, setSearch\] = useState\(''\);\s*const \[activeTab, setActiveTab\] = useState\<'overview' \| 'jobs' \| 'about'\>\('overview'\);\s*const filteredJobs = JOBS.filter\(\(job\) =>/m,
    `const { companySlug } = useParams<{ companySlug: string }>();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'about'>('overview');

  const { data: COMPANY, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['public-company', companySlug],
    queryFn: () => publicService.getCompanySite(companySlug as string),
    enabled: !!companySlug,
  });

  const { data: JOBS = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['public-jobs', companySlug],
    queryFn: () => publicService.getCompanyJobs(companySlug as string),
    enabled: !!companySlug,
  });

  if (isLoadingCompany || isLoadingJobs) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!COMPANY) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy công ty</h1>
      </div>
    );
  }

  const filteredJobs = JOBS.filter((job) =>`
  );

  fs.writeFileSync(filePath, content);
}

refactorFile('e:/DATN/DATN/frontend/src/pages/career/CompanyCareerSitePage.tsx');

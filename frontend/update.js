const fs = require('fs');
const file = 'src/pages/auth/OnboardingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "compact ? 'gap-[18px] lg:grid-cols-[205px_minmax(0,1fr)]'",
  "compact ? 'gap-6 lg:grid-cols-[260px_minmax(0,1fr)]'"
);

content = content.replace(
  "compact ? 'rounded-xl border border-slate-200 bg-white p-[15px] text-left shadow-sm shadow-slate-200/20'",
  "compact ? 'rounded-2xl bg-white p-6 text-left shadow-sm'"
);

content = content.replace(
  "compact ? 'mb-4 text-[10px] font-medium uppercase tracking-wide text-slate-600'",
  "compact ? 'mb-6 text-xs font-bold uppercase tracking-widest text-slate-500'"
);

content = content.replace(
  "compact ? 'space-y-5'",
  "compact ? 'space-y-6'"
);

content = content.replace(
  "compact ? 'flex items-center gap-2.5 text-left w-full cursor-pointer'",
  "compact ? 'flex items-center gap-4 text-left w-full cursor-pointer'"
);

content = content.replace(
  "compact ? 'h-5 w-5 text-[9px]'",
  "compact ? 'h-7 w-7 text-xs'"
);

content = content.replace(
  "bg-[#0052cc]",
  "bg-[#2563eb]"
);

content = content.replace(
  "compact ? 'text-[9px] font-medium text-slate-600' : 'block text-xs font-bold text-slate-800 uppercase tracking-wider'",
  "compact ? `block text-xs font-bold uppercase tracking-wider ${currentStep === item.step ? 'text-slate-800' : 'text-slate-500'}` : 'block text-xs font-bold text-slate-800 uppercase tracking-wider'"
);

// Form section container
content = content.replace(
  "compact ? 'rounded-xl border border-slate-200 bg-white p-[22px] shadow-sm shadow-slate-200/20'",
  "compact ? 'rounded-2xl border border-slate-100 bg-white p-8 shadow-sm'"
);

content = content.replace(
  "compact ? 'mb-5 flex items-center justify-between'",
  "compact ? 'mb-8 flex items-center justify-between'"
);

content = content.replace(
  "text-lg font-bold text-slate-800 tracking-tight",
  "text-xl font-bold text-slate-800 tracking-tight"
);

content = content.replace(
  "compact ? 'h-4 w-4'",
  "compact ? 'h-5 w-5'"
);

content = content.replace(
  "compact ? 'space-y-4 text-left' : 'space-y-6 text-left'",
  "'space-y-6 text-left'"
);

content = content.replace(
  "compact ? 'space-y-3.5' : 'space-y-6'",
  "'space-y-6'"
);

// Form labels
content = content.replace(
  /compact \? 'text-\[9px\] font-semibold uppercase tracking-normal text-slate-600' : 'text-xs font-bold text-slate-700 uppercase tracking-wider'/g,
  "'text-[11px] font-extrabold text-slate-700 uppercase tracking-wider'"
);
content = content.replace(
  /compact \? 'text-\[10px\] font-semibold uppercase tracking-normal text-slate-600' : 'text-xs font-bold text-slate-700 uppercase tracking-wider'/g,
  "'text-[11px] font-extrabold text-slate-700 uppercase tracking-wider'"
);

// Logo section
content = content.replace(
  "compact ? 'flex items-center gap-2' : 'flex items-center gap-6'",
  "'flex items-center gap-4'"
);

content = content.replace(
  /compact \? 'h-\[35px\] w-\[45px\] rounded-md' : 'h-16 w-16 rounded-xl'/g,
  "'h-16 w-16 rounded-xl'"
);

content = content.replace(
  "compact ? 'rounded-md px-3 py-2 text-[9px] font-medium' : 'px-4 py-2.5 rounded-xl text-xs font-bold'",
  "'flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13px] font-medium cursor-pointer transition-colors'"
);

content = content.replace(
  "compact ? 'h-3 w-3' : 'h-4 w-4'",
  "'h-4 w-4'"
);
content = content.replace(
  "<span className=\"flex items-center gap-1.5\">",
  ""
);
content = content.replace(
  "Tải ảnh lên\n                        </span>",
  "Tải ảnh lên"
);

// Inputs
content = content.replace(
  /compact \? 'rounded-md px-2.5 py-2 text-\[10px\] font-medium' : 'px-4 py-3 rounded-xl text-sm font-semibold'/g,
  "'w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#2563eb]'"
);

content = content.replace(
  / focus:outline-none focus:border-\[#2563eb\]/g,
  ""
);

content = content.replace(
  / focus:outline-none focus:border-\[#0052cc\]/g,
  ""
);

content = content.replace(
  "text-slate-800 resize-none",
  "resize-none"
);

// Bottom Button
content = content.replace(
  "compact ? 'mt-5 flex justify-end border-t border-slate-100 pt-3' : 'flex justify-end pt-2'",
  "'mt-8 flex justify-end'"
);

content = content.replace(
  "compact ? 'gap-1 rounded-md px-4 py-2 text-[10px] font-semibold' : 'gap-1.5 px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20'",
  "'inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-600 cursor-pointer'"
);

content = content.replace(
  " inline-flex items-center bg-[#2563eb] hover:bg-blue-700 text-white cursor-pointer",
  ""
);

fs.writeFileSync(file, content);
console.log('Done');

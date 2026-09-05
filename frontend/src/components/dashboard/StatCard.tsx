import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: number; // 0 to 100 for the progress bar
  progressColor?: string; // e.g. "bg-blue-500", "bg-emerald-500"
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  trend,
  progress,
  progressColor = "bg-blue-500",
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative">
      <div className="flex justify-between items-start">
        <span className="text-slate-800 text-[13px] font-bold">{title}</span>
      </div>
      
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900 leading-none mb-3 mt-1">
          {value}
        </div>
        
        {progress !== undefined && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-2">
            <div className={`${progressColor} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
          </div>
        )}
        
        {(trend || description) && (
          <div className="flex items-center text-[11px] font-bold text-slate-500">
            {trend && (
              <span className={`${trend.isPositive ? 'text-emerald-500' : 'text-red-500'} mr-1`}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
            {description && <span className="text-slate-400 font-semibold">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

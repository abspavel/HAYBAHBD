import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        highlight
          ? 'bg-gradient-to-br from-[#06201A] via-[#0B2B22] to-[#041511] text-white border-[#D4AF37]/50 shadow-lg'
          : 'bg-white text-[#06201A] border-gray-200/90 hover:border-[#D4AF37]/40 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Background Accent */}
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              highlight ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {title}
          </p>
          <h3
            className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${
              highlight ? 'text-[#FFF5C0]' : 'text-[#06201A]'
            }`}
          >
            {value}
          </h3>
        </div>

        <div
          className={`p-3 rounded-xl shrink-0 ${
            highlight
              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
              : 'bg-gray-100 text-[#06201A]'
          }`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2 border-t border-gray-100/30 flex items-center justify-between text-xs">
          {subtitle && (
            <span
              className={highlight ? 'text-gray-300' : 'text-gray-500'}
            >
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                trend.isPositive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

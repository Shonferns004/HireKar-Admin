import React from 'react';
import { TrendUp, TrendDown } from 'phosphor-react';

export const StatsCard = ({ label, value, trend, icon: Icon, isPositive = true }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-slate-500">{label}</p>

        <div className="bg-primary/10 text-primary p-2 rounded-lg">
          {Icon && <Icon size={18} weight="fill" />}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-slate-900">{value}</p>

          <p
            className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? <TrendUp size={14} /> : <TrendDown size={14} />}
            {trend > 0 ? '+' : ''}
            {trend}% vs last month
          </p>
        </div>

        <div className="w-16 h-8 bg-slate-50 rounded flex items-end p-1 gap-0.5">
          {[30, 50, 40, 70, 60, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/20 rounded-t-sm"
              style={{ height: `${h}%`, opacity: 0.3 + i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

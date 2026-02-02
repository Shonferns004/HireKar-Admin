import React, { useState } from 'react';
import { StatsCard } from '../components/StatsCard';

import { GoogleGenAI } from '@google/genai';
import { ANALYTICS_MOCK, RECENT_TRANSACTIONS } from '../utils/constants';
import { AnalyticsChart } from '../components/Analytics';

import {
  CalendarBlank,
  DownloadSimple,
  Sparkle,
  Info,
  ShoppingCart,
  Wallet,
  Headset,
  UserPlus,
  CurrencyDollar,
  Users,
  MouseSimple,
} from 'phosphor-react';

export const Dashboard = () => {
  const [insight, setInsight] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsight = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this dashboard data: 
        Revenue: $${ANALYTICS_MOCK.totalRevenue} (+12.5%), 
        Active Users: ${ANALYTICS_MOCK.activeUsers} (-2.4%), 
        Conversion: ${ANALYTICS_MOCK.conversionRate}%. 
        Provide a 2-sentence business recommendation.`
      });
      setInsight(response.text || "No insights found.");
    } catch (err) {
      console.error(err);
      setInsight("Unable to load intelligent insights at this time.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Analytics Overview
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Monitor your key performance indicators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <CalendarBlank size={18} />
              <span className="whitespace-nowrap">Oct 1 - Oct 31, 2023</span>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-95">
            <DownloadSimple size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">

<StatsCard
  label="Total Revenue"
  value={`$${ANALYTICS_MOCK.totalRevenue.toLocaleString()}`}
  trend={12.5}
  icon={CurrencyDollar}
/>

<StatsCard
  label="Active Users"
  value={ANALYTICS_MOCK.activeUsers.toLocaleString()}
  trend={-2.4}
  icon={Users}
  isPositive={false}
/>

<StatsCard
  label="Conversion Rate"
  value={`${ANALYTICS_MOCK.conversionRate}%`}
  trend={0.8}
  icon={MouseSimple}
/>

<StatsCard
  label="New Signups"
  value={ANALYTICS_MOCK.newSignups.toLocaleString()}
  trend={15.2}
  icon={UserPlus}
/>

      </div>

      {/* Chart + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 overflow-hidden">
          <AnalyticsChart />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900">Traffic Sources</h3>
                <p className="text-sm text-slate-500 font-medium">Distribution by channel</p>
              </div>
              <button
                onClick={generateInsight}
                className="text-primary hover:text-primary-dark p-1 rounded-md hover:bg-primary/5 transition-colors"
                title="AI Insights"
              >
                <Sparkle size={20} className={isGenerating ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="space-y-5 flex-1">
              {[
                { name: 'Direct Search', value: 45 },
                { name: 'Social Media', value: 28 },
                { name: 'Referral Links', value: 15 },
                { name: 'Email Marketing', value: 12 },
              ].map((source, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700">{source.name}</span>
                    <span className="text-slate-500">{source.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${source.value}%`, opacity: 1 - idx * 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {insight && (
              <div className="mt-6 p-3 bg-primary/5 border border-primary/10 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-primary" />
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    {insight}
                  </p>
                </div>
              </div>
            )}

            <button className="mt-6 w-full py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Recent Transactions</h3>
            <p className="text-sm text-slate-500 font-medium">Latest orders</p>
          </div>
          <button className="text-sm font-bold text-primary hover:underline transition-all">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Transaction</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {RECENT_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {tx.type === 'subscription' ? <ShoppingCart size={18} /> :
                         tx.type === 'addon' ? <Wallet size={18} /> :
                         <Headset size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tx.title}</p>
                        <p className="text-xs text-slate-500 font-medium">Order #{tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">${tx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide
                      ${tx.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="text-center py-6 text-slate-400 text-[11px] font-medium border-t border-slate-200">
        © 2023 AdminAnalytics Pro. Platform synchronization active.
      </footer>
    </div>
  );
};

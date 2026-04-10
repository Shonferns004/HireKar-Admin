import React, { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { AnalyticsChart } from '../components/Analytics';
import {
  FileText,
  TrendUp,
  UsersThree,
  Books,
  Briefcase,
  Coins,
} from 'phosphor-react';

export const Reports = () => {
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) return;

        const [workersRes, jobsRes, coursesRes, payoutsRes] = await Promise.all([
          supabase.from('workers').select('*'),
          supabase.from('jobs').select('*'),
          supabase.from('courses').select('*'),
          supabase.from('payout_requests').select('*'),
        ]);

        setWorkers(workersRes.data || []);
        setJobs(jobsRes.data || []);
        setCourses(coursesRes.data || []);
        setPayouts(payoutsRes.data || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const completedJobs = jobs.filter((job) => job.status === 'COMPLETED');
    const cancelledJobs = jobs.filter((job) => String(job.status).includes('CANCELLED'));
    const paidPayouts = payouts.filter((item) => item.status === 'PAID');
    const pendingPayouts = payouts.filter((item) => item.status === 'PENDING');
    const platformRevenue = payouts
      .filter((item) => item.status !== 'REJECTED')
      .reduce((sum, item) => sum + Number(item.platform_fee || 0), 0);

    return {
      workers: workers.length,
      courses: courses.length,
      completedJobs: completedJobs.length,
      cancelledJobs: cancelledJobs.length,
      paidPayouts: paidPayouts.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      pendingPayouts: pendingPayouts.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      platformRevenue,
    };
  }, [workers, jobs, courses, payouts]);

  const reportChart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);

      const jobsForDay = jobs.filter((job) => String(job.created_at || '').startsWith(key));
      const completed = jobsForDay.filter((job) => job.status === 'COMPLETED').length;

      return {
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        completed,
        created: jobsForDay.length,
      };
    });

    return days;
  }, [jobs]);

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="rounded-[2rem] bg-slate-900 text-white p-8 shadow-xl">
        <div className="flex items-center gap-3 text-primary text-xs font-black uppercase tracking-[0.25em]">
          <FileText weight="fill" />
          Reports Center
        </div>
        <h2 className="mt-4 text-3xl font-black tracking-tight">
          Operational Reports
        </h2>
        <p className="mt-2 text-slate-300 max-w-2xl">
          Review hiring activity, course inventory, service completions, and payout movement
          from a single admin report screen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { label: 'Workers', value: summary.workers, icon: UsersThree },
          { label: 'Courses', value: summary.courses, icon: Books },
          { label: 'Completed Jobs', value: summary.completedJobs, icon: Briefcase },
          { label: 'Cancelled Jobs', value: summary.cancelledJobs, icon: TrendUp },
          { label: 'Paid Payouts', value: `Rs ${summary.paidPayouts}`, icon: Coins },
          { label: 'Pending Payouts', value: `Rs ${summary.pendingPayouts}`, icon: Coins },
          { label: 'Platform Fees', value: `Rs ${summary.platformRevenue}`, icon: Coins },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">{item.label}</p>
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <item.icon size={22} weight="fill" />
              </div>
            </div>
            <p className="mt-5 text-3xl font-black text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <AnalyticsChart
        data={reportChart}
        title="Jobs Created vs Completed"
        subtitle="Last 7 days of booking throughput"
        primaryLabel="Created"
        secondaryLabel="Completed"
        primaryKey="created"
        secondaryKey="completed"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">Admin Notes</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <p>Top priority: clear pending payouts quickly so worker trust stays high.</p>
            <p>Watch cancellation trends and investigate services with repeated drop-offs.</p>
            <p>Course inventory should grow with active worker categories to improve onboarding.</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">Live Status</h3>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">System</p>
              <p className="mt-2 text-lg font-black text-slate-900">
                {loading ? 'Loading...' : 'Connected'}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-amber-700">Queue</p>
              <p className="mt-2 text-lg font-black text-slate-900">
                {summary.pendingPayouts ? 'Needs review' : 'Healthy'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

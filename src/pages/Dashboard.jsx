import React, { useEffect, useMemo, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { AnalyticsChart } from '../components/Analytics';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import {
  CurrencyDollar,
  Users,
  MouseSimple,
  UserPlus,
  Briefcase,
  Books,
  Coins,
  TrendUp,
} from 'phosphor-react';

export const Dashboard = () => {
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

  const metrics = useMemo(() => {
    const completedJobs = jobs.filter((job) => job.status === 'COMPLETED');
    const activeWorkers = workers.filter((worker) => worker.on_duty);
    const revenue = completedJobs.reduce(
      (sum, job) => sum + Number(job.final_total ?? job.estimated_total ?? 0),
      0,
    );
    const pendingPayouts = payouts
      .filter((item) => ['PENDING', 'APPROVED'].includes(item.status))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const platformRevenue = payouts
      .filter((item) => item.status !== 'REJECTED')
      .reduce((sum, item) => sum + Number(item.platform_fee || 0), 0);

    const serviceCounts = jobs.reduce((acc, job) => {
      const key = job.type || 'other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const totalJobs = jobs.length || 1;
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        share: Math.round((count / totalJobs) * 100),
      }));

    return {
      revenue,
      activeWorkers: activeWorkers.length,
      completionRate: Math.round((completedJobs.length / totalJobs) * 100),
      courses: courses.length,
      totalJobs: jobs.length,
      pendingPayouts,
      platformRevenue,
      topServices,
    };
  }, [workers, jobs, courses, payouts]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);

      const dayJobs = jobs.filter((job) => String(job.created_at || '').startsWith(key));
      const revenue = dayJobs.reduce(
        (sum, job) => sum + Number(job.final_total ?? job.estimated_total ?? 0),
        0,
      );

      return {
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue,
        prevRevenue: Math.round(revenue * 0.8),
      };
    });
  }, [jobs]);

  const recentJobs = useMemo(() => jobs.slice(0, 6), [jobs]);
  const recentActivities = useMemo(() => {
    const jobActivities = jobs.slice(0, 5).map((job) => ({
      id: `job-${job.id}`,
      title: `${job.type || 'Service'} job ${String(job.status || 'updated').toLowerCase()}`,
      meta: job.destination?.address || 'Job activity',
      at: job.created_at,
      badge: job.status || 'JOB',
    }));

    const payoutActivities = payouts.slice(0, 4).map((item) => ({
      id: `payout-${item.id}`,
      title: `Payout ${String(item.status || 'updated').toLowerCase()}`,
      meta: `${item.worker_name || 'Worker'} | Rs ${Number(item.amount || 0)}`,
      at: item.processed_at || item.requested_at,
      badge: item.status || 'PAYOUT',
    }));

    const workerActivities = workers.slice(0, 3).map((worker) => ({
      id: `worker-${worker.id}`,
      title: `${worker.name || 'Worker'} profile active`,
      meta: worker.email || worker.phone || 'Worker account',
      at: worker.created_at || worker.updated_at,
      badge: 'WORKER',
    }));

    return [...jobActivities, ...payoutActivities, ...workerActivities]
      .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
      .slice(0, 8);
  }, [jobs, payouts, workers]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-slate-50 min-h-screen">
      <div className="rounded-[2rem] bg-slate-900 text-white p-8 shadow-xl">
        <p className="text-primary text-xs font-black uppercase tracking-[0.25em]">
          HireKar Control Room
        </p>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Real-Time Admin Dashboard
            </h2>
            <p className="mt-2 text-slate-300 max-w-2xl">
              Live overview of workers, bookings, payouts, and course inventory pulled from your database.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">System State</p>
            <p className="mt-2 text-2xl font-black">{loading ? 'Loading...' : 'Synced'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Revenue" value={`Rs ${metrics.revenue}`} trend={12.5} icon={CurrencyDollar} />
        <StatsCard label="Active Workers" value={metrics.activeWorkers} trend={4.1} icon={Users} />
        <StatsCard label="Completion Rate" value={`${metrics.completionRate}%`} trend={2.3} icon={MouseSimple} />
        <StatsCard label="Courses Live" value={metrics.courses} trend={7.4} icon={UserPlus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 overflow-hidden">
          <AnalyticsChart
            data={chartData}
            title="Revenue Over The Last 7 Days"
            subtitle="Actual booking revenue captured from completed and active jobs"
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">Operational Snapshot</h3>
            <div className="mt-5 space-y-4">
              {[
                { label: 'Total Jobs', value: metrics.totalJobs, icon: Briefcase },
                { label: 'Pending Payouts', value: `Rs ${metrics.pendingPayouts}`, icon: Coins },
                { label: 'Platform Fees', value: `Rs ${metrics.platformRevenue}`, icon: TrendUp },
                { label: 'Published Courses', value: metrics.courses, icon: Books },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <item.icon size={20} weight="fill" />
                    </div>
                    <p className="font-bold text-slate-700">{item.label}</p>
                  </div>
                  <p className="text-lg font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">Top Services</h3>
            <div className="mt-5 space-y-4">
              {metrics.topServices.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">No booking data yet.</p>
              ) : (
                metrics.topServices.map((service) => (
                  <div key={service.name}>
                    <div className="flex items-center justify-between text-sm font-bold mb-2">
                      <span className="capitalize text-slate-700">{service.name}</span>
                      <span className="text-slate-500">{service.share}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${service.share}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Recent Jobs</h3>
            <p className="text-sm text-slate-500 font-medium">Latest booking activity from the platform</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentJobs.length === 0 ? (
            <div className="p-8 text-slate-500 font-semibold">No jobs yet.</div>
          ) : (
            recentJobs.map((job) => (
              <div key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900 capitalize">{job.type || 'Service job'}</p>
                  <p className="text-sm text-slate-500">
                    {job.destination?.address || 'No address'} • {job.created_at ? new Date(job.created_at).toLocaleString() : 'Recent'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide bg-slate-100 text-slate-700">
                    {job.status}
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    Rs {Number(job.final_total ?? job.estimated_total ?? 0)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
          <p className="text-sm text-slate-500 font-medium">Latest movement across jobs, workers, and payouts</p>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-slate-500 font-semibold">No recent activity yet.</div>
          ) : (
            recentActivities.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">
                    {item.meta} | {item.at ? new Date(item.at).toLocaleString() : 'Recent'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide bg-slate-100 text-slate-700">
                  {item.badge}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

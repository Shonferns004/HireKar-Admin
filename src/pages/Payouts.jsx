import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowsClockwise, CurrencyInr, CheckCircle, XCircle } from 'phosphor-react';
import api from '../utils/api';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

export const Payouts = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payouts');
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const summary = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        const amount = Number(request.amount || 0);
        const platformFee = Number(request.platform_fee || 0);
        acc.total += amount;
        acc.platformRevenue += platformFee;

        if (request.status === 'PENDING') acc.pending += amount;
        if (request.status === 'PAID') acc.paid += amount;
        if (request.status === 'APPROVED') acc.approved += amount;
        if (request.status === 'PAID') acc.collectedRevenue += platformFee;

        return acc;
      },
      { total: 0, pending: 0, approved: 0, paid: 0, platformRevenue: 0, collectedRevenue: 0 },
    );
  }, [requests]);

  const updateStatus = async (requestId, status) => {
    setSavingId(requestId);
    try {
      await api.patch(`/admin/payouts/${requestId}`, {
        status,
      });

      await fetchRequests();
    } catch (error) {
      console.error('Error updating payout request:', error);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Worker Payouts
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Review withdrawal requests and mark payments after transfer.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
        >
          <ArrowsClockwise size={18} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        {[
          { label: 'All Requests', value: summary.total },
          { label: 'Pending', value: summary.pending },
          { label: 'Approved', value: summary.approved },
          { label: 'Paid', value: summary.paid },
          { label: 'Platform Fee Revenue', value: summary.platformRevenue },
          { label: 'Collected Revenue', value: summary.collectedRevenue },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-black text-slate-900">
              Rs {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">Requests Queue</h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 font-semibold">
            Loading payout requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-semibold">
            No payout requests found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-lg font-black text-slate-900">
                      {request.worker_name || 'Worker'}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        STATUS_STYLES[request.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium">
                    {request.worker_phone || 'No phone'} • Requested{' '}
                    {request.requested_at
                      ? new Date(request.requested_at).toLocaleString()
                      : 'just now'}
                  </p>
                  <p className="text-slate-600">
                    Note: {request.note || 'No note added by worker.'}
                  </p>
                  <p className="text-sm font-semibold text-slate-500">
                    Platform fee Rs {Number(request.platform_fee || 0)} • Worker gets Rs {Number(request.payout_amount || 0)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="rounded-2xl bg-slate-900 text-white px-5 py-4 font-black text-lg flex items-center gap-2">
                    <CurrencyInr size={20} weight="bold" />
                    {Number(request.amount || 0)}
                  </div>

                  <button
                    onClick={() => updateStatus(request.id, 'APPROVED')}
                    disabled={savingId === request.id || request.status === 'APPROVED' || request.status === 'PAID'}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 font-bold disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(request.id, 'PAID')}
                    disabled={savingId === request.id || request.status === 'PAID'}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 font-bold disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Mark Paid
                  </button>

                  <button
                    onClick={() => updateStatus(request.id, 'REJECTED')}
                    disabled={savingId === request.id || request.status === 'PAID' || request.status === 'REJECTED'}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 font-bold disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function PerformancePage() {
  const { user }              = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const isManager = user?.role === 'admin' || user?.role === 'senior_manager';

  const [form, setForm] = useState({
    employeeId: '', period: 'Q2 2026', rating: 4, feedback: '', status: 'submitted',
    goals: [{ title: 'Complete project milestones', target: '100%', achieved: true }],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rev, emp] = await Promise.all([
        api('/performance'),
        api('/employees'),
      ]);
      setReviews(rev);
      setEmployees(emp.employees || []);
    } catch (e: any) { setMessage(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      await api('/performance', { method: 'POST', body: JSON.stringify(form) });
      setMessage('✅ Review created');
      setShowModal(false);
      fetchData();
    } catch (e: any) { setMessage(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">{reviews.length} reviews total</p>
        </div>
        {isManager && (
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            + New Review
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex justify-between">
          {message} <button onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-400">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400">No reviews yet</div>
        ) : reviews.map((r: any) => (
          <div key={r._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">{r.employeeId?.name}</p>
                <p className="text-xs text-gray-400">{r.employeeId?.designation} · {r.period}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                r.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                r.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>{r.status}</span>
            </div>
            <div className="text-amber-400 text-lg mb-2">{stars(r.rating || 0)}</div>
            {r.feedback && <p className="text-sm text-gray-600 mb-3">{r.feedback}</p>}
            {r.aiSummary && (
              <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
                <span className="font-medium">🤖 AI Summary: </span>{r.aiSummary}
              </div>
            )}
            {r.goals?.length > 0 && (
              <div className="mt-3 space-y-1">
                {r.goals.map((g: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{g.achieved ? '✅' : '⭕'}</span>
                    <span>{g.title} — {g.target}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Performance Review</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select employee</option>
                  {employees.map((e: any) => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input type="number" min={1} max={5} value={form.rating}
                  onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                <textarea value={form.feedback} onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Create Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
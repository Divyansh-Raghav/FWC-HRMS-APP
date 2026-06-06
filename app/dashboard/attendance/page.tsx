'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

const statusColors: Record<string, string> = {
  present:  'bg-green-100 text-green-700',
  absent:   'bg-red-100 text-red-700',
  late:     'bg-yellow-100 text-yellow-700',
  half_day: 'bg-orange-100 text-orange-700',
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AttendancePage() {
  const { user }                      = useAuth();
  const [tab, setTab]                 = useState<'attendance' | 'leaves'>('attendance');
  const [attendance, setAttendance]   = useState<any[]>([]);
  const [leaves, setLeaves]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [clockedIn, setClockedIn]     = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [message, setMessage]         = useState('');
  const [leaveForm, setLeaveForm]     = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });

  const isManager = user?.role === 'admin' || user?.role === 'senior_manager';

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const [att, lev] = await Promise.all([
        api(`/attendance?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
        api('/attendance/leaves'),
      ]);
      setAttendance(att);
      setLeaves(lev);
      const today = new Date().toDateString();
      setClockedIn(att.some((a: any) => new Date(a.date).toDateString() === today && a.clockIn));
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleClockIn = async () => {
    try {
      await api('/attendance/clock-in', { method: 'POST' });
      setMessage('✅ Clocked in successfully!');
      fetchData();
    } catch (e: any) { setMessage(e.message); }
  };

  const handleClockOut = async () => {
    try {
      await api('/attendance/clock-out', { method: 'POST' });
      setMessage('✅ Clocked out successfully!');
      fetchData();
    } catch (e: any) { setMessage(e.message); }
  };

  const handleLeaveApply = async () => {
    try {
      await api('/attendance/leaves', { method: 'POST', body: JSON.stringify(leaveForm) });
      setMessage('✅ Leave applied successfully!');
      setShowLeaveForm(false);
      fetchData();
    } catch (e: any) { setMessage(e.message); }
  };

  const handleLeaveAction = async (id: string, status: string) => {
    try {
      await api(`/attendance/leaves/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      fetchData();
    } catch (e: any) { setMessage(e.message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance & Leave</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toDateString()}</p>
      </div>

      {message && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex justify-between">
          {message}
          <button onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      {/* Clock in/out card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-800">Today's Attendance</h2>
            <p className="text-sm text-gray-500 mt-1">
              Status: <span className={`font-medium ${clockedIn ? 'text-green-600' : 'text-gray-400'}`}>
                {clockedIn ? 'Clocked In' : 'Not Clocked In'}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleClockIn} disabled={clockedIn}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 text-sm font-medium transition-colors">
              Clock In
            </button>
            <button onClick={handleClockOut} disabled={!clockedIn}
              className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 text-sm font-medium transition-colors">
              Clock Out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['attendance', 'leaves'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Attendance tab */}
      {tab === 'attendance' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  {isManager && <th className="text-left px-6 py-3 text-gray-500 font-medium">Employee</th>}
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Clock In</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Clock Out</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Hours</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No records this month</td></tr>
                ) : attendance.map((a: any) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{new Date(a.date).toLocaleDateString()}</td>
                    {isManager && <td className="px-6 py-4 text-gray-600">{a.employeeId?.name || '—'}</td>}
                    <td className="px-6 py-4 text-gray-600">{a.clockIn || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{a.clockOut || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{a.hoursWorked || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaves tab */}
      {tab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowLeaveForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Apply for Leave
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {isManager && <th className="text-left px-6 py-3 text-gray-500 font-medium">Employee</th>}
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">From</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">To</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Days</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                    {isManager && <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaves.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No leave requests</td></tr>
                  ) : leaves.map((l: any) => (
                    <tr key={l._id} className="hover:bg-gray-50">
                      {isManager && <td className="px-6 py-4 text-gray-600">{l.employeeId?.name || '—'}</td>}
                      <td className="px-6 py-4 text-gray-600 capitalize">{l.type}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(l.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(l.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{l.days}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[l.status]}`}>
                          {l.status}
                        </span>
                      </td>
                      {isManager && l.status === 'pending' && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleLeaveAction(l._id, 'approved')}
                              className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                              Approve
                            </button>
                            <button onClick={() => handleLeaveAction(l._id, 'rejected')}
                              className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                      {isManager && l.status !== 'pending' && <td className="px-6 py-4 text-gray-400">—</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave form modal */}
          {showLeaveForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Apply for Leave</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <select value={leaveForm.type} onChange={e => setLeaveForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="casual">Casual</option>
                      <option value="sick">Sick</option>
                      <option value="earned">Earned</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={leaveForm.startDate}
                      onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={leaveForm.endDate}
                      onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea value={leaveForm.reason}
                      onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowLeaveForm(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                  <button onClick={handleLeaveApply}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
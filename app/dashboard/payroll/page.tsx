'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PayrollPage() {
  const { user }              = useAuth();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');
  const isAdmin = user?.role === 'admin';

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const data = await api('/payroll');
      setPayrolls(data);
    } catch (e: any) { setMessage(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayrolls(); }, []);

  const handleGenerate = async () => {
    const now = new Date();
    try {
      const data = await api('/payroll/generate', {
        method: 'POST',
        body: JSON.stringify({ month: now.getMonth() + 1, year: now.getFullYear() }),
      });
      setMessage(`✅ ${data.message}`);
      fetchPayrolls();
    } catch (e: any) { setMessage(e.message); }
  };

  const handlePay = async (id: string) => {
    try {
      await api(`/payroll/${id}/pay`, { method: 'PUT' });
      setMessage('✅ Marked as paid');
      fetchPayrolls();
    } catch (e: any) { setMessage(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">{payrolls.length} payslips found</p>
        </div>
        {isAdmin && (
          <button onClick={handleGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Generate This Month
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex justify-between">
          {message} <button onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Employee</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Period</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Basic</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Allowances</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Deductions</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Net Salary</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                {isAdmin && <th className="text-left px-6 py-3 text-gray-500 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : payrolls.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  No payslips yet.{isAdmin && ' Click "Generate This Month" to create them.'}
                </td></tr>
              ) : payrolls.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{p.employeeId?.name}</p>
                    <p className="text-xs text-gray-400">{p.employeeId?.designation}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{months[p.month - 1]} {p.year}</td>
                  <td className="px-6 py-4 text-gray-600">₹{p.basicSalary?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600">+₹{p.allowances?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-500">-₹{(p.deductions + p.tax)?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">₹{p.netSalary?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{p.status}</span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      {p.status === 'pending' && (
                        <button onClick={() => handlePay(p._id)}
                          className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
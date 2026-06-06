'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employeeId: string;
  salary: number;
  status: string;
  joinDate: string;
}

const departments = ['Engineering', 'Human Resources', 'Sales', 'Operations', 'Management', 'Finance', 'Marketing'];

const statusColors: Record<string, string> = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  on_leave: 'bg-yellow-100 text-yellow-700',
};

export default function EmployeesPage() {
  const { user }                        = useAuth();
  const [employees, setEmployees]       = useState<Employee[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [department, setDepartment]     = useState('');
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState<Employee | null>(null);
  const [error, setError]               = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: 'Engineering',
    designation: '', salary: '', status: 'active',
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '8' });
      if (search)     params.set('search', search);
      if (department) params.set('department', department);
      const data = await api(`/employees?${params}`);
      setEmployees(data.employees);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, department]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', department: 'Engineering', designation: '', salary: '', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation, salary: String(emp.salary), status: emp.status });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api(`/employees/${editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/employees', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchEmployees();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    await api(`/employees/${id}`, { method: 'DELETE' });
    fetchEmployees();
  };

  const canEdit   = user?.role === 'admin' || user?.role === 'hr_recruiter';
  const canDelete = user?.role === 'admin';
  const totalPages = Math.ceil(total / 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total employees</p>
        </div>
        {canEdit && (
          <button onClick={openAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            + Add Employee
          </button>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="Search name, email, ID..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Employee</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Department</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Designation</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Salary</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                {(canEdit || canDelete) && <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No employees found</td></tr>
              ) : employees.map(emp => (
                <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{emp.name}</p>
                        <p className="text-gray-400 text-xs">{emp.employeeId} · {emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.designation}</td>
                  <td className="px-6 py-4 text-gray-600">₹{emp.salary?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[emp.status]}`}>
                      {emp.status.replace('_', ' ')}
                    </span>
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {canEdit && (
                          <button onClick={() => openEdit(emp)}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(emp._id)}
                            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editing ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Full Name',    key: 'name',        type: 'text' },
                { label: 'Email',        key: 'email',       type: 'email' },
                { label: 'Phone',        key: 'phone',       type: 'text' },
                { label: 'Designation',  key: 'designation', type: 'text' },
                { label: 'Salary (₹)',   key: 'salary',      type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type={field.type} value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                {editing ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
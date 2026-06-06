'use client';
import { useAuth } from '@/lib/authContext';
import StatCard from '@/components/ui/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// Mock data
const attendanceData = [
  { month: 'Jan', present: 92, absent: 8 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 95, absent: 5 },
  { month: 'Apr', present: 90, absent: 10 },
  { month: 'May', present: 93, absent: 7 },
  { month: 'Jun', present: 87, absent: 13 },
];

const payrollData = [
  { month: 'Jan', amount: 420000 },
  { month: 'Feb', amount: 435000 },
  { month: 'Mar', amount: 428000 },
  { month: 'Apr', amount: 442000 },
  { month: 'May', amount: 438000 },
  { month: 'Jun', amount: 455000 },
];

const departmentData = [
  { name: 'Engineering', value: 35 },
  { name: 'HR',          value: 15 },
  { name: 'Sales',       value: 25 },
  { name: 'Operations',  value: 25 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { user } = useAuth();

  // Admin / Senior Manager dashboard
  if (user?.role === 'admin' || user?.role === 'senior_manager') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user.name} 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening across your organization today.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Employees"   value="248"  subtitle="+12 this month"  icon="👥" color="bg-blue-50" />
          <StatCard title="Present Today"     value="221"  subtitle="89% attendance"  icon="✅" color="bg-green-50" />
          <StatCard title="On Leave"          value="18"   subtitle="7 pending approval" icon="🌴" color="bg-yellow-50" />
          <StatCard title="Open Positions"    value="7"    subtitle="3 in final round" icon="📋" color="bg-purple-50" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Monthly Attendance (%)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="present" fill="#3b82f6" radius={[4,4,0,0]} name="Present %" />
                <Bar dataKey="absent"  fill="#fca5a5" radius={[4,4,0,0]} name="Absent %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payroll chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Payroll Cost (₹)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Payroll" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Headcount by Department</h2>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={departmentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                  {departmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // HR Recruiter dashboard
  if (user?.role === 'hr_recruiter') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name} 👋</h1>
          <p className="text-gray-500 mt-1">Recruitment & HR operations overview.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open Positions"    value="7"   subtitle="Actively hiring"    icon="📋" color="bg-blue-50" />
          <StatCard title="Applications"      value="94"  subtitle="This month"         icon="📩" color="bg-green-50" />
          <StatCard title="Interviews Today"  value="5"   subtitle="2 pending feedback" icon="🎙️" color="bg-yellow-50" />
          <StatCard title="Offers Sent"       value="3"   subtitle="1 accepted"         icon="✉️" color="bg-purple-50" />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Applications This Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" radius={[4,4,0,0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Employee dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Your personal HR dashboard.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Leaves Taken"     value="8"    subtitle="of 24 total"         icon="🌴" color="bg-green-50" />
        <StatCard title="Attendance"       value="94%"  subtitle="This month"          icon="✅" color="bg-blue-50" />
        <StatCard title="Next Review"      value="Jul"  subtitle="Performance cycle"   icon="🎯" color="bg-yellow-50" />
        <StatCard title="Last Payslip"     value="May"  subtitle="₹45,000 credited"   icon="💰" color="bg-purple-50" />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Apply for Leave', icon: '🌴', href: '/dashboard/attendance' },
            { label: 'View Payslip',    icon: '💰', href: '/dashboard/payroll' },
            { label: 'HR Chatbot',      icon: '🤖', href: '/dashboard/ai' },
            { label: 'My Profile',      icon: '👤', href: '/dashboard/employees' },
          ].map(action => (
            <a key={action.label} href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-600">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Attendance chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-700 mb-4">My Attendance This Year</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="present" fill="#3b82f6" radius={[4,4,0,0]} name="Attendance %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

const navItems: Record<string, { label: string; href: string; icon: string }[]> = {
  admin: [
    { label: 'Dashboard',    href: '/dashboard',            icon: '📊' },
    { label: 'Employees',    href: '/dashboard/employees',  icon: '👥' },
    { label: 'Attendance',   href: '/dashboard/attendance', icon: '🕐' },
    { label: 'Payroll',      href: '/dashboard/payroll',    icon: '💰' },
    { label: 'Performance',  href: '/dashboard/performance',icon: '🎯' },
    { label: 'Recruitment',  href: '/dashboard/recruitment',icon: '📋' },
    { label: 'AI Features',  href: '/dashboard/ai',         icon: '🤖' },
  ],
  senior_manager: [
    { label: 'Dashboard',    href: '/dashboard',            icon: '📊' },
    { label: 'Employees',    href: '/dashboard/employees',  icon: '👥' },
    { label: 'Attendance',   href: '/dashboard/attendance', icon: '🕐' },
    { label: 'Performance',  href: '/dashboard/performance',icon: '🎯' },
    { label: 'AI Features',  href: '/dashboard/ai',         icon: '🤖' },
  ],
  hr_recruiter: [
    { label: 'Dashboard',    href: '/dashboard',            icon: '📊' },
    { label: 'Employees',    href: '/dashboard/employees',  icon: '👥' },
    { label: 'Recruitment',  href: '/dashboard/recruitment',icon: '📋' },
    { label: 'AI Features',  href: '/dashboard/ai',         icon: '🤖' },
  ],
  employee: [
    { label: 'Dashboard',    href: '/dashboard',            icon: '📊' },
    { label: 'My Attendance',href: '/dashboard/attendance', icon: '🕐' },
    { label: 'My Payslips',  href: '/dashboard/payroll',   icon: '💰' },
    { label: 'HR Chatbot',   href: '/dashboard/ai',        icon: '🤖' },
  ],
  applicant: [],
};

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const items = navItems[user?.role ?? 'employee'] ?? [];

  const roleColors: Record<string, string> = {
    admin:          'bg-purple-600',
    senior_manager: 'bg-blue-600',
    hr_recruiter:   'bg-green-600',
    employee:       'bg-orange-500',
    applicant:      'bg-pink-500',
  };

  const roleLabels: Record<string, string> = {
    admin:          'Admin',
    senior_manager: 'Senior Manager',
    hr_recruiter:   'HR Recruiter',
    employee:       'Employee',
    applicant:      'Applicant',
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-lg">🏢</div>
          <div>
            <p className="font-bold text-white">HRMS</p>
            <p className="text-xs text-slate-400">FWC IT Services</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${roleColors[user?.role ?? 'employee']}`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user?.role ?? 'employee']} bg-opacity-20 text-white`}>
              {roleLabels[user?.role ?? 'employee']}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

const statusColors: Record<string, string> = {
  open:       'bg-green-100 text-green-700',
  closed:     'bg-gray-100 text-gray-600',
  filled:     'bg-blue-100 text-blue-700',
  applied:    'bg-yellow-100 text-yellow-700',
  screening:  'bg-orange-100 text-orange-700',
  interview:  'bg-purple-100 text-purple-700',
  selected:   'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
};

const departments = ['Engineering', 'Human Resources', 'Sales', 'Operations', 'Management', 'Finance', 'Marketing'];

export default function RecruitmentPage() {
  const { user }            = useAuth();
  const [jobs, setJobs]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');
  const [showJobModal, setShowJobModal]   = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob]     = useState<any>(null);
  const [expandedJob, setExpandedJob]     = useState<string | null>(null);

  const canPost = user?.role === 'admin' || user?.role === 'hr_recruiter';

  const [jobForm, setJobForm] = useState({
    title: '', department: 'Engineering', description: '',
    requirements: '', location: 'Remote', type: 'full-time',
  });

  const [applyForm, setApplyForm] = useState({
    name: '', email: '', phone: '', resumeText: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api('/recruitment');
      setJobs(data);
    } catch (e: any) { setMessage(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleCreateJob = async () => {
    try {
      await api('/recruitment', { method: 'POST', body: JSON.stringify(jobForm) });
      setMessage('✅ Job posted successfully');
      setShowJobModal(false);
      fetchJobs();
    } catch (e: any) { setMessage(e.message); }
  };

  const handleApply = async () => {
    try {
      await api(`/recruitment/${selectedJob._id}/apply`, {
        method: 'POST', body: JSON.stringify(applyForm),
      });
      setMessage('✅ Application submitted');
      setShowApplyModal(false);
      setApplyForm({ name: '', email: '', phone: '', resumeText: '' });
      fetchJobs();
    } catch (e: any) { setMessage(e.message); }
  };

  const handleStatusChange = async (jobId: string, status: string) => {
    try {
      await api(`/recruitment/${jobId}`, { method: 'PUT', body: JSON.stringify({ status }) });
      fetchJobs();
    } catch (e: any) { setMessage(e.message); }
  };

  const handleAppStatus = async (jobId: string, appId: string, status: string) => {
    try {
      await api(`/recruitment/${jobId}/applications/${appId}`, {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      fetchJobs();
    } catch (e: any) { setMessage(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recruitment</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.filter(j => j.status === 'open').length} open positions</p>
        </div>
        {canPost && (
          <button onClick={() => setShowJobModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            + Post Job
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex justify-between">
          {message} <button onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No jobs posted yet. {canPost && 'Click "+ Post Job" to get started.'}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-semibold text-gray-800 text-lg">{job.title}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{job.department} · {job.location}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-gray-500">{job.applications?.length || 0} applicants</span>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {job.status === 'open' && (
                        <button onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                          Apply Now
                        </button>
                      )}
                      {canPost && (
                        <select value={job.status}
                          onChange={e => handleStatusChange(job._id, e.target.value)}
                          className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none">
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="filled">Filled</option>
                        </select>
                      )}
                      {job.applications?.length > 0 && (
                        <button onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">
                          {expandedJob === job._id ? 'Hide' : 'View'} Applicants
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicants list */}
              {expandedJob === job._id && job.applications?.length > 0 && (
                <div className="border-t border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Applicants</h3>
                  <div className="space-y-3">
                    {job.applications.map((app: any) => (
                      <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{app.name}</p>
                          <p className="text-xs text-gray-400">{app.email} · {app.phone}</p>
                          {app.aiScore && (
                            <p className="text-xs text-purple-600 mt-1">🤖 AI Score: {app.aiScore}/100</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                            {app.status}
                          </span>
                          {canPost && (
                            <select value={app.status}
                              onChange={e => handleAppStatus(job._id, app._id, e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none">
                              <option value="applied">Applied</option>
                              <option value="screening">Screening</option>
                              <option value="interview">Interview</option>
                              <option value="selected">Selected</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Post New Job</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior React Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={jobForm.department} onChange={e => setJobForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Remote, Mumbai, Delhi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <textarea value={jobForm.description} onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the role and responsibilities..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea value={jobForm.requirements} onChange={e => setJobForm(f => ({ ...f, requirements: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List required skills and experience..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowJobModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={handleCreateJob}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Apply for {selectedJob.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedJob.department} · {selectedJob.location}</p>
            <div className="space-y-3">
              {[
                { label: 'Full Name', key: 'name',  type: 'text',  placeholder: 'Your full name' },
                { label: 'Email',     key: 'email', type: 'email', placeholder: 'your@email.com' },
                { label: 'Phone',     key: 'phone', type: 'text',  placeholder: '+91 98765 43210' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={(applyForm as any)[f.key]}
                    onChange={e => setApplyForm(ff => ({ ...ff, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume / Cover Letter</label>
                <textarea value={applyForm.resumeText}
                  onChange={e => setApplyForm(f => ({ ...f, resumeText: e.target.value }))}
                  rows={4} placeholder="Paste your resume text or write a brief cover letter..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowApplyModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={handleApply}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
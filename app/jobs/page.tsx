'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import Cookies from 'js-cookie';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function JobsPage() {
  const { user, logout }          = useAuth();
  const [jobs, setJobs]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [aiResult, setAiResult]   = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: '', resumeText: '',
  });

  useEffect(() => {
    setForm(f => ({ ...f, name: user?.name || '', email: user?.email || '' }));
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const res   = await fetch(`${API}/recruitment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data.filter((j: any) => j.status === 'open'));
    } catch (e: any) { setMessage(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return setMessage('Please upload a PDF file only');

    setUploading(true);
    try {
      const token    = Cookies.get('token');
      const formData = new FormData();
      formData.append('resume', file);

      const res  = await fetch(`${API}/upload/pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm(f => ({ ...f, resumeText: data.text }));
      setMessage('✅ PDF uploaded and parsed successfully!');
    } catch (e: any) {
      setMessage('❌ ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleScreenResume = async () => {
    if (!form.resumeText || !selectedJob) return;
    setScreening(true);
    setAiResult(null);
    try {
      const res  = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'resume_screen',
          resume: form.resumeText,
          jobDescription: `${selectedJob.title}\n${selectedJob.description}\n${selectedJob.requirements}`,
        }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e: any) {
      setMessage('AI screening failed: ' + e.message);
    } finally {
      setScreening(false);
    }
  };

  const handleApply = async () => {
    if (!form.name || !form.email || !form.resumeText) {
      return setMessage('Please fill in all fields and upload your resume');
    }
    try {
      const token = Cookies.get('token');
      const res   = await fetch(`${API}/recruitment/${selectedJob._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, aiScore: aiResult?.score, aiSummary: aiResult?.summary }),
      });
      if (!res.ok) throw new Error('Application failed');
      setMessage('✅ Application submitted successfully! Good luck!');
      setShowModal(false);
      setAiResult(null);
      setAppliedJobs(prev => [...prev, selectedJob._id]);
      setForm(f => ({ ...f, phone: '', resumeText: '' }));
    } catch (e: any) {
      setMessage('❌ ' + e.message);
    }
  };

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">🏢</div>
          <div>
            <p className="font-bold">HRMS — Job Portal</p>
            <p className="text-xs text-slate-400">FWC IT Services</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">👤 {user?.name}</span>
          <button onClick={logout}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Open Positions</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} jobs available at FWC IT Services</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm flex justify-between ${
            message.startsWith('❌') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
          }`}>
            {message}
            <button onClick={() => setMessage('')}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No open positions right now. Check back soon!</div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-gray-800 text-lg">{job.title}</h2>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Open</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{job.type}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{job.department} · 📍 {job.location}</p>
                    <p className="text-sm text-gray-600 mt-3">{job.description}</p>
                    {job.requirements && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Requirements</p>
                        <p className="text-sm text-gray-600">{job.requirements}</p>
                      </div>
                    )}
                  </div>
                  {appliedJobs.includes(job._id) ? (
                    <span className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl text-sm font-medium whitespace-nowrap">
                      ✅ Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => { setSelectedJob(job); setShowModal(true); setAiResult(null); }}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Apply — {selectedJob.title}</h2>
                <p className="text-sm text-gray-500">{selectedJob.department} · {selectedJob.location}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name',  type: 'text',  placeholder: 'Your full name' },
                { label: 'Email',     key: 'email', type: 'email', placeholder: 'your@email.com' },
                { label: 'Phone',     key: 'phone', type: 'text',  placeholder: '+91 98765 43210' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(ff => ({ ...ff, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume (PDF) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                  <input type="file" accept=".pdf" onChange={handlePDFUpload}
                    className="hidden" id="pdf-upload" />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    {uploading ? (
                      <p className="text-blue-600 text-sm">📄 Parsing PDF...</p>
                    ) : form.resumeText ? (
                      <p className="text-green-600 text-sm">✅ Resume uploaded — {form.resumeText.length} characters parsed</p>
                    ) : (
                      <div>
                        <p className="text-gray-500 text-sm">📄 Click to upload your resume PDF</p>
                        <p className="text-gray-400 text-xs mt-1">Max 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {form.resumeText && !aiResult && (
                <button onClick={handleScreenResume} disabled={screening}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  {screening ? '🤖 AI is screening your resume...' : '✨ Screen My Resume with AI (Optional)'}
                </button>
              )}

              {aiResult && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className={`text-4xl font-bold ${scoreColor(aiResult.score)}`}>{aiResult.score}</p>
                      <p className="text-xs text-gray-500">AI Match Score</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        aiResult.recommendation === 'Strongly Recommend' ? 'bg-green-100 text-green-700' :
                        aiResult.recommendation === 'Recommend'          ? 'bg-blue-100 text-blue-700' :
                        aiResult.recommendation === 'Maybe'              ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>{aiResult.recommendation}</span>
                      <p className="text-xs text-gray-500 mt-2 max-w-xs">{aiResult.summary}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">✅ Strengths</p>
                      {aiResult.strengths?.map((s: string, i: number) => (
                        <p key={i} className="text-xs text-green-600">• {s}</p>
                      ))}
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-600 mb-1">⚠️ Gaps</p>
                      {aiResult.weaknesses?.map((w: string, i: number) => (
                        <p key={i} className="text-xs text-red-500">• {w}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={handleApply} disabled={!form.resumeText}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 text-sm font-medium">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

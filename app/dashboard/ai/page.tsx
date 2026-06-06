'use client';
import { useState } from 'react';

type Tab = 'resume' | 'chatbot' | 'performance' | 'recruitment';

export default function AIPage() {
  const [tab, setTab] = useState<Tab>('resume');

  const tabs = [
    { id: 'resume',      label: '📄 Resume Screener',    desc: 'Score resumes with AI' },
    { id: 'chatbot',     label: '💬 HR Chatbot',          desc: 'Ask HR anything' },
    { id: 'performance', label: '🎯 Review Generator',    desc: 'Auto-generate reviews' },
    { id: 'recruitment', label: '🎙️ Interview Bot',       desc: 'AI interview practice' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">AI Features</h1>
        <p className="text-gray-500 text-sm mt-1">Powered by Claude AI — Anthropic</p>
      </div>

      {/* Tab selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              tab === t.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}>
            <p className="font-medium text-gray-800 text-sm">{t.label}</p>
            <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {tab === 'resume'      && <ResumeScreener />}
        {tab === 'chatbot'     && <HRChatbot />}
        {tab === 'performance' && <PerformanceReviewer />}
        {tab === 'recruitment' && <RecruitmentChatbot />}
      </div>
    </div>
  );
}

// ─── AI Feature 1: Resume Screener ───────────────────────────────────────────
function ResumeScreener() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume]                 = useState('');
  const [result, setResult]                 = useState<any>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  const handleScreen = async () => {
    if (!jobDescription || !resume) return setError('Please fill in both fields');
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'resume_screen', resume, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">AI Resume Screener</h2>
        <p className="text-sm text-gray-500">Paste a job description and resume — Claude will score the match instantly.</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
          <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
            rows={8} placeholder="Paste the full job description here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Resume</label>
          <textarea value={resume} onChange={e => setResume(e.target.value)}
            rows={8} placeholder="Paste the candidate's resume text here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </div>

      <button onClick={handleScreen} disabled={loading}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition-colors">
        {loading ? '🤖 Analyzing resume...' : '🔍 Screen Resume'}
      </button>

      {result && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Score */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={`text-5xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
              <p className="text-xs text-gray-500 mt-1">Match Score</p>
            </div>
            <div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                result.recommendation === 'Strongly Recommend' ? 'bg-green-100 text-green-700' :
                result.recommendation === 'Recommend'         ? 'bg-blue-100 text-blue-700' :
                result.recommendation === 'Maybe'             ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-600'
              }`}>{result.recommendation}</span>
              <p className="text-sm text-gray-600 mt-2 max-w-md">{result.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-700 mb-2">✅ Strengths</h3>
              <ul className="space-y-1">
                {result.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-green-700">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-600 mb-2">⚠️ Gaps</h3>
              <ul className="space-y-1">
                {result.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-red-600">• {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Feature 2: HR Chatbot ─────────────────────────────────────────────────
function HRChatbot() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m your HR assistant 👋 Ask me anything about leave policies, payroll, attendance, or company policies!' }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'hr_chat',
          message: userMsg,
          history: newMessages.slice(1, -1),
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'How many casual leaves do I have?',
    'When is payroll processed?',
    'What are office hours?',
    'How do I apply for sick leave?',
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">HR Assistant Chatbot</h2>
        <p className="text-sm text-gray-500">Ask anything about HR policies, leave, payroll, and more.</p>
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map(q => (
          <button key={q} onClick={() => { setInput(q); }}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors">
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="h-80 overflow-y-auto border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 text-sm text-gray-500">
              🤖 Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a HR question..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}

// ─── AI Feature 3: Performance Review Generator ───────────────────────────────
function PerformanceReviewer() {
  const [form, setForm] = useState({
    employeeName: '', designation: '', rating: '4',
    kpis: '', feedback: '',
  });
  const [result, setResult]   = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleGenerate = async () => {
    if (!form.employeeName || !form.kpis) return setError('Please fill in all required fields');
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'perf_review', ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">AI Performance Review Generator</h2>
        <p className="text-sm text-gray-500">Fill in employee details — Claude generates a complete professional review.</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
          <input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))}
            placeholder="e.g. Priya Sharma"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
            placeholder="e.g. Senior Developer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
          <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="5">5 — Exceptional</option>
            <option value="4">4 — Exceeds Expectations</option>
            <option value="3">3 — Meets Expectations</option>
            <option value="2">2 — Needs Improvement</option>
            <option value="1">1 — Unsatisfactory</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">KPIs / Goals Achieved *</label>
          <input value={form.kpis} onChange={e => setForm(f => ({ ...f, kpis: e.target.value }))}
            placeholder="e.g. Delivered 3 features, 95% attendance"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Manager's Feedback Notes</label>
        <textarea value={form.feedback} onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
          rows={3} placeholder="Add any additional notes about the employee's performance..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <button onClick={handleGenerate} disabled={loading}
        className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium text-sm transition-colors">
        {loading ? '🤖 Generating review...' : '✨ Generate AI Review'}
      </button>

      {result && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Generated Review</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              result.overallVerdict === 'Exceptional'           ? 'bg-green-100 text-green-700' :
              result.overallVerdict === 'Exceeds Expectations'  ? 'bg-blue-100 text-blue-700' :
              result.overallVerdict === 'Meets Expectations'    ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-600'
            }`}>{result.overallVerdict}</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-2">🏆 Achievements</h4>
              <ul className="space-y-1">
                {result.achievements?.map((a: string, i: number) => (
                  <li key={i} className="text-xs text-green-700">• {a}</li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-orange-700 mb-2">📈 Areas to Improve</h4>
              <ul className="space-y-1">
                {result.improvements?.map((a: string, i: number) => (
                  <li key={i} className="text-xs text-orange-700">• {a}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">📚 Training Recommended</h4>
              <ul className="space-y-1">
                {result.training?.map((t: string, i: number) => (
                  <li key={i} className="text-xs text-blue-700">• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Feature 4: Smart Recruitment Chatbot ─────────────────────────────────
function RecruitmentChatbot() {
  const [jobTitle, setJobTitle]             = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [started, setStarted]               = useState(false);
  const [messages, setMessages]             = useState<{ role: string; content: string }[]>([]);
  const [input, setInput]                   = useState('');
  const [loading, setLoading]               = useState(false);

  const handleStart = async () => {
    if (!jobTitle || !jobDescription) return;
    setStarted(true);
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'recruit_chat',
          jobTitle, jobDescription,
          candidateMessage: 'Hello, I am ready for the interview.',
          history: [],
        }),
      });
      const data = await res.json();
      setMessages([{ role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([{ role: 'assistant', content: 'Interview session started. Tell me about yourself.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'recruit_chat',
          jobTitle, jobDescription,
          candidateMessage: userMsg,
          history: newMessages.slice(0, -1),
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Please continue...' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!started) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Smart Recruitment Chatbot</h2>
          <p className="text-sm text-gray-500">AI conducts a screening interview based on the job description.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Senior React Developer"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
            rows={5} placeholder="Paste the job description here — the AI will ask relevant questions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={handleStart} disabled={!jobTitle || !jobDescription}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm transition-colors">
          🎙️ Start Interview Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Interview: {jobTitle}</h2>
          <p className="text-sm text-gray-500">Answer the AI interviewer's questions naturally.</p>
        </div>
        <button onClick={() => { setStarted(false); setMessages([]); setJobTitle(''); setJobDescription(''); }}
          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
          End Interview
        </button>
      </div>

      <div className="h-80 overflow-y-auto border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm'
            }`}>
              {m.role === 'assistant' && <span className="text-xs text-gray-400 block mb-1">🤖 AI Interviewer</span>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 text-sm text-gray-500">
              🤖 Evaluating your answer...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your answer..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors">
          Answer
        </button>
      </div>
    </div>
  );
}
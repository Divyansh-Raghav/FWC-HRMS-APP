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
    if (!file) retu

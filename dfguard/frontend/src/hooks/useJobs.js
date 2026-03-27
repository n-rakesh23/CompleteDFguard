import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from './useAuth';

export function useJobs() {
  const { isAuthenticated } = useAuth();
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const prevJobsRef = useRef({});

  const showNotification = useCallback((job) => {
    if (Notification.permission !== 'granted') return;
    new Notification('DFGuard — Image Protected!', {
      body: 'Your image has been successfully protected. Ready to download.',
      icon: '/vite.svg'
    });
  }, []);

  const fetchJobs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/api/jobs');
      const newJobs  = data.jobs || [];

      // Check for newly completed jobs and notify
      newJobs.forEach(job => {
        const prev = prevJobsRef.current[job._id];
        if (job.status === 'completed' && prev && prev !== 'completed') {
          showNotification(job);
        }
      });

      // Update ref with current statuses
      const statusMap = {};
      newJobs.forEach(j => { statusMap[j._id] = j.status; });
      prevJobsRef.current = statusMap;

      setJobs(newJobs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showNotification]);

  useEffect(() => {
    fetchJobs();
    // Poll every 5 seconds to catch job completions
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  /**
   * Full upload flow:
   * 1. Request presigned URL from backend
   * 2. PUT file directly to S3
   * 3. Confirm upload to backend → triggers SQS
   */
  const uploadImage = useCallback(async (file) => {
    setUploading(true);
    try {
      // Step 1: Get presigned URL
      const { data } = await api.post('/api/jobs/upload');
      const { jobId, uploadUrl } = data;

      // Step 2: Upload directly to S3
      await fetch(uploadUrl, {
        method:  'PUT',
        body:    file,
        headers: { 'Content-Type': 'image/jpeg' }
      });

      // Step 3: Confirm to backend
      await api.post(`/api/jobs/${jobId}/confirm`);

      // Refresh jobs list
      await fetchJobs();
      return { success: true, jobId };

    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  }, [fetchJobs]);

  const deleteJob = useCallback(async (jobId) => {
    const { data } = await api.delete(`/api/jobs/${jobId}`);
    setJobs(prev => prev.filter(j => j._id !== jobId));
    return data;
  }, []);

  const retryJobFn = useCallback(async (jobId) => {
    const { data } = await api.post(`/api/jobs/${jobId}/retry`);
    setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: 'queued' } : j));
    return data;
  }, []);

  return {
    jobs, loading, error, uploading,
    uploadImage, deleteJob, retryJob: retryJobFn, refetch: fetchJobs
  };
}

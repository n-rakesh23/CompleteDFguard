import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './useAuth';

export function useJobs() {
  const { isAuthenticated } = useAuth();
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [uploading,  setUploading]  = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/api/jobs');
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
    await api.delete(`/api/jobs/${jobId}`);
    setJobs(prev => prev.filter(j => j._id !== jobId));
  }, []);

  return {
    jobs, loading, error, uploading,
    uploadImage, deleteJob, refetch: fetchJobs
  };
}

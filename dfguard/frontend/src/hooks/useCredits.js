import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './useAuth';

export function useCredits() {
  const { isAuthenticated } = useAuth();
  const [credits,  setCredits]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchCredits = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await api.get('/api/credits');
      setCredits(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCredits();
    // Refresh every 60 seconds
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, [fetchCredits]);

  const displayBalance = credits?.isPro
    ? '∞'
    : (credits?.balance ?? 0);

  return { credits, displayBalance, loading, error, refetch: fetchCredits };
}

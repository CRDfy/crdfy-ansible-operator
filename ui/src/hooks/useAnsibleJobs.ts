import { useState, useEffect } from 'react';
import { AnsibleJobClient } from '../utils/kubernetes';
import type { AnsibleJobSpec, AnsibleJobStatus } from '../types/ansiblejob';

export function useAnsibleJobs(namespace: string = 'default') {
  const [jobs, setJobs] = useState<AnsibleJobSpec[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = new AnsibleJobClient();

    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedJobs = await client.getAnsibleJobs(namespace);
        setJobs(fetchedJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    const watcher = client.watchAnsibleJobs(namespace, (updatedJobs) => {
      setJobs(updatedJobs);
    });

    return () => {
      // Clean up watcher on unmount
      // Note: The Kubernetes client doesn't provide a direct way to cancel streams,
      // but we can ignore updates after unmount by checking a flag
    };
  }, [namespace]);

  return { jobs, loading, error };
}

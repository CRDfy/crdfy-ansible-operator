import { useState, useEffect } from 'react';
import { AnsibleJobClient } from '../utils/kubernetes';
import type { JobLogEntry } from '../types/ansiblejob';

export function useJobLogs(jobName: string, namespace: string = 'default') {
  const [logs, setLogs] = useState<JobLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  useEffect(() => {
    if (!jobName) return;

    const client = new AnsibleJobClient();
    let isMounted = true;

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const jobLogs = await client.getJobLogs(jobName, namespace);
        if (!isMounted) return;
        
        const parsedLogs: JobLogEntry[] = jobLogs.map(line => ({
          timestamp: new Date(),
          content: line,
          level: 'info'
        }));
        
        setLogs(parsedLogs);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLogs();

    const startStreaming = () => {
      if (isStreaming) return;
      
      setIsStreaming(true);
      client.streamJobLogs(jobName, namespace, (logEntry) => {
        if (!isMounted) return;
        setLogs(prev => [...prev, logEntry]);
      });
    };

    startStreaming();

    return () => {
      isMounted = false;
      setIsStreaming(false);
    };
  }, [jobName, namespace]);

  return { logs, loading, error, isStreaming };
}

import React from 'react';
import { useAnsibleJobs } from '../hooks/useAnsibleJobs';
import type { AnsibleJobSpec, AnsibleJobStatus } from '../types/ansiblejob';

interface JobListProps {
  namespace?: string;
}

const JobList: React.FC<JobListProps> = ({ namespace = 'default' }) => {
  const { jobs, loading, error } = useAnsibleJobs(namespace);

  if (loading) {
    return <div>Loading AnsibleJobs...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (jobs.length === 0) {
    return <div>No AnsibleJobs found.</div>;
  }

  return (
    <div>
      <h2>AnsibleJobs</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Job Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>App Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const status: AnsibleJobStatus = job.status || {};
            return (
              <tr key={job.job_id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.job_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.app_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {status.phase || 'Pending'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {job.metadata?.creationTimestamp ? 
                    new Date(job.metadata.creationTimestamp).toLocaleString() : 'Unknown'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default JobList;

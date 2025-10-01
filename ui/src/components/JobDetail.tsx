import React from 'react';
import { useJobLogs } from '../hooks/useJobLogs';
import type { AnsibleJobSpec, JobLogEntry } from '../types/ansiblejob';

interface JobDetailProps {
  job: AnsibleJobSpec;
}

const JobDetail: React.FC<JobDetailProps> = ({ job }) => {
  const { logs, loading, error, isStreaming } = useJobLogs(job.job_id);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Job Details</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Job Information</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Job ID:</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.job_id}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>App Name:</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.app_name}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Playbook:</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.playbook_name}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Status:</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {job.status?.phase || 'Pending'}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Created:</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {job.metadata?.creationTimestamp ? 
                  new Date(job.metadata.creationTimestamp).toLocaleString() : 'Unknown'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Logs</h3>
      
      {loading && <p>Loading logs...</p>}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          Error loading logs: {error}
        </div>
      )}
      
      {!loading && !error && (
        <div style={{ 
          height: '400px', 
          overflowY: 'auto', 
          border: '1px solid #ddd',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: '#f5f5f5'
        }}>
          {logs.length === 0 ? (
            <p>No logs available yet.</p>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '2px', 
                  color: log.level === 'error' ? '#d32f2f' : log.level === 'warning' ? '#ff9800' : '#333',
                  fontWeight: log.level === 'error' ? 'bold' : 'normal'
                }}
              >
                <span style={{ color: '#888', marginRight: '10px' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {log.content}
              </div>
            ))
          )}
        </div>
      )}

      {isStreaming && <p style={{ color: '#4CAF50', fontStyle: 'italic' }}>Streaming live logs...</p>}
    </div>
  );
};

export default JobDetail;

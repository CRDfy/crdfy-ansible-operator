export interface AnsibleJobSpec {
  extra_vars?: Record<string, any>;
  inventory: string;
  play_name: string;
  app_name: string;
  job_id: string;
  playbook_name: string;
  ansible_job_ttl?: number;
  ansible_tags?: string;
  skip_tags?: string;
  vault_jwt?: string;
  vault_url?: string;
}

export interface AnsibleJobStatus {
  phase: 'Pending' | 'Running' | 'Succeeded' | 'Failed';
  message?: string;
  startTime?: Date;
  completionTime?: Date;
  isFinished: boolean;
  jobName?: string;
  logsAvailable: boolean;
}

export interface JobLogEntry {
  timestamp: Date;
  content: string;
  level: 'info' | 'warning' | 'error';
}

import {
  KubeConfig,
  CoreV1Api,
  CustomObjectsApi,
} from '@kubernetes/client-node';
import type { JobLogEntry, AnsibleJobSpec, AnsibleJobStatus } from '../types/ansiblejob';

export class AnsibleJobClient {
  private kc: KubeConfig;
  private api: CustomObjectsApi;
  private coreV1Api: CoreV1Api;

  constructor() {
    this.kc = new KubeConfig();
    this.kc.loadFromDefault(); // Loads from ~/.kube/config
    this.api = this.kc.makeApiClient(CustomObjectsApi);
    this.coreV1Api = this.kc.makeApiClient(CoreV1Api);
  }

  async createAnsibleJob(spec: AnsibleJobSpec): Promise<void> {
    const ansibleJob = {
      apiVersion: 'ansible.crdfy.sh/v1alpha1',
      kind: 'AnsibleJob',
      metadata: {
        name: spec.job_id,
        namespace: 'default', // TODO: make configurable
      },
      spec,
    };

    await this.api.createNamespacedCustomObject(
      'ansible.crdfy.sh',
      'v1alpha1',
      'default', // namespace
      'ansiblejobs',
      ansibleJob,
    );
  }

  async getAnsibleJobs(namespace: string = 'default'): Promise<AnsibleJobSpec[]> {
    const result = await this.api.listNamespacedCustomObject(
      'ansible.crdfy.sh',
      'v1alpha1',
      namespace,
      'ansiblejobs'
    );
    
    // Extract the full AnsibleJob resource including metadata and status
    const items = (result.body as any).items || [];
    return items.map((item: any) => ({
      ...item.spec,
      metadata: item.metadata,
      status: item.status || {}
    }));
  }

  async watchAnsibleJobs(
    namespace: string = 'default',
    callback: (jobs: AnsibleJobSpec[]) => void,
  ): Promise<void> {
    const stream = await this.api.listNamespacedCustomObject(
      'ansible.crdfy.sh',
      'v1alpha1',
      namespace,
      'ansiblejobs',
      undefined, // resourceVersion
      undefined, // timeoutSeconds
      true,    // watch
    );

    stream.on('data', (data: any) => {
      const job = data.object;
      if (job && job.spec) {
        callback([job.spec]);
      }
    });

    stream.on('error', (err: Error) => {
      console.error('Error watching AnsibleJobs:', err);
    });
  }

  async getJobLogs(jobName: string, namespace: string = 'default'): Promise<string[]> {
    try {
      const job = await this.coreV1Api.readNamespacedJob(jobName, namespace);
      if (!job.body?.spec?.selector?.matchLabels?.app) {
        throw new Error(`No app label found in job selector for ${jobName}`);
      }

      const pods = await this.coreV1Api.listNamespacedPod(
        namespace,
        `app=${job.body.spec.selector.matchLabels.app}`,
        undefined, // fieldSelector
        undefined, // resourceVersion
        undefined, // timeoutSeconds
        undefined, // watch
      );

      if (!pods.body?.items || pods.body.items.length === 0) {
        throw new Error(`No pods found for job ${jobName}`);
      }

      const podName = pods.body.items[0].metadata?.name;
      if (!podName) {
        throw new Error(`No pod name found for job ${jobName}`);
      }

      const logs = await this.coreV1Api.readNamespacedPodLog(
        podName,
        namespace
      );

      return logs.body.split('\n').filter(line => line.length > 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error(`Failed to retrieve logs for job ${jobName}`);
    }
  }

  async streamJobLogs(
    jobName: string,
    namespace: string = 'default',
    onLog: (log: JobLogEntry) => void,
  ): Promise<void> {
    try {
      const job = await this.coreV1Api.readNamespacedJob(jobName, namespace);
      if (!job.body?.spec?.selector?.matchLabels?.app) {
        throw new Error(`No app label found in job selector for ${jobName}`);
      }

      const pods = await this.coreV1Api.listNamespacedPod(
        namespace,
        `app=${job.body.spec.selector.matchLabels.app}`,
        undefined, // fieldSelector
        undefined, // resourceVersion
        undefined, // timeoutSeconds
        undefined, // watch
      );

      if (!pods.body?.items || pods.body.items.length === 0) {
        throw new Error(`No pods found for job ${jobName}`);
      }

      const podName = pods.body.items[0].metadata?.name;
      if (!podName) {
        throw new Error(`No pod name found for job ${jobName}`);
      }

      const stream = await this.coreV1Api.readNamespacedPodLog(
        podName,
        namespace,
        undefined, // container
        true,    // follow
        100,     // tailLines (limit to last 100 lines)
        undefined, // timestamps
        false,   // previous (don't get previous logs)
        true     // pretty
      );

      stream.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.length > 0);
        lines.forEach(line => {
          const level = this.determineLogLevel(line);
          onLog({
            timestamp: new Date(),
            content: line,
            level
          });
        });
      });

      stream.on('end', () => {
        onLog({
          timestamp: new Date(),
          content: 'Job completed',
          level: 'info'
        });
      });

      stream.on('error', (err: Error) => {
        console.error('Error streaming logs:', err);
        onLog({
          timestamp: new Date(),
          content: `Error streaming logs: ${err.message}`,
          level: 'error'
        });
      });

    } catch (error) {
      console.error('Error starting log stream:', error);
      onLog({
        timestamp: new Date(),
        content: `Failed to start log stream for job ${jobName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        level: 'error'
      });
    }
  }

  private determineLogLevel(line: string): 'info' | 'warning' | 'error' {
    if (!line) return 'info';
    
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error') || line.includes('FAILED')) {
      return 'error';
    } else if (lowerLine.includes('warning') || line.includes('WARN')) {
      return 'warning';
    } else {
      return 'info';
    }
  }
}

export class JobStatusProcessor {
  process(status: any): AnsibleJobStatus {
    const phase = this.getPhase(status);
    
    return {
      phase,
      message: status?.message || undefined,
      startTime: status?.startTime ? new Date(status.startTime) : undefined,
      completionTime: status?.completionTime ? new Date(status.completionTime) : undefined,
      isFinished: phase === 'Succeeded' || phase === 'Failed',
      jobName: status?.jobName || undefined,
      logsAvailable: !!status?.logsAvailable
    };
  }

  private getPhase(status: any): 'Pending' | 'Running' | 'Succeeded' | 'Failed' {
    if (!status) return 'Pending';
    
    if (status.phase === 'Succeeded') return 'Succeeded';
    if (status.phase === 'Failed') return 'Failed';
    
    // If jobName is set, assume it's running
    if (status.jobName) return 'Running';
    
    // Otherwise pending until job is created
    return 'Pending';
  }

  formatTime(date?: Date): string {
    if (!date) return '-';
    return date.toLocaleString();
  }
}

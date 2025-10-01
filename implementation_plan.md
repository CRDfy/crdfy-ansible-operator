# Implementation Plan

## Overview
Create a React-based web UI to create, monitor, and stream live logs of AnsibleJob CRDs in a Kubernetes cluster using direct kubeconfig-based access with UI-level RBAC.
Use nextjs with react. 

## Types
- **AnsibleJobSpec**: Represents the desired state of an AnsibleJob.
  - `extra_vars`: Record<string, any> (optional) - Key-value pairs for Ansible variables.
  - `inventory`: string - Path or content of the inventory file.
  - `play_name`: string - Name of the playbook to execute.
  - `app_name`: string - Application name associated with the job.
  - `job_id`: string - Unique identifier for the job instance.
  - `playbook_name`: string - URL or path to the playbook archive.
  - `ansible_job_ttl`: number - Time-to-live in seconds for Kubernetes job objects after completion.
  - `ansible_tags`: string (optional) - Comma-separated list of tags to include in execution.
  - `skip_tags`: string (optional) - Comma-separated list of tags to exclude from execution.
  - `vault_jwt`: string (optional) - JWT token for HashiCorp Vault authentication.
  - `vault_url`: string (optional) - URL of the HashiCorp Vault instance.

- **AnsibleJobStatus**: Represents the observed state of an AnsibleJob.
  - `phase`: 'Pending' | 'Running' | 'Succeeded' | 'Failed'
  - `message`: string (optional) - Human-readable status message.
  - `startTime`: Date (optional)
  - `completionTime`: Date (optional)
  - `isFinished`: boolean
  - `jobName`: string (optional) - Name of the underlying Kubernetes Job resource.
  - `logsAvailable`: boolean

- **UserRoles**: Enum for UI-level RBAC roles.
  - `Viewer` - Can view jobs and logs but cannot create or modify.
  - `Editor` - Can create, update, delete jobs and view logs.
  - `Admin` - Full access including RBAC management.

- **JobLogEntry**: Represents a single line of job output.
  - `timestamp`: Date
  - `content`: string
  - `level`: 'info' | 'warning' | 'error'

## Files
- New files to be created:
  - `ui/src/App.tsx` - Main React component with routing and layout.
  - `ui/src/components/JobList.tsx` - Component to display list of AnsibleJobs.
  - `ui/src/components/JobDetail.tsx` - Component to show job details and live logs.
  - `ui/src/components/JobForm.tsx` - Form to create new AnsibleJobs.
  - `ui/src/components/LogStream.tsx` - Live log streaming component with scroll and filtering.
  - `ui/src/components/RBACSelector.tsx` - Role-based access control selector for user permissions.
  - `ui/src/hooks/useKubeConfig.ts` - Hook to load and validate kubeconfig from ~/.kube/config.
  - `ui/src/hooks/useAnsibleJobs.ts` - Custom hook to fetch and watch AnsibleJob resources.
  - `ui/src/hooks/useJobLogs.ts` - Hook to stream job logs using Kubernetes API.
  - `ui/src/types/ansiblejob.ts` - TypeScript interfaces for AnsibleJob CRD.
  - `ui/src/utils/kubernetes.ts` - Utility functions to interact with Kubernetes API.
  - `ui/src/App.css` - Main application styles.
  - `ui/public/index.html` - HTML template for React app.
  - `ui/package.json` - Frontend dependencies and scripts.

- Existing files to be modified:
  - None (new project)

- Files to be deleted or moved:
  - None

- Configuration file updates:
  - None (UI will use default kubeconfig and no external configuration files)

## Functions
- New functions:
  - `loadKubeConfig()` in `ui/src/utils/kubernetes.ts` - Loads kubeconfig from user's home directory and validates it.
  - `createAnsibleJob(spec: AnsibleJobSpec)` in `ui/src/utils/kubernetes.ts` - Creates a new AnsibleJob via Kubernetes API.
  - `getAnsibleJobs(namespace: string)` in `ui/src/utils/kubernetes.ts` - Fetches all AnsibleJob resources in a namespace.
  - `watchAnsibleJobs(namespace: string, callback: (jobs: AnsibleJob[]) => void)` in `ui/src/utils/kubernetes.ts` - Sets up a WebSocket-style watch on AnsibleJob resources.
  - `getJobLogs(jobName: string, namespace: string)` in `ui/src/utils/kubernetes.ts` - Fetches logs from the underlying Kubernetes Job pod.
  - `streamJobLogs(jobName: string, namespace: string, onLog: (log: JobLogEntry) => void)` in `ui/src/utils/kubernetes.ts` - Streams live logs via Kubernetes API with retry and backoff.
  - `getJobStatus(job: AnsibleJob)` in `ui/src/utils/kubernetes.ts` - Translates raw AnsibleJob status into human-readable state.

- Modified functions:
  - None

- Removed functions:
  - None

## Classes
- New classes:
  - `AnsibleJobClient` in `ui/src/utils/kubernetes.ts` - Wrapper class encapsulating all Kubernetes API interactions for AnsibleJob CRD.
    - Methods: create, list, watch, getLogs, streamLogs
  - `JobStatusProcessor` in `ui/src/utils/kubernetes.ts` - Class to normalize and enrich AnsibleJob status fields.
    - Methods: process, getPhase, formatTime

- Modified classes:
  - None

- Removed classes:
  - None

## Dependencies
- New packages to install:
  - `@kubernetes/client-node` v0.18.2 - Official Kubernetes client for Node.js to interact with the API.
  - `react-router-dom` v6.24.0 - For routing between job list, detail, and form views.
  - `react-icons` v5.2.1 - For UI icons (e.g., job status indicators).
  - `@types/react` v18.3.5 - TypeScript definitions for React.
  - `@types/node` v20.14.5 - TypeScript definitions for Node.js (needed by Kubernetes client).
  - `axios` v1.7.2 - For fallback HTTP requests if WebSocket streaming fails.
  - `date-fns` v3.6.0 - For date formatting in logs and job timestamps.

- Version changes:
  - None

- Integration requirements:
  - The UI must be built with React and bundled using Vite.
  - Kubernetes client requires a valid kubeconfig file at ~/.kube/config on the user's machine.
  - Must handle Kubernetes API authentication via kubeconfig (user, token, or certificate).
  - Live log streaming requires SSE/HTTP long-polling fallback if WebSocket is unavailable.

## Testing
- Test file requirements:
  - `ui/src/__tests__/useAnsibleJobs.test.tsx` - Unit tests for job fetching and watching.
  - `ui/src/__tests__/useJobLogs.test.tsx` - Tests for log streaming with mock WebSocket server.
  - `ui/src/__tests__/KubernetesUtils.test.ts` - Unit tests for AnsibleJobClient and JobStatusProcessor.
  - `ui/src/__tests__/JobForm.test.tsx` - Integration test for form validation and submission.

- Existing test modifications:
  - None

- Validation strategies:
  - Unit tests for all utility functions and hooks.
  - End-to-end test: Create job → verify in UI → stream logs → confirm status updates.
  - Validate kubeconfig loading fails gracefully with user-friendly error message.
  - Verify RBAC selector disables form controls appropriately for Viewer role.

## Implementation Order
1. Create directory structure: `mkdir -p ui/src/{components,hooks,utils,types,__tests__} && mkdir -p ui/public`
2. Initialize React project with Vite: `npm create vite@latest ui -- --template react-ts`
3. Install dependencies: `cd ui && npm install @kubernetes/client-node react-router-dom react-icons date-fns axios`
4. Create `ui/src/types/ansiblejob.ts` with AnsibleJobSpec, AnsibleJobStatus, and JobLogEntry interfaces.
5. Implement `ui/src/utils/kubernetes.ts` with AnsibleJobClient and JobStatusProcessor classes.
6. Implement `ui/src/hooks/useKubeConfig.ts` to load and validate kubeconfig from ~/.kube/config.
7. Implement `ui/src/hooks/useAnsibleJobs.ts` to fetch and watch AnsibleJob resources.
8. Implement `ui/src/hooks/useJobLogs.ts` to stream live logs from Kubernetes Job pods.
9. Create `ui/src/components/JobList.tsx` to display list of AnsibleJobs with status indicators.
10. Create `ui/src/components/JobDetail.tsx` to show job details and log viewer.
11. Create `ui/src/components/JobForm.tsx` to create new AnsibleJobs with form validation.
12. Create `ui/src/components/LogStream.tsx` to display real-time log output with scroll and filtering.
13. Create `ui/src/components/RBACSelector.tsx` to set user role and restrict UI actions.
14. Create `ui/src/App.tsx` with routing to JobList, JobDetail, and JobForm components.
15. Create `ui/public/index.html` with minimal React root element.
16. Add `ui/package.json` scripts for dev and build.
17. Create test files in `ui/src/__tests__/` with mock Kubernetes API responses.
18. Run tests: `npm test`
19. Start dev server: `npm run dev` and verify UI renders without errors.
20. Validate live log streaming with a test AnsibleJob in the target cluster.

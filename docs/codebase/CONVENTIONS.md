# Conventions

## Naming Conventions
- **Files**: 
  - Kubernetes manifests and Ansible files use `snake_case` (e.g., `api_client.py`, `job_definition.yml.j2`, `allow-metrics-traffic.yaml`).
  - Note: Some Kubernetes manifests use kebab-case (e.g., `allow-metrics-traffic.yaml`), while others use snake_case (e.g., `ansiblejob_admin_role.yaml`).
- **Variables**: 
  - Ansible variables and CRD fields use `snake_case` (e.g., `job_id`, `play_name`, `extra_vars`, `backoff_limit`).
- **Roles/Collections**: Follow standard Ansible naming conventions.

## Error Handling
- **Ansible Level**: Uses `assert` for input validation and `meta: end_play` to terminate execution early when certain conditions are met (e.g., job already finished).
- **Operator Level**: The operator catches failures during template rendering or execution and updates the `AnsibleJob` CRD status with descriptive error messages (e.g., `isFinished: true`, `error: "..."`).
- **Status Reporting**: Errors are communicated back to the user via the `status.error` field in the `AnsibleJob` custom resource.

## Logging & Observability
- **Execution Logs**: The execution pods use structured `echo` statements to create visual separators in the logs (e.g., `--- INITIALIZE ---`).
- **Observability**: OpenTelemetry is integrated into the execution pods. Environment variables like `ANSIBLE_OPENTELEMETRY_ENABLED` are used to enable tracing and metrics collection, with endpoints configured for OpenTelemetry collectors (e.g., Loki/OTLP).

## Organization
- **Ansible Structure**: Follows standard Ansible role structure (`tasks/`, `templates/`, `defaults/`, `vars/`, etc.).
- **Kubernetes Manifests**: Organized by functional area (RBAC, CRD, Manager, etc.) within the `config/` directory and managed via Kustomize.

## Evidence
- `roles/ansiblejob/tasks/main.yml`: Demonstrates error handling via `assert` and status updates.
- `roles/ansiblejob/templates/job_definition.yml.j2`: Shows logging patterns and OpenTelemetry configuration.
- `config/`: Demonstrates directory organization for Kubernetes manifests.
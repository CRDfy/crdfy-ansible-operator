# Integrations

## External APIs & Services
- **Kubernetes API**: The core integration. The operator interacts with the Kubernetes API to watch for `AnsibleJob` resources and manage underlying `Job` resources.
- **HashiCorp Vault**: Used for secure secret management. The execution pods can use a `vault_jwt` to authenticate with a Vault instance (`vault_url`) to retrieve secrets during Ansible playbook execution.

## Monitoring & Observability
- **Prometheus**: Integrated via `ServiceMonitor` resources (e.g., in `config/prometheus/`) to scrape metrics from the operator's controller manager.
- **OpenTelemetry (OTel)**: The execution pods are configured with OpenTelemetry to export traces and metrics.
  - **Endpoint**: `http://loki-gateway.meta.svc.cluster.local/`
  - **Protocol**: `http/protobuf`
- **Loki**: Indicated as the destination for OpenTelemetry data in the execution environment.

## Security & Authentication
- **Kubernetes RBAC**: Uses ServiceAccounts and Roles/RoleBindings (defined in `config/rbac/`) to grant the operator necessary permissions within the cluster.
- **Vault Authentication**: Leverages JWT tokens for identity-based access to HashiCorp Vault.

## Evidence
- `config/prometheus/monitor.yaml`: Shows Prometheus `ServiceMonitor` configuration for scraping metrics.
- `roles/ansiblejob/templates/job_definition.yml.j2`: Shows OpenTelemetry environment variables and Vault configuration for execution pods.
- `config/rbac/`: Contains the RBAC definitions used for Kubernetes API integration.
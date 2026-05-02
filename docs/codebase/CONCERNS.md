# Concerns

## Technical Debt
- **Placeholder Files**: Several directories contain `.placeholder` files (e.g., `roles/.placeholder`, `roles/ansiblejob/files/.placeholder`, `playbooks/.placeholder`), indicating incomplete scaffolding or intended future expansion.
- **Incomplete Scaffolding**: The `playbooks/` directory is currently empty of actual playbooks, containing only a placeholder.

## Security Risks
- **Insecure TLS in Metrics**: The `config/prometheus/monitor.yaml` file currently uses `insecureSkipVerify: true` for the metrics service monitor, which is noted as a security risk in the file comments.
- **Secret Management**: While HashiCorp Vault is supported, the implementation relies on users providing `vault_jwt` via the CRD. Ensuring secure handling of these tokens is critical.

## Performance & Scalability
- **Runtime Downloads**: The execution pods download Ansible collections and playbooks at runtime (`ansible-galaxy install`, `wget`). This can lead to increased startup latency and dependency on external network availability/reliability.

## Known Issues / TODOs
- **API Client Implementation**: A comment in `roles/ansiblejob/tasks/main.yml` indicates that `api_client.py` needs to be updated to handle return codes appropriately (0 for success, 1 for failure).

## Evidence
- `roles/ansiblejob/tasks/main.yml`: Contains TODO regarding `api_client.py`.
- `config/prometheus/monitor.yaml`: Contains TODO regarding insecure TLS configuration.
- Directory listing: Shows presence of `.placeholder` files in multiple locations.
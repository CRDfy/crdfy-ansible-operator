# Directory Layout

## Core Logic (Ansible)
- `roles/ansiblejob/`: The primary Ansible role containing the automation logic.
  - `tasks/`: Contains the main task execution steps.
  - `templates/`: Jinja2 templates used to generate Kubernetes resources (e.g., Job definitions).
  - `defaults/`: Default variables for the role.
  - `vars/`: Role-specific variables.
  - `handlers/`: Ansible handlers for triggered actions.
  - `files/`: Static files used by the role (e.g., `api_client.py`).
  - `meta/`: Role metadata.

## Kubernetes Configuration (Manifests)
- `config/`: Contains all Kubernetes manifests managed via Kustomize.
  - `crd/`: Custom Resource Definition (CRD) definitions for `AnsibleJob`.
  - `rbac/`: Role-Based Access Control configurations (Roles, RoleBindings, ServiceAccounts).
  - `default/`: Default configuration for the operator (metrics, etc.).
  - `manager/`: Manager deployment configurations.
  - `network-policy/`: Network security policies.
  - `prometheus/`: Monitoring configurations.
  - `testing/`: Manifests for testing scenarios.
  - `scorecard/`: Operator lifecycle scorecard configurations.
  - `samples/`: Example `AnsibleJob` CRD instances for testing and demonstration.

## Testing & Development
- `molecule/`: Test environments for Ansible roles using Molecule (supports `default` and `kind` drivers).
- `playbooks/`: Placeholder for Ansible playbooks.

## Documentation & Project Info
- `docs/`: General project documentation and concept diagrams.
- `implementation_plan.md`: Roadmap for future features (e.g., Web UI).
- `README.md`: High-level project overview and concept.

## Other
- `samples_with_secrets/`: Examples of CRDs containing sensitive data or specific configurations.

## Entry Points
- **Operator Runtime**: The operator is executed as a container, triggered by the `ansible-operator` binary (defined in `Dockerfile`), which watches for changes to the `AnsibleJob` CRD via `watches.yaml`.

## Evidence
- `roles/ansiblejob/`: Contains the core Ansible role structure.
- `config/`: Contains Kustomize-based Kubernetes manifests.
- `molecule/`: Contains Molecule testing configurations.
- `Dockerfile`: Defines the container entrypoint and runtime.
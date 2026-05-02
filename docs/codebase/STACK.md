# Tech Stack

## Core Runtime & Frameworks
- **Ansible Operator SDK**: The project is built as a Kubernetes Operator using the Ansible Operator framework.
- **Ansible**: Used for defining automation logic and managing Kubernetes resources via roles and playbooks.
- **Kubernetes**: The target orchestration platform.

## Languages
- **YAML**: Primary language for configuration, Kubernetes manifests, and Ansible playbooks/roles.
- **Python**: Used for auxiliary scripts (e.g., `api_client.py`).

## Dependencies
### Ansible Collections
Managed via `requirements.yml`:
- `operator_sdk.util` (v0.5.0)
- `kubernetes.core` (v3.2.0)
- `cloud.common` (v3.0.0)
- `community.docker` (v3.12.1)

### Containerization
- **Base Image**: `quay.io/operator-framework/ansible-operator:v1.39.0`
- **Runtime**: Managed by the Ansible Operator entrypoint.

## Tooling & CI/CD
- **GitLab CI**: Used for continuous integration and deployment.
- **Docker**: Used for building the operator image.
- **Make**: Used for build and deployment orchestration.
- **Kustomize**: Used for managing Kubernetes manifests in the `config/` directory.

## Evidence
- `Dockerfile`: Defines base image and installation of Ansible collections.
- `requirements.yml`: Lists required Ansible collections.
- `.gitlab-ci.yml`: Indicates GitLab CI usage.
- `Makefile`: Provides build/deploy commands.
- `config/`: Contains Kustomize manifests.
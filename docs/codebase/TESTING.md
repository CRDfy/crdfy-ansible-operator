# Testing

## Test Frameworks & Runners
- **Molecule**: Used for testing Ansible roles. It manages the lifecycle of test environments (provisioning, converging, verifying, and destroying).
- **Ansible**: The primary provisioner for Molecule tests.
- **Operator SDK Scorecard**: Used to validate the operator's compliance with best practices (configured in `config/scorecard/`).

## Test Organization
- **Ansible Role Testing**: Located in the `molecule/` directory.
  - `molecule/default/`: Standard testing suite for the Ansible role.
  - `molecule/kind/`: Testing suite specifically designed to run against a Kubernetes cluster created via `kind` (Kubernetes in Docker).
- **Operator Lifecycle Testing**: Managed through the `config/scorecard/` directory, which contains configurations for running operator-sdk scorecard tests.

## Testing Strategy
- **Role-Level Testing (Molecule)**: 
  - Uses a `delegated` driver in the default configuration, implying tests are run against an existing or managed Kubernetes cluster.
  - The `provisioner` is Ansible, which executes the role's tasks in a test environment.
  - The `verifier` is also Ansible, used to run verification playbooks after the role has converged.
- **Integration Testing**: Molecule tests with the `kind` driver provide integration testing by spinning up a local Kubernetes cluster to verify that the Ansible roles correctly interact with Kubernetes resources.
- **Compliance Testing**: The Scorecard tests ensure the operator meets standard requirements for deployment, RBAC, and lifecycle management.

## Evidence
- `molecule/default/molecule.yml`: Defines the Molecule test configuration, including drivers and provisioners.
- `config/scorecard/`: Contains configurations for operator scorecard testing.
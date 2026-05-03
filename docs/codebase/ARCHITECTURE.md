# Architecture

## Design Patterns
- **Kubernetes Operator Pattern**: The project implements a custom controller that follows the reconciliation loop pattern. It watches for `AnsibleJob` Custom Resources (CRDs) and ensures the actual state of the cluster matches the desired state defined in the CRD.
- **Declarative Automation**: Users define the "what" (the `AnsibleJob` spec) and the operator handles the "how" (executing Ansible playbooks via Kubernetes Jobs).
- **Template-based Resource Generation**: Uses Jinja2 templates to dynamically generate Kubernetes `Job` resources based on the parameters provided in the `AnsibleJob` CRD.

## Data Flow
1. **Resource Creation**: A user applies an `AnsibleJob` manifest to the Kubernetes cluster.
2. **Detection**: The Ansible Operator (running in a pod) detects the new `AnsibleJob` resource via the Kubernetes API.
3. **Reconciliation**:
   - The operator executes the `roles/ansiblejob/tasks/main.yml` playbook.
   - It validates the input and runs a local Python script (`api_client.py`) to prepare the environment.
   - It renders the `job_definition.yml.j2` template with variables from the CRD (e.g., `play_name`, `inventory`, `extra_vars`).
4. **Execution**: 
   - The operator creates a Kubernetes `Job` resource based on the rendered template.
   - This `Job` starts a pod using the `galaxy.lan/ansible-runtime:latest` image.
   - The pod executes the `ansible-playbook` command, downloading necessary playbooks and collections at runtime.
5. **Status Update**: 
   - The operator monitors the status of the underlying Kubernetes `Job`.
   - Once the `Job` succeeds or fails, the operator updates the `status` field of the `AnsibleJob` CRD (e.g., setting `isFinished: true`, updating `phase`, or providing error messages).

## Layers
- **API Layer**: Kubernetes API server hosting the `AnsibleJob` CRD.
- **Control Plane (Operator)**: The Ansible Operator running the reconciliation logic, managing the lifecycle of `AnsibleJob` resources.
- **Execution Layer**: Transient Kubernetes `Job` pods that perform the actual Ansible automation tasks.

## Evidence
- `roles/ansiblejob/tasks/main.yml`: Shows the reconciliation logic and status updates.
- `roles/ansiblejob/templates/job_definition.yml.j2`: Shows how the execution layer (Kubernetes Job) is constructed.
- `config/crd/bases/ansible.crdfy.sh_ansiblejobs.yaml`: Defines the API schema for the `AnsibleJob` resource.
- `Dockerfile`: Shows the operator runtime environment.
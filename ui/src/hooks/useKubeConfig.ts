import { KubeConfig } from '@kubernetes/client-node';

export function useKubeConfig() {
  const kc = new KubeConfig();
  
  try {
    kc.loadFromDefault();
    return kc;
  } catch (error) {
    throw new Error('Failed to load kubeconfig from ~/.kube/config. Please ensure you have a valid kubeconfig file and are authenticated to your Kubernetes cluster.');
  }
}

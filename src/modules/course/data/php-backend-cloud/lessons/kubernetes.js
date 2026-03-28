export default {
  phase: 'Phase 8 · DevOps & Certifications',
  title: 'Kubernetes Fundamentals',
  intro: 'Kubernetes (K8s) is the industry-standard container orchestration platform. It declaratively manages containerized workloads: scheduling pods across nodes, self-healing failed containers, scaling deployments, and managing service discovery. Senior PHP engineers need enough Kubernetes knowledge to deploy, debug, and scale applications on EKS or GKE.',
  tags: ['Pods', 'Deployments', 'Services', 'ConfigMaps', 'Secrets', 'HPA', 'RBAC', 'Namespaces'],
  seniorExpectations: [
    'Write Deployment, Service, ConfigMap, and Secret manifests',
    'Debug failing pods with kubectl logs, describe, exec',
    'Configure resource requests/limits and understand OOMKilled vs CPU throttling',
    'Set up RBAC: ServiceAccounts, Roles, and RoleBindings',
    'Understand the control plane components: API server, etcd, scheduler, controller manager',
  ],
  body: `
<h2>Kubernetes Architecture</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Control plane + worker nodes</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Control Plane (managed by EKS/GKE):
  ├── API Server      — single entry point for all K8s operations
  ├── etcd            — distributed key-value store (cluster state)
  ├── Scheduler       — assigns pods to nodes
  └── Controller Mgr  — reconciles desired vs actual state (ReplicaSet, Deployment...)

Worker Nodes:
  ├── kubelet         — agent on each node, runs pods
  ├── kube-proxy      — network rules (Service routing)
  └── Container runtime (containerd, Docker)
</code></pre>
</div>

<h2>Essential Manifests</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — ConfigMap + Secret</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: v1
kind: ConfigMap
metadata:
  name: php-app-config
  namespace: production
data:
  APP_ENV: "production"
  APP_URL: "https://api.example.com"
  CACHE_DRIVER: "redis"

---
apiVersion: v1
kind: Secret
metadata:
  name: php-app-secrets
  namespace: production
type: Opaque
data:
  DB_PASSWORD: c2VjcmV0MTIz   # base64 encoded: echo -n 'secret123' | base64
  JWT_SECRET: bXlqd3RzZWNyZXQ=
# In production: use AWS Secrets Manager CSI Driver or External Secrets Operator
# instead of storing secrets in YAML files (which get committed to git)
</code></pre>
</div>

<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — Full Deployment</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: php-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: php-app
    spec:
      serviceAccountName: php-app-sa
      containers:
        - name: php-app
          image: 123456789.dkr.ecr.eu-west-1.amazonaws.com/my-app:v1.2.3
          ports:
            - containerPort: 9000
          envFrom:
            - configMapRef:
                name: php-app-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: php-app-secrets
                  key: DB_PASSWORD
          resources:
            requests:
              cpu: "250m"     # 0.25 vCPU — used for scheduling
              memory: "256Mi" # guaranteed allocation
            limits:
              cpu: "500m"     # throttled if exceeded (not killed)
              memory: "512Mi" # OOMKilled if exceeded
          readinessProbe:
            httpGet: { path: /health, port: 9000 }
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 9000 }
            initialDelaySeconds: 30
            periodSeconds: 10
</code></pre>
</div>

<h2>Essential kubectl Commands</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — Debugging toolkit</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># View resources
kubectl get pods -n production
kubectl get pods -n production -o wide        # show node assignment
kubectl describe pod php-app-7d4f8c-xk2p9 -n production  # events, conditions

# Logs
kubectl logs php-app-7d4f8c-xk2p9 -n production
kubectl logs php-app-7d4f8c-xk2p9 -n production --previous  # crashed container
kubectl logs -l app=php-app -n production --tail=100         # all pods by label

# Exec into a pod
kubectl exec -it php-app-7d4f8c-xk2p9 -n production -- /bin/sh

# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f k8s/                  # apply entire directory

# Rollout management
kubectl rollout status deployment/php-app -n production
kubectl rollout history deployment/php-app -n production
kubectl rollout undo deployment/php-app -n production  # rollback

# Port-forward for local debugging
kubectl port-forward pod/php-app-7d4f8c-xk2p9 8080:9000 -n production
</code></pre>
</div>

<h2>RBAC — ServiceAccount</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — Minimal RBAC for a PHP app</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: v1
kind: ServiceAccount
metadata:
  name: php-app-sa
  namespace: production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456:role/php-app-role  # IRSA: maps to AWS IAM role
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: php-app-role
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]  # read-only config access
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: php-app-rolebinding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: php-app-sa
roleRef:
  kind: Role
  name: php-app-role
  apiGroup: rbac.authorization.k8s.io
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Requests: minimum guaranteed; Limits: maximum allowed — CPU throttled, memory OOMKilled</li>
    <li>Readiness probe: pod receives traffic only when ready; Liveness probe: restart if unhealthy</li>
    <li>Rolling update: maxUnavailable + maxSurge control how many pods are replaced simultaneously</li>
    <li>Never store secrets in base64 in YAML committed to git — use External Secrets Operator or CSI driver</li>
    <li>IRSA (IAM Roles for Service Accounts): maps K8s ServiceAccount to AWS IAM role — no credentials on pods</li>
  </ul>
</div>
`,
};

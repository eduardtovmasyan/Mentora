export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS EKS (Kubernetes)',
  intro: 'EKS (Elastic Kubernetes Service) is AWS managed Kubernetes. It handles the control plane; you manage worker nodes (or use Fargate). Kubernetes provides declarative deployments, rolling updates, self-healing, and horizontal pod autoscaling. Senior PHP engineers need enough Kubernetes knowledge to deploy, debug, and scale containerized applications.',
  tags: ['Pods', 'Deployments', 'Services', 'Ingress', 'HPA', 'ConfigMap', 'Secrets', 'Helm'],
  seniorExpectations: [
    'Write Deployment and Service manifests for a PHP application',
    'Configure Horizontal Pod Autoscaler (HPA) based on CPU metrics',
    'Use ConfigMaps for non-sensitive config and Secrets for sensitive values',
    'Configure an Ingress with ALB Ingress Controller for HTTP routing',
    'Understand rolling update strategy and how to perform a zero-downtime deployment',
  ],
  body: `
<h2>Core Kubernetes Objects</h2>
<table class="ctable">
  <thead><tr><th>Object</th><th>Purpose</th></tr></thead>
  <tbody>
    <tr><td>Pod</td><td>Smallest deployable unit — one or more containers sharing network/storage</td></tr>
    <tr><td>Deployment</td><td>Manages ReplicaSets — declares desired state, handles rolling updates</td></tr>
    <tr><td>Service</td><td>Stable IP/DNS for a set of pods — ClusterIP, NodePort, LoadBalancer</td></tr>
    <tr><td>Ingress</td><td>HTTP/HTTPS routing rules — maps paths/hosts to Services</td></tr>
    <tr><td>ConfigMap</td><td>Non-sensitive config injected as env vars or files</td></tr>
    <tr><td>Secret</td><td>Sensitive data (base64 encoded, can be encrypted at rest with KMS)</td></tr>
    <tr><td>HPA</td><td>Horizontal Pod Autoscaler — scale replicas based on metrics</td></tr>
  </tbody>
</table>

<h2>PHP App Deployment Manifest</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — deployment.yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
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
      maxUnavailable: 1   # at most 1 pod unavailable during update
      maxSurge: 1         # at most 1 extra pod during update
  template:
    metadata:
      labels:
        app: php-app
    spec:
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
                  key: db-password
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /health
              port: 9000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 9000
            initialDelaySeconds: 30
            periodSeconds: 10
</code></pre>
</div>

<h2>Service + Ingress</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — service.yaml + ingress.yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">---
apiVersion: v1
kind: Service
metadata:
  name: php-app-svc
spec:
  selector:
    app: php-app
  ports:
    - port: 80
      targetPort: 9000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: php-app-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: php-app-svc
                port:
                  number: 80
</code></pre>
</div>

<h2>Horizontal Pod Autoscaler</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — hpa.yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70  # scale when avg CPU > 70%
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Readiness probe: pod receives traffic only when ready; liveness probe: restart pod if unhealthy</li>
    <li>Resource requests: used for scheduling; limits: enforced at runtime (CPU throttled, memory OOMKilled)</li>
    <li>Rolling update: maxUnavailable=1 + maxSurge=1 = zero-downtime deploy with gradual rollout</li>
    <li>ConfigMap: non-sensitive env vars; Secret: sensitive values (base64 encoded, use AWS Secrets Manager CSI driver for production)</li>
    <li>HPA requires metrics-server; for custom metrics use KEDA (Kubernetes Event-Driven Autoscaling)</li>
  </ul>
</div>
`,
};

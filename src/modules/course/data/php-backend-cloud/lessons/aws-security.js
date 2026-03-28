export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS Security: WAF, Shield, GuardDuty, IAM & Secrets',
  intro: 'Security on AWS is a shared responsibility — AWS secures the infrastructure, you secure everything you put on top of it. This lesson covers the primary security services every senior engineer must understand: WAF for layer-7 traffic filtering, Shield for DDoS protection, GuardDuty for threat detection, Security Hub for centralised visibility, IAM best practices, Secrets Manager vs SSM Parameter Store for credential management, and VPC-level controls via security groups, NACLs, and Flow Logs.',
  tags: ['aws', 'security', 'waf', 'shield', 'guardduty', 'iam', 'secrets-manager', 'vpc'],
  seniorExpectations: [
    'Design a layered security architecture using WAF, Security Groups, and NACLs together',
    'Choose between Secrets Manager and SSM Parameter Store based on rotation and cost requirements',
    'Interpret GuardDuty findings and define automated remediation workflows',
    'Implement IAM least-privilege policies including permission boundaries and SCPs',
    'Explain what VPC Flow Logs capture and how to use them for incident investigation',
  ],
  body: `
<h2>AWS WAF — Web Application Firewall</h2>
<p>AWS WAF operates at layer 7 and inspects HTTP/HTTPS traffic before it reaches your application. It attaches to CloudFront, Application Load Balancers, API Gateway, and AppSync. WAF evaluates requests against <strong>Web ACLs</strong> composed of rules and rule groups.</p>

<p><strong>Rule types:</strong></p>
<ul>
  <li><strong>Managed Rule Groups</strong> — AWS-maintained rule sets (e.g., <code>AWSManagedRulesCommonRuleSet</code>, <code>AWSManagedRulesSQLiRuleSet</code>). Updated automatically by AWS.</li>
  <li><strong>Custom Rules</strong> — Match on IP sets, geo-match conditions, string match, regex, request size, or JSON body.</li>
  <li><strong>Rate-Based Rules</strong> — Block an IP after exceeding N requests in a 5-minute window. Essential for brute-force and credential stuffing defence.</li>
  <li><strong>Rule Groups</strong> — Reusable collections of rules you can share across multiple Web ACLs.</li>
</ul>

<p>Each rule has an action: <strong>Allow</strong>, <strong>Block</strong>, or <strong>Count</strong> (useful for testing before enforcing). Rules are evaluated in priority order; the first match wins.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">json</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "Name": "RateLimitLoginEndpoint",
  "Priority": 1,
  "Action": { "Block": {} },
  "Statement": {
    "RateBasedStatement": {
      "Limit": 100,
      "AggregateKeyType": "IP",
      "ScopeDownStatement": {
        "ByteMatchStatement": {
          "SearchString": "/api/login",
          "FieldToMatch": { "UriPath": {} },
          "TextTransformations": [{ "Priority": 0, "Type": "NONE" }],
          "PositionalConstraint": "STARTS_WITH"
        }
      }
    }
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "RateLimitLogin"
  }
}
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">WAF Pricing Model</div>
  <p>WAF charges per Web ACL ($5/month), per rule ($1/month), and per million requests ($0.60). Managed rule groups add $1–$20/month per group. Always start rules in Count mode to baseline false positives before switching to Block.</p>
</div>

<h2>AWS Shield — DDoS Protection</h2>
<p>Shield protects against volumetric and protocol-level DDoS attacks.</p>
<ul>
  <li><strong>Shield Standard</strong> — Free, always-on. Protects against common layer 3/4 attacks (SYN floods, UDP reflection). Automatically applied to all AWS resources.</li>
  <li><strong>Shield Advanced</strong> — $3,000/month per organisation. Adds layer 7 DDoS protection, access to the AWS DDoS Response Team (DRT), cost protection (billing credits for scaling caused by an attack), and near real-time attack visibility in CloudWatch.</li>
</ul>

<p>Shield Advanced is worth the cost only if your application generates significant revenue and requires SLA guarantees during attacks. For most production PHP applications, Shield Standard + WAF rate-based rules is sufficient.</p>

<h2>Amazon GuardDuty — Intelligent Threat Detection</h2>
<p>GuardDuty is a regional, ML-powered threat detection service. It analyses <strong>VPC Flow Logs</strong>, <strong>DNS logs</strong>, <strong>CloudTrail events</strong>, and (optionally) S3 data events and EKS audit logs without requiring you to enable those logs explicitly.</p>

<p><strong>Finding categories:</strong></p>
<ul>
  <li><code>Backdoor:EC2/C&amp;CActivity</code> — instance communicating with known command-and-control infrastructure</li>
  <li><code>CryptoCurrency:EC2/BitcoinTool</code> — crypto mining behaviour</li>
  <li><code>UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B</code> — successful console login from unusual geography</li>
  <li><code>Recon:EC2/PortProbeUnprotectedPort</code> — external port scanning</li>
  <li><code>Trojan:EC2/DNSDataExfiltration</code> — data exfiltration via DNS</li>
</ul>

<p>Findings are severity-rated (Low/Medium/High) and delivered to EventBridge, enabling automated response: quarantine an EC2 instance, revoke IAM credentials, or page on-call via SNS.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml"># EventBridge rule to auto-isolate on HIGH GuardDuty finding
Resources:
  GuardDutyHighFindingRule:
    Type: AWS::Events::Rule
    Properties:
      EventPattern:
        source: [aws.guardduty]
        detail-type: [GuardDuty Finding]
        detail:
          severity: [{ numeric: [">=", 7] }]
      Targets:
        - Arn: !GetAtt RemediationLambda.Arn
          Id: IsolateInstance

  RemediationLambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref RemediationLambda
      Action: lambda:InvokeFunction
      Principal: events.amazonaws.com
      SourceArn: !GetAtt GuardDutyHighFindingRule.Arn
</code></pre>
</div>

<h2>AWS Security Hub</h2>
<p>Security Hub aggregates findings from GuardDuty, Inspector, Macie, Firewall Manager, and third-party tools into a single dashboard. It scores your account against security standards: <strong>AWS Foundational Security Best Practices</strong>, <strong>CIS AWS Foundations Benchmark</strong>, and <strong>PCI DSS</strong>.</p>

<p>Each control check produces a pass/fail result. Failed controls are prioritised by severity. Security Hub uses ASFF (Amazon Security Finding Format) so all findings share a consistent schema. Cross-account aggregation via a delegated administrator account gives you org-wide visibility in one place.</p>

<div class="callout callout-info">
  <div class="callout-title">Enable Security Hub First</div>
  <p>Security Hub must be enabled per region. Enable it in every region where you have workloads, then configure a central aggregation region. Without this, you will miss findings from resources in non-primary regions.</p>
</div>

<h2>IAM Best Practices</h2>
<p>IAM mistakes are the most common cause of AWS breaches. Senior engineers must enforce the following systematically:</p>
<ul>
  <li><strong>No root account usage</strong> — Lock the root account with MFA. Use it only to create the first admin user and for billing tasks. Attach a CloudWatch alarm to root login CloudTrail events.</li>
  <li><strong>Least privilege</strong> — Grant only the actions and resources actually needed. Use <code>aws iam simulate-principal-policy</code> to verify effective permissions.</li>
  <li><strong>Permission boundaries</strong> — Prevent privilege escalation in multi-team environments by capping maximum permissions regardless of what policies are attached.</li>
  <li><strong>Service Control Policies (SCPs)</strong> — At the AWS Organizations level, SCPs act as guardrails that cannot be overridden by any account-level policy.</li>
  <li><strong>No long-lived access keys</strong> — Use IAM roles for EC2, Lambda, and ECS tasks. For human access, use AWS SSO / IAM Identity Center with temporary credentials.</li>
  <li><strong>MFA on all human IAM users</strong> — Enforce with a policy Condition requiring <code>aws:MultiFactorAuthPresent: true</code> for sensitive actions.</li>
</ul>

<div class="code-block">
<div class="code-header"><span class="code-lang">json</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyWithoutMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "sts:GetSessionToken"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
</code></pre>
</div>

<h2>Secrets Manager vs SSM Parameter Store</h2>
<p>Both services store sensitive configuration, but they serve different use cases:</p>

<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
  <thead>
    <tr style="background:var(--surface-2,#f4f4f4)">
      <th style="padding:8px;text-align:left;border:1px solid var(--border,#ddd)">Feature</th>
      <th style="padding:8px;text-align:left;border:1px solid var(--border,#ddd)">Secrets Manager</th>
      <th style="padding:8px;text-align:left;border:1px solid var(--border,#ddd)">SSM Parameter Store</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Automatic rotation</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Yes (built-in for RDS, Redshift, DocumentDB)</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">No (manual or custom Lambda)</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Cost</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">$0.40/secret/month + $0.05/10k API calls</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Free (Standard), $0.05/advanced param/month</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Encryption</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Always KMS-encrypted</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">SecureString uses KMS; String/StringList are plaintext</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Cross-account sharing</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Yes, via resource-based policy</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">No</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Best for</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Database passwords, API keys needing rotation</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">App config, feature flags, non-secret env vars</td>
    </tr>
  </tbody>
</table>

<p>In a PHP application, retrieve secrets at runtime (not build time) and cache them for the lifetime of the process to minimise API calls. Use the AWS SDK's built-in caching for Secrets Manager.</p>

<h2>VPC Security: Security Groups, NACLs, and Flow Logs</h2>
<p><strong>Security Groups (SGs)</strong> are stateful instance-level firewalls. If you allow inbound traffic, the return traffic is automatically allowed. Rules are allow-only; there are no explicit deny rules. Reference other SGs by ID rather than CIDR ranges to build dynamic trust relationships (e.g., allow traffic from the ALB SG only).</p>

<p><strong>Network ACLs (NACLs)</strong> are stateless subnet-level firewalls. You must define both inbound and outbound rules. They are evaluated in rule-number order, first match wins. NACLs are the right tool for blocking specific IP ranges at the subnet level — for example, blocking a known attacker's IP across all resources in the subnet without modifying every SG.</p>

<p><strong>VPC Flow Logs</strong> capture metadata (not payload) about IP traffic: source/dest IP, ports, protocol, bytes, action (ACCEPT/REJECT), and start/end time. They publish to CloudWatch Logs or S3. Use them for:</p>
<ul>
  <li>Post-incident forensics — reconstruct which IPs connected to a compromised instance</li>
  <li>Verifying SG rules are working as expected (REJECT records)</li>
  <li>Detecting unexpected outbound connections (potential exfiltration)</li>
</ul>

<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Enable VPC Flow Logs to S3 via AWS CLI
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-0abc1234def567890 \
  --traffic-type ALL \
  --log-destination-type s3 \
  --log-destination arn:aws:s3:::my-vpc-flow-logs-bucket/flow-logs/ \
  --log-format '\${version} \${account-id} \${interface_id} \${srcaddr} \${dstaddr} \${srcport} \${dstport} \${protocol} \${packets} \${bytes} \${start} \${end} \${action} \${log-status}'

# Query Flow Logs with Athena (after creating table)
# Find all REJECT traffic to port 22
SELECT srcaddr, dstaddr, srcport, action, COUNT(*) as attempts
FROM vpc_flow_logs
WHERE dstport = 22 AND action = 'REJECT'
  AND date_partition = '2025/01/15'
GROUP BY srcaddr, dstaddr, srcport, action
ORDER BY attempts DESC
LIMIT 20;
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the difference between a Security Group and a NACL, and when would you use each?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Security Groups are <strong>stateful</strong> and operate at the instance/ENI level — they track connection state so return traffic is automatically allowed. NACLs are <strong>stateless</strong> and operate at the subnet level — every packet is evaluated independently, so you need explicit inbound and outbound rules. Use Security Groups as your primary control (they are more granular and easier to manage). Use NACLs for subnet-wide emergency blocks, such as dropping traffic from a known malicious IP range across all resources in the subnet without touching individual SGs.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: When should you use Secrets Manager over SSM Parameter Store?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Use <strong>Secrets Manager</strong> when you need automatic rotation (especially for RDS credentials), cross-account secret sharing, or fine-grained audit logging of secret access — and when cost is acceptable. Use <strong>SSM Parameter Store</strong> for application configuration values, non-sensitive environment variables, or high-volume lookups where cost matters (Standard tier is free). For database passwords in production, Secrets Manager's built-in rotation dramatically reduces breach risk.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: GuardDuty is enabled in your account. You receive a CryptoCurrency:EC2/BitcoinTool finding. What are your next steps?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>1. <strong>Isolate immediately</strong> — modify the instance's security group to block all inbound/outbound except to your forensics bastion. Do not terminate yet — preserve evidence. 2. <strong>Snapshot the EBS volumes</strong> for forensic analysis. 3. <strong>Check CloudTrail</strong> — how did the attacker get in? Look for unusual API calls, credential usage, or newly created IAM users. 4. <strong>Rotate any credentials</strong> the instance had access to (instance profile roles' access keys if long-lived, Secrets Manager secrets). 5. <strong>Terminate and replace</strong> the instance from a clean AMI. 6. <strong>Post-mortem</strong> — was the AMI compromised? Was a dependency vulnerable? Close the attack vector before redeploying.</p>
  </div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>WAF rules are evaluated in priority order; always test new rules in Count mode before switching to Block.</li>
    <li>Shield Standard is free and always-on; Shield Advanced ($3k/month) is only justified for high-revenue, DDoS-targeted applications.</li>
    <li>GuardDuty analyses VPC Flow Logs, DNS, and CloudTrail without you needing to configure those sources manually — it just needs to be enabled.</li>
    <li>Security Hub centralises findings from GuardDuty, Inspector, Macie, and third parties; use it to track compliance against CIS and AWS FSBP benchmarks.</li>
    <li>Never use the root account for day-to-day operations; lock it with MFA and alarm on any usage via CloudTrail.</li>
    <li>Secrets Manager provides automatic rotation (critical for database credentials); SSM Parameter Store is cheaper for non-rotating config values.</li>
    <li>Security Groups are stateful (instance-level); NACLs are stateless (subnet-level). Use SGs for primary control, NACLs for emergency subnet-wide blocks.</li>
    <li>VPC Flow Logs capture packet metadata (not payload) and are essential for post-incident forensics and verifying firewall rules work as intended.</li>
  </ul>
</div>
`,
};

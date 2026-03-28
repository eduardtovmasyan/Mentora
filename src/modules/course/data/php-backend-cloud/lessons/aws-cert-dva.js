export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS DVA-C02 Exam Prep',
  intro: 'The AWS Developer Associate (DVA-C02) exam tests developer knowledge: CI/CD with CodePipeline, Lambda and API Gateway, DynamoDB, SQS/SNS, IAM for developers, X-Ray tracing, and the AWS SDK. This lesson covers the highest-weight domains and exam-specific gotchas.',
  tags: ['CodePipeline', 'Lambda', 'DynamoDB', 'API Gateway', 'X-Ray', 'CloudFormation', 'SAM'],
  seniorExpectations: [
    'Design and configure a CodePipeline (Source → Build → Test → Deploy)',
    'Choose DynamoDB partition key to distribute load evenly',
    'Configure API Gateway with Lambda proxy integration and authorization',
    'Instrument applications with AWS X-Ray for distributed tracing',
    'Write SAM (Serverless Application Model) templates',
  ],
  body: `
<h2>Domain Weights (DVA-C02)</h2>
<table class="ctable">
  <thead><tr><th>Domain</th><th>Weight</th></tr></thead>
  <tbody>
    <tr><td>Development with AWS Services</td><td>32%</td></tr>
    <tr><td>Security</td><td>26%</td></tr>
    <tr><td>Deployment</td><td>24%</td></tr>
    <tr><td>Troubleshooting & Optimization</td><td>18%</td></tr>
  </tbody>
</table>

<h2>DynamoDB Key Design</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">DynamoDB best practices</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Partition key: choose for uniform distribution
# BAD: using status (Active/Inactive) → hot partition
# BAD: using date → all writes go to today's partition
# GOOD: user_id, order_id (high cardinality, random distribution)

# Composite key: PK + SK for hierarchical data (single-table design)
# PK: USER#123        SK: PROFILE      → user profile
# PK: USER#123        SK: ORDER#456    → user's order
# PK: USER#123        SK: ORDER#789    → user's other order

# Query: get all items for USER#123 → SK begins_with('ORDER')

# Global Secondary Index (GSI): alternate access pattern
# GSI PK: email → query by email (not primary key)
# Max 20 GSIs per table

# Capacity modes:
# On-demand: pay per request, auto-scales, use for unpredictable traffic
# Provisioned: set RCU/WCU, cheaper for predictable high traffic
</code></pre>
</div>

<h2>API Gateway + Lambda Integration</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — SAM template</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 512
    Runtime: provided.al2
    Layers:
      - !Sub arn:aws:lambda:eu-west-1:534081306603:layer:php-82-fpm:63

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: public/index.php
      Events:
        ApiEvent:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY
            Auth:
              Authorizer: CognitoAuth

  CognitoAuth:
    Type: AWS::Serverless::HttpApi
    Properties:
      Auth:
        DefaultAuthorizer: CognitoAuthorizer
        Authorizers:
          CognitoAuthorizer:
            JwtConfiguration:
              issuer: !Sub https://cognito-idp.eu-west-1.amazonaws.com/\${UserPool}
              audience:
                - !Ref UserPoolClient
</code></pre>
</div>

<h2>AWS X-Ray (Distributed Tracing)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — X-Ray instrumentation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Aws\XRay\XRay;

// Instrument an HTTP call
$tracer = XRay::getTracer();
$segment = $tracer->beginSegment('my-app');
$subsegment = $tracer->beginSubsegment('payment-service-call');

try {
    $response = Http::post('https://payments.internal/charge', $data);
    $subsegment->putAnnotation('status', $response->status());
} finally {
    $tracer->endSubsegment();
}

// In Lambda: X-Ray enabled automatically — just add annotations
$subsegment->putMetadata('order', ['id' => $orderId, 'amount' => $amount]);
$tracer->endSegment();
</code></pre>
</div>

<h2>CodePipeline CI/CD</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Architecture: CodePipeline stages</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Source Stage:
  - CodeCommit / GitHub / S3 (zip artifact)

Build Stage (CodeBuild):
  - buildspec.yml: install, test, build Docker image
  - Push to ECR
  - Output: imagedefinitions.json

Test Stage (CodeBuild):
  - Run integration tests against staging environment
  - Quality gate: coverage > 80%, 0 critical findings

Deploy Stage (CodeDeploy / ECS):
  - Blue/green deployment to ECS
  - CodeDeploy shifts traffic: 10% → 50% → 100% with health check gates
  - Automatic rollback on CloudWatch alarm
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>DynamoDB: partition key must distribute load — avoid hot partitions (status, date as PK)</li>
    <li>GSI: enables alternate query patterns but costs additional RCU/WCU</li>
    <li>API Gateway: proxy integration passes raw event to Lambda; non-proxy requires mapping templates</li>
    <li>X-Ray: traces requests across Lambda, API Gateway, DynamoDB, SQS — find latency bottlenecks</li>
    <li>SAM: CloudFormation extension for serverless — simpler than raw CFN for Lambda + API Gateway</li>
  </ul>
</div>
`,
};

export default {
  phase: 'Phase 5 · System Design',
  title: 'CAP Theorem',
  intro: 'The CAP Theorem states that a distributed system can guarantee at most two of three properties: Consistency, Availability, and Partition Tolerance. Since network partitions are unavoidable in practice, real systems choose between CP (consistent) or AP (available) behavior when a partition occurs.',
  tags: ['CAP', 'Consistency', 'Availability', 'Partition tolerance', 'BASE', 'PACELC'],
  seniorExpectations: [
    'Explain all three CAP properties with concrete examples',
    'Classify common databases: PostgreSQL (CP), DynamoDB (AP), Cassandra (AP), HBase (CP)',
    'Explain the PACELC extension: latency vs consistency tradeoff even without partitions',
    'Describe BASE (Basically Available, Soft state, Eventually consistent) as the AP alternative to ACID',
    'Design a system knowing when strong vs eventual consistency is acceptable',
  ],
  body: `
<h2>The Three Properties</h2>
<table class="ctable">
  <thead><tr><th>Property</th><th>Meaning</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td>Consistency (C)</td><td>Every read receives the most recent write or an error</td><td>After a write, all nodes return the new value immediately</td></tr>
    <tr><td>Availability (A)</td><td>Every request receives a (non-error) response, even if stale</td><td>System stays up and responds even when some nodes are down</td></tr>
    <tr><td>Partition Tolerance (P)</td><td>System continues despite network partitions</td><td>Nodes can't communicate but system still operates</td></tr>
  </tbody>
</table>

<div class="callout callout-info">
  <div class="callout-title">P is not optional</div>
  <p>Network partitions happen in any distributed system (packet loss, node crashes, network splits). You cannot design them away. Therefore the real choice is: <strong>CP</strong> (sacrifice availability during partition) or <strong>AP</strong> (sacrifice consistency, return possibly stale data).</p>
</div>

<h2>CP vs AP in Practice</h2>
<table class="ctable">
  <thead><tr><th>Database</th><th>Choice</th><th>Behavior during partition</th></tr></thead>
  <tbody>
    <tr><td>PostgreSQL, MySQL</td><td>CP</td><td>Returns error if can't guarantee consistency</td></tr>
    <tr><td>HBase, Zookeeper</td><td>CP</td><td>Refuses writes to minority partition</td></tr>
    <tr><td>Cassandra, DynamoDB</td><td>AP</td><td>Returns possibly stale data; accepts writes</td></tr>
    <tr><td>CouchDB</td><td>AP</td><td>Each partition continues, merges later</td></tr>
    <tr><td>MongoDB</td><td>CP (default) / tunable</td><td>Primary election, replica set; write concern tunable</td></tr>
  </tbody>
</table>

<h2>PACELC Extension</h2>
<p>PACELC extends CAP: even <strong>without</strong> a partition, there is a tradeoff between <strong>Latency</strong> and <strong>Consistency</strong>. Writing to quorum takes longer but guarantees consistency. Writing to a single node is faster but may be stale.</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PACELC decision matrix</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">PACELC: If Partition → (Availability or Consistency), Else → (Latency or Consistency)

DynamoDB: PA/EL — AP + low latency (eventual consistency by default)
Cassandra: PA/EL — AP + tunable (QUORUM for consistency, ONE for latency)
MongoDB:   PC/EC — CP + consistency (write concern: majority)
Spanner:   PC/EC — CP + consistency (uses TrueTime for global linearizability)
</code></pre>
</div>

<h2>BASE vs ACID</h2>
<table class="ctable">
  <thead><tr><th>Property</th><th>ACID (CP systems)</th><th>BASE (AP systems)</th></tr></thead>
  <tbody>
    <tr><td>Model</td><td>Strong consistency</td><td>Eventual consistency</td></tr>
    <tr><td>Availability</td><td>May return error</td><td>Always responds</td></tr>
    <tr><td>State</td><td>Consistent after each tx</td><td>Soft state, converges eventually</td></tr>
    <tr><td>Use case</td><td>Financial, inventory, auth</td><td>Social feeds, shopping carts, DNS</td></tr>
  </tbody>
</table>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: When is eventual consistency acceptable?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Eventual consistency is fine when: (1) stale data doesn't cause business harm (social media likes, view counts), (2) users expect eventual updates (DNS propagation, CDN cache), (3) you need geo-distributed writes (multi-region). It is <strong>not</strong> acceptable for financial transactions, inventory reservation, or authentication tokens.</p>
  </div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>P (partition tolerance) is mandatory — the choice is always CP vs AP</li>
    <li>CP: return error during partition to preserve consistency (PostgreSQL, HBase, Zookeeper)</li>
    <li>AP: return stale data during partition (Cassandra, DynamoDB, CouchDB)</li>
    <li>PACELC adds the latency/consistency tradeoff under normal operations (no partition)</li>
    <li>Choose based on business requirements: money → CP; social feeds → AP is fine</li>
  </ul>
</div>
`,
};

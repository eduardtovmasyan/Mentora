export default {
  phase: 'Phase 5 · System Design',
  title: 'System Design · News Feed',
  intro: 'Designing a scalable news feed (like Twitter/Instagram) requires choosing between fan-out-on-write (pre-compute feeds at post time) and fan-out-on-read (compute at read time), handling celebrities with millions of followers, caching feeds in Redis, and paginating with cursors for performance.',
  tags: ['Fan-out on write', 'Fan-out on read', 'Feed ranking', 'Redis sorted set', 'Pagination', 'Celebrity problem'],
  seniorExpectations: [
    'Compare fan-out-on-write vs fan-out-on-read — tradeoffs for regular vs celebrity users',
    'Design the data model: posts table, followers table, user_feed table',
    'Implement cursor-based pagination for feeds',
    'Use Redis sorted sets to cache hot user feeds',
    'Handle the celebrity problem: hybrid approach for users with many followers',
  ],
  segments: [
    { type: 'h2', text: 'Two Approaches' },
    { type: 'table', headers: ['Approach', 'Write cost', 'Read cost', 'Freshness'], rows: [
      ['Fan-out on write (push)', 'High (N followers)', 'O(1)', 'Immediate for pre-computed feed'],
      ['Fan-out on read (pull)', 'O(1)', 'High (merge N feeds)', 'Always fresh'],
      ['Hybrid', 'Medium', 'Low', 'Near-immediate'],
    ]},

    { type: 'h2', text: 'Data Model' },
    { type: 'code', lang: 'sql', label: 'SQL', code: `CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    follower_count INT DEFAULT 0
);

CREATE TABLE posts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

CREATE TABLE follows (
    follower_id  BIGINT NOT NULL REFERENCES users(id),
    following_id BIGINT NOT NULL REFERENCES users(id),
    PRIMARY KEY (follower_id, following_id)
);

-- Pre-computed feed for fan-out-on-write
CREATE TABLE user_feed (
    user_id    BIGINT NOT NULL REFERENCES users(id),
    post_id    BIGINT NOT NULL REFERENCES posts(id),
    created_at TIMESTAMP NOT NULL, -- copied from post for sorting
    PRIMARY KEY (user_id, post_id)
);
CREATE INDEX idx_user_feed_time ON user_feed(user_id, created_at DESC);` },

    { type: 'h2', text: 'Fan-out on Write (background job)' },
    { type: 'code', lang: 'php', label: 'PHP — Laravel job', code: `class FanOutPostToFollowers implements ShouldQueue {
    public function __construct(private Post $post) {}

    public function handle(): void {
        $post = $this->post;
        $author = $post->user;

        if ($author->follower_count > 10_000) {
            // Celebrity: skip fan-out, use pull model at read time
            return;
        }

        // Batch-insert into user_feed for all followers
        $follows = Follow::where('following_id', $author->id)
            ->select('follower_id')
            ->cursor(); // memory-efficient

        $batch = [];
        foreach ($follows as $follow) {
            $batch[] = [
                'user_id'    => $follow->follower_id,
                'post_id'    => $post->id,
                'created_at' => $post->created_at,
            ];
            if (count($batch) >= 1000) {
                DB::table('user_feed')->insert($batch);
                $batch = [];
            }
        }
        if ($batch) DB::table('user_feed')->insert($batch);

        // Also cache in Redis sorted set (score = timestamp)
        $this->cacheInRedis($post);
    }
}` },

    { type: 'h2', text: 'Reading Feed with Cursor Pagination' },
    { type: 'code', lang: 'php', label: 'PHP', code: `function getFeed(int $userId, ?string $cursor = null, int $limit = 20): array {
    // Check Redis cache first
    $cacheKey = "feed:{$userId}";
    if (!$cursor && Cache::has($cacheKey)) {
        return Cache::get($cacheKey);
    }

    $query = DB::table('user_feed as uf')
        ->join('posts as p', 'p.id', '=', 'uf.post_id')
        ->join('users as u', 'u.id', '=', 'p.user_id')
        ->where('uf.user_id', $userId)
        ->select('p.id', 'p.content', 'p.created_at', 'u.username')
        ->orderBy('uf.created_at', 'desc')
        ->limit($limit + 1);

    if ($cursor) {
        $query->where('uf.created_at', '<', base64_decode($cursor));
    }

    $posts = $query->get();
    $hasMore = $posts->count() > $limit;
    $posts = $posts->take($limit);

    $nextCursor = $hasMore
        ? base64_encode($posts->last()->created_at)
        : null;

    $result = ['posts' => $posts, 'next_cursor' => $nextCursor];

    if (!$cursor) Cache::put($cacheKey, $result, 60);
    return $result;
}` },

    { type: 'callout', style: 'tip', title: 'Hybrid Approach for Celebrities', html: 'Twitter/Instagram use a hybrid: normal users get fan-out-on-write (feed pre-computed, fast reads). Celebrities (>10k followers) skip fan-out — their posts are fetched at read time and merged into the pre-computed feed. This caps the write amplification while keeping reads fast.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Fan-out-on-write: push posts to followers\' feeds — fast reads, expensive writes for popular users',
      'Fan-out-on-read: compute feed at read time — simple writes, slow reads with many followees',
      'Hybrid: fan-out regular users, pull celebrity posts at read time — cap write amplification',
      'Redis sorted set (ZSET): score = timestamp, member = post_id — O(log n) add, O(log n + k) range query',
      'Cursor pagination over offset: no page drift when new posts are added, consistent performance',
    ]},
  ],
};

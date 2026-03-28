export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'PHP Testing (PHPUnit & Pest)',
  intro: 'Test-driven PHP engineering means unit tests with PHPUnit or Pest, feature tests with database transactions, and mocking dependencies with Mockery or PHPUnit mocks. Senior engineers design for testability: dependency injection, interfaces, no static calls, no global state.',
  tags: ['PHPUnit', 'Pest', 'Mockery', 'TDD', 'Test doubles', 'Coverage', 'Feature tests'],
  seniorExpectations: [
    'Write unit tests for a class in isolation using constructor injection and mocks',
    'Use data providers for parameterized tests',
    'Mock dependencies with PHPUnit mocks and verify method calls',
    'Write Laravel feature tests with database transactions and HTTP assertions',
    'Configure code coverage and set a minimum coverage threshold in CI',
  ],
  body: `
<h2>PHPUnit Unit Test</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — PHPUnit</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use PHPUnit\Framework\TestCase;

class DiscountCalculatorTest extends TestCase {
    private DiscountCalculator $calculator;

    protected function setUp(): void {
        parent::setUp();
        $this->calculator = new DiscountCalculator();
    }

    public function test_percentage_discount(): void {
        $result = $this->calculator->apply(100.0, new PercentageDiscount(0.1));
        $this->assertSame(90.0, $result);
    }

    /** @dataProvider discountProvider */
    public function test_various_discounts(float $price, float $expected, DiscountStrategy $strategy): void {
        $this->assertSame($expected, $this->calculator->apply($price, $strategy));
    }

    public static function discountProvider(): array {
        return [
            'ten percent'   => [100.0, 90.0,  new PercentageDiscount(0.1)],
            'five fixed'    => [100.0, 95.0,  new FixedDiscount(5.0)],
            'free shipping' => [100.0, 100.0, new FreeDiscount()],
        ];
    }
}
</code></pre>
</div>

<h2>Mocking Dependencies</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — PHPUnit mock</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class UserServiceTest extends TestCase {
    public function test_create_user_sends_email(): void {
        // Arrange
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->expects($this->once())
               ->method('send')
               ->with($this->callback(fn($mail) => $mail->to === 'alice@test.com'));

        $repo = $this->createMock(UserRepository::class);
        $repo->method('save')->willReturn(new User(1, 'Alice', 'alice@test.com'));

        $service = new UserService($repo, $mailer);

        // Act
        $user = $service->create(['name' => 'Alice', 'email' => 'alice@test.com']);

        // Assert
        $this->assertSame('Alice', $user->name);
        // PHPUnit verifies the mock expectation (mailer->send called once)
    }
}
</code></pre>
</div>

<h2>Pest (Modern PHP Testing)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Pest</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use function Pest\Laravel\{get, post, actingAs};

it('creates a user', function () {
    $response = post('/api/users', [
        'name'  => 'Alice',
        'email' => 'alice@test.com',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('data.name', 'Alice');

    expect(User::where('email', 'alice@test.com')->exists())->toBeTrue();
});

it('requires authentication for admin routes', function () {
    get('/admin/users')->assertRedirect('/login');
    actingAs(User::factory()->admin()->create())
        ->get('/admin/users')
        ->assertOk();
});

// Datasets (Pest's data providers)
it('calculates discount', function (float $price, float $expected) {
    expect((new DiscountCalculator())->apply($price, new PercentageDiscount(0.1)))
        ->toBe($expected);
})->with([
    [100.0, 90.0],
    [50.0,  45.0],
]);
</code></pre>
</div>

<h2>Laravel Feature Test with DB</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Illuminate\Foundation\Testing\RefreshDatabase;

class CreateOrderTest extends TestCase {
    use RefreshDatabase; // wraps each test in a transaction + rolls back

    public function test_creates_order_and_charges_stripe(): void {
        Http::fake(['stripe.com/*' => Http::response(['id' => 'ch_123'])]);

        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->postJson('/api/orders', [
            'items'  => [['product_id' => 1, 'qty' => 2]],
            'token'  => 'tok_visa',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
        Http::assertSent(fn($req) => str_contains($req->url(), 'stripe.com'));
    }
}
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Design for testability: use DI, interfaces, no static global calls — makes mocking trivial</li>
    <li>PHPUnit: extend TestCase, use setUp/tearDown, data providers for parameterized tests</li>
    <li>Mocks verify interactions; stubs return canned values — use mocks sparingly, prefer stubs</li>
    <li>Pest: modern fluent API on top of PHPUnit — datasets, higher-order tests, cleaner syntax</li>
    <li>Laravel: RefreshDatabase for clean DB per test, Http::fake() for mocking external HTTP calls</li>
  </ul>
</div>
`,
};

export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'Pattern: Adapter',
  intro: 'The Adapter pattern lets you plug an incompatible interface into code that expects a different one — without touching either side. Think of it as a travel power adapter: your laptop has not changed, the wall socket has not changed, but the adapter in between makes them work together. In PHP back-end development, Adapters are most valuable when integrating third-party SDKs (Stripe, Mailgun, AWS) into your own application so that swapping vendors never requires touching business logic.',
  tags: ['adapter', 'structural', 'design-patterns', 'php', 'integration', 'third-party-sdk'],
  seniorExpectations: [
    'Distinguish class adapter (inheritance) from object adapter (composition) and explain why composition is preferred',
    'Identify when an Adapter is the right choice versus a Facade or a Decorator',
    'Design a PaymentGateway interface and write adapters for Stripe, PayPal, and a legacy in-house processor',
    'Explain how to test code that uses an Adapter without hitting the real third-party API',
    'Recognise the Adapter pattern inside Laravel (filesystem drivers, cache drivers, mail transports)',
  ],
  segments: [
    { type: 'h2', text: 'The Problem: Incompatible Interfaces' },
    { type: 'p', html: 'Imagine your e-commerce platform was built years ago with a home-grown payment processor. Your business logic calls <code>$processor->charge($amount, $cardToken)</code>. Now you want to switch to Stripe, whose SDK uses <code>PaymentIntent::create([...])</code>. You have two choices: rewrite every call site throughout your codebase, or write a thin adapter that makes Stripe look like your old processor. The second option is safer, faster, and keeps your domain code clean. The Adapter pattern is the formal name for that second choice.' },

    { type: 'callout', style: 'tip', title: 'When to Reach for an Adapter', html: 'Use the Adapter pattern when you need to use an existing class but its interface does not match what the rest of your code expects — especially for third-party libraries you cannot (or should not) modify.' },

    { type: 'h2', text: 'Defining the Target Interface' },
    { type: 'p', html: 'Start by defining the interface your application code already knows about (or should know about). This becomes the stable contract everything inside your system depends on. All third-party details stay on the other side of this boundary.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php

namespace App\Payment;

interface PaymentGatewayInterface
{
    /**
     * Charge the customer and return a transaction ID.
     *
     * @param  int    $amountInCents  Always work in smallest currency unit
     * @param  string $cardToken      Tokenised card reference from the frontend
     * @return string                 Transaction ID for future reference/refunds
     */
    public function charge(int $amountInCents, string $cardToken): string;

    public function refund(string $transactionId, int $amountInCents): bool;
}` },

    { type: 'p', html: 'All application code — controllers, order services, invoice generators — depends only on <code>PaymentGatewayInterface</code>. No concrete vendor class ever leaks into business logic.' },

    { type: 'h2', text: 'Object Adapter: Wrapping Stripe' },
    { type: 'p', html: 'An <strong>object adapter</strong> holds a reference to the adaptee (the third-party class) and delegates calls to it. This is the preferred approach because it relies on composition, not inheritance, making it easy to swap adaptees or stack decorators later.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php

namespace App\Payment\Adapters;

use App\Payment\PaymentGatewayInterface;
use Stripe\StripeClient;
use RuntimeException;

class StripeAdapter implements PaymentGatewayInterface
{
    public function __construct(private readonly StripeClient $stripe) {}

    public function charge(int $amountInCents, string $cardToken): string
    {
        // Stripe's API signature is completely different from our interface —
        // the adapter handles all the translation here.
        $intent = $this->stripe->paymentIntents->create([
            'amount'   => $amountInCents,   // Stripe already uses cents
            'currency' => 'usd',
            'payment_method' => $cardToken,
            'confirm'  => true,
            'automatic_payment_methods' => [
                'enabled'         => true,
                'allow_redirects' => 'never',
            ],
        ]);

        if ($intent->status !== 'succeeded') {
            throw new RuntimeException("Stripe charge failed with status: {$intent->status}");
        }

        return $intent->id; // map Stripe's id to our concept of "transaction ID"
    }

    public function refund(string $transactionId, int $amountInCents): bool
    {
        $refund = $this->stripe->refunds->create([
            'payment_intent' => $transactionId,
            'amount'         => $amountInCents,
        ]);

        return $refund->status === 'succeeded';
    }
}` },

    { type: 'h2', text: 'Object Adapter: Wrapping a Legacy Processor' },
    { type: 'p', html: 'The same pattern adapts an old in-house class whose interface cannot be changed — perhaps it lives in a shared library maintained by another team or is a vendored Composer package.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php

namespace App\Payment\Adapters;

use App\Payment\PaymentGatewayInterface;
use LegacyPayments\OldProcessorClient; // cannot edit this class
use RuntimeException;

class LegacyProcessorAdapter implements PaymentGatewayInterface
{
    public function __construct(private readonly OldProcessorClient $client) {}

    public function charge(int $amountInCents, string $cardToken): string
    {
        // Legacy API uses dollars (not cents) and calls the param "token"
        $dollars = $amountInCents / 100;

        $response = $this->client->makePayment($dollars, ['token' => $cardToken]);

        if (! $response->success) {
            throw new RuntimeException(
                'Legacy processor charge failed: ' . $response->errorMessage
            );
        }

        // Map legacy's integer referenceNumber to our string transaction ID
        return (string) $response->referenceNumber;
    }

    public function refund(string $transactionId, int $amountInCents): bool
    {
        return $this->client->voidTransaction(
            (int) $transactionId,
            $amountInCents / 100
        );
    }
}` },

    { type: 'h2', text: 'Class Adapter: Using Inheritance (and Why to Avoid It)' },
    { type: 'p', html: 'A <strong>class adapter</strong> extends the adaptee directly and also implements the target interface. In PHP this works but is considered inferior because single-inheritance locks you into the adaptee\'s hierarchy and makes the class harder to decorate or mock.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php

// Class adapter — shown for comparison; prefer the object adapter above
namespace App\Payment\Adapters;

use App\Payment\PaymentGatewayInterface;
use LegacyPayments\OldProcessorClient;

class LegacyClassAdapter extends OldProcessorClient implements PaymentGatewayInterface
{
    public function charge(int $amountInCents, string $cardToken): string
    {
        $response = $this->makePayment(
            $amountInCents / 100,
            ['token' => $cardToken]
        );
        return (string) $response->referenceNumber;
    }

    public function refund(string $transactionId, int $amountInCents): bool
    {
        return $this->voidTransaction((int) $transactionId, $amountInCents / 100);
    }
}

// Problem: you are now locked into OldProcessorClient's entire inheritance
// hierarchy. Adding a Decorator later becomes very painful.
// You also expose all of OldProcessorClient's public methods to callers.` },

    { type: 'h2', text: 'Wiring Adapters with Laravel\'s Service Container' },
    { type: 'p', html: 'Register the adapter in a service provider so the rest of the application never needs to know which gateway is active. Switching vendors becomes a one-line config change.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php

namespace App\Providers;

use App\Payment\PaymentGatewayInterface;
use App\Payment\Adapters\StripeAdapter;
use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentGatewayInterface::class, function () {
            return new StripeAdapter(
                new StripeClient(config('services.stripe.secret'))
            );
        });
    }
}

// -----------------------------------------------------------------------
// In a controller — depends ONLY on the interface, not Stripe:
// -----------------------------------------------------------------------

use App\Payment\PaymentGatewayInterface;

class OrderController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway
    ) {}

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $txId = $this->gateway->charge(
            $request->amountInCents(),
            $request->cardToken()
        );

        Order::create(['transaction_id' => $txId]);

        return response()->json(['status' => 'paid', 'transaction_id' => $txId]);
    }
}` },

    { type: 'h2', text: 'Testing with a Fake Adapter' },
    { type: 'p', html: 'Because all application code depends on the interface, testing is trivial. Swap the real adapter for a lightweight fake — no Stripe sandbox, no network requests, no side effects.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php

namespace Tests\Fakes;

use App\Payment\PaymentGatewayInterface;

class FakePaymentGateway implements PaymentGatewayInterface
{
    private array $charges = [];
    private bool $shouldFail = false;

    public function failNextCharge(): void
    {
        $this->shouldFail = true;
    }

    public function charge(int $amountInCents, string $cardToken): string
    {
        if ($this->shouldFail) {
            throw new \RuntimeException('Simulated payment failure');
        }

        $txId = 'fake_tx_' . uniqid();
        $this->charges[] = compact('amountInCents', 'cardToken', 'txId');
        return $txId;
    }

    public function refund(string $transactionId, int $amountInCents): bool
    {
        return true;
    }

    public function totalCharged(): int
    {
        return array_sum(array_column($this->charges, 'amountInCents'));
    }
}

// In a PHPUnit test:
class CheckoutTest extends TestCase
{
    public function test_order_is_created_after_successful_charge(): void
    {
        $fake = new FakePaymentGateway();
        $this->app->instance(PaymentGatewayInterface::class, $fake);

        $this->postJson('/checkout', ['amount' => 5000, 'token' => 'tok_test'])
             ->assertOk();

        $this->assertEquals(5000, $fake->totalCharged());
        $this->assertDatabaseHas('orders', ['amount' => 5000]);
    }

    public function test_failed_charge_returns_error(): void
    {
        $fake = new FakePaymentGateway();
        $fake->failNextCharge();
        $this->app->instance(PaymentGatewayInterface::class, $fake);

        $this->postJson('/checkout', ['amount' => 5000, 'token' => 'tok_test'])
             ->assertStatus(422);
    }
}` },

    { type: 'h2', text: 'Adapter vs Facade vs Decorator' },
    { type: 'p', html: 'These three structural patterns are easy to confuse. The key distinction lies in <em>intent</em>: Adapter converts an interface, Facade simplifies a subsystem, and Decorator adds behaviour while preserving the same interface.' },
    { type: 'ul', items: [
      '<strong>Adapter</strong> — the adaptee\'s interface is <em>incompatible</em> with what callers expect. The adapter converts one to the other.',
      '<strong>Facade</strong> — the subsystem\'s interface is not necessarily incompatible, just overly complex. A Facade hides complexity behind a simpler API.',
      '<strong>Decorator</strong> — both the wrapper and the wrapped object implement <em>the same interface</em>. Used to add behaviour (logging, caching) transparently.',
    ]},

    { type: 'qa', pairs: [
      {
        q: 'Q: Why prefer object adapter over class adapter in PHP?',
        a: '<p>PHP only supports single inheritance, so extending the adaptee class locks you out of extending anything else and forces you to expose the adaptee\'s entire public API. Object adapter composes the adaptee, leaving you free to extend a base class, add decorators on top, or swap the adaptee entirely at runtime. It also makes unit testing easier because you can inject a mock adaptee through the constructor.</p>',
      },
      {
        q: 'Q: How does Laravel use the Adapter pattern internally?',
        a: '<p>Laravel\'s filesystem, cache, mail, and queue systems all rely on adapters behind driver-based managers. For example, <code>Illuminate\\Mail\\Transport\\MailgunTransport</code> adapts the Mailgun HTTP API to Symfony Mailer\'s <code>TransportInterface</code>. Switching from Mailgun to SES in <code>config/mail.php</code> simply swaps which adapter the container resolves — application code that calls <code>Mail::send()</code> never changes.</p>',
      },
      {
        q: 'Q: A colleague argues "just call the Stripe SDK directly in the controller — it\'s faster to build." How do you respond?',
        a: '<p>Direct SDK coupling creates three real problems: (1) every call site must be updated if Stripe changes its API or you switch vendors; (2) you cannot test the controller without a live Stripe connection or fragile static mock setup; (3) there is no single place to add cross-cutting concerns (logging, retry logic, currency conversion). An adapter costs ~30 lines written once and saves hours of refactoring later. The "faster" argument only holds for throwaway prototypes, not production systems.</p>',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'The Adapter pattern converts an incompatible interface into one your code expects — without modifying either side.',
      'Always define a <strong>target interface</strong> first; the adapter implements that interface and wraps the adaptee.',
      'Prefer <strong>object adapter</strong> (composition) over class adapter (inheritance) — more flexible, more testable, avoids single-inheritance lock-in.',
      'Wrap all third-party SDKs (Stripe, Mailgun, AWS) behind your own interface so that vendor swaps are a single container binding change.',
      'Adapters make unit testing trivial: swap the real adapter for a <strong>fake implementation</strong> in the service container.',
      'Distinguish Adapter (interface conversion) from Facade (complexity hiding) and Decorator (behaviour addition at the same interface).',
      'Laravel\'s mail, cache, filesystem, and queue drivers are real-world examples of the Adapter pattern shipped with the framework.',
    ]},
  ],
};

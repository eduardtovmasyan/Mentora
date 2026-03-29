export default {
  phase: 'Phase 5 · System Design',
  title: 'System Design · Payment Service',
  intro: 'Payment systems require the highest correctness guarantees: idempotency (no double charges), distributed transactions (order + payment atomicity), reconciliation, and fraud detection. Senior engineers design around retry safety, webhook handling, and the Stripe-style charge-then-fulfill pattern.',
  tags: ['Idempotency', 'Webhooks', 'Stripe', 'Double-entry', 'Reconciliation', 'Saga pattern'],
  seniorExpectations: [
    'Implement idempotency keys to prevent double charges on retries',
    'Design the Saga pattern for distributed transactions across order and payment services',
    'Handle Stripe webhooks safely: idempotency, ordering, retry',
    'Implement double-entry bookkeeping for financial accuracy',
    'Design reconciliation jobs to detect and fix discrepancies',
  ],
  segments: [
    { type: 'h2', text: 'Idempotency Keys' },
    { type: 'code', lang: 'php', label: 'PHP — Idempotent payment endpoint', code: `class PaymentController extends Controller {
    public function charge(Request $request): JsonResponse {
        $idempotencyKey = $request->header('Idempotency-Key')
            ?? throw new BadRequestException('Idempotency-Key header required');

        // Check if we already processed this exact request
        $existing = Payment::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return response()->json($existing->toPaymentResponse(), 200);
        }

        DB::transaction(function() use ($request, $idempotencyKey) {
            // Lock to prevent concurrent requests with same key
            $lock = Cache::lock("payment:lock:{$idempotencyKey}", 30);

            if (!$lock->get()) {
                throw new ConflictException('Payment with this idempotency key is being processed');
            }

            try {
                $charge = $this->stripe->charges->create([
                    'amount'   => $request->amount,
                    'currency' => $request->currency,
                    'source'   => $request->token,
                ]);

                Payment::create([
                    'idempotency_key'  => $idempotencyKey,
                    'stripe_charge_id' => $charge->id,
                    'amount'           => $request->amount,
                    'status'           => 'succeeded',
                ]);
            } finally {
                $lock->release();
            }
        });
    }
}` },

    { type: 'h2', text: 'Saga Pattern (Distributed Transaction)' },
    { type: 'code', lang: 'php', label: 'PHP — Choreography-based Saga', code: `// Step 1: Reserve inventory (emits InventoryReservedEvent)
class ReserveInventoryCommand implements ShouldQueue {
    public function handle(): void {
        $reserved = Inventory::reserve($this->orderId, $this->items);
        if ($reserved) {
            InventoryReservedEvent::dispatch($this->orderId);
        } else {
            OrderFailedEvent::dispatch($this->orderId, 'Out of stock');
        }
    }
}

// Step 2: Process payment (listens to InventoryReservedEvent)
class ProcessPaymentListener implements ShouldQueue {
    public function handle(InventoryReservedEvent $event): void {
        try {
            $charge = Stripe::charge($event->orderId);
            PaymentSucceededEvent::dispatch($event->orderId, $charge->id);
        } catch (StripeException $e) {
            PaymentFailedEvent::dispatch($event->orderId);
            // Compensating transaction: release the reserved inventory
            ReleaseInventoryCommand::dispatch($event->orderId);
        }
    }
}` },

    { type: 'h2', text: 'Webhook Handling' },
    { type: 'code', lang: 'php', label: 'PHP — Safe webhook processing', code: `class StripeWebhookController extends Controller {
    public function handle(Request $request): Response {
        // 1. Verify signature (prevent spoofed webhooks)
        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                config('services.stripe.webhook_secret')
            );
        } catch (SignatureVerificationException $e) {
            return response('Invalid signature', 400);
        }

        // 2. Idempotency: store event ID, skip if already processed
        if (WebhookEvent::where('stripe_id', $event->id)->exists()) {
            return response('Already processed', 200);
        }

        // 3. Process asynchronously — return 200 immediately
        ProcessStripeWebhook::dispatch($event);
        WebhookEvent::create(['stripe_id' => $event->id]);

        return response('OK', 200);
    }
}` },

    { type: 'h2', text: 'Double-Entry Bookkeeping' },
    { type: 'code', lang: 'sql', label: 'SQL — Ledger table', code: `CREATE TABLE ledger (
    id          BIGSERIAL PRIMARY KEY,
    account_id  BIGINT NOT NULL,
    amount      NUMERIC(19,4) NOT NULL, -- positive=credit, negative=debit
    description TEXT NOT NULL,
    reference   VARCHAR(255) NOT NULL,  -- order_id, payment_id, etc.
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Every transaction has two entries that sum to zero
INSERT INTO ledger (account_id, amount, description, reference) VALUES
    (user_account,     -50.00, 'Order payment', 'order_123'),
    (revenue_account,  +50.00, 'Order payment', 'order_123');

-- Balance is always derivable (never stored, always calculated)
SELECT SUM(amount) FROM ledger WHERE account_id = ?;` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Idempotency keys: client generates UUID, server stores it — duplicate requests return same result',
      'Saga pattern: chain of local transactions with compensating transactions on failure',
      'Webhooks: verify signature, return 200 immediately, process async — Stripe retries on non-2xx',
      'Double-entry: every transaction has two ledger entries summing to zero — balance always derivable',
      'Never store computed balances — derive from ledger to prevent reconciliation errors',
    ]},
  ],
};

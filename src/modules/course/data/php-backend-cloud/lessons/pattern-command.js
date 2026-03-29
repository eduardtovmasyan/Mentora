export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'Command Pattern',
  intro: 'The Command pattern encapsulates a request — an action with all its parameters — as a self-contained object. This decouples the sender from the receiver, enabling you to queue commands, log them, reverse them (undo/redo), and compose them into macros. In PHP ecosystems the pattern appears explicitly in command buses, implicitly in Laravel\'s job system, and architecturally in CQRS. Understanding it at the interface level, not just as "Laravel jobs", is what separates senior engineers from mid-level developers.',
  tags: ['command', 'design-patterns', 'command-bus', 'laravel-jobs', 'undo-redo', 'CQRS'],
  seniorExpectations: [
    'Implement a Command interface with execute() and undo(), and wire it through a command bus',
    'Explain how Laravel jobs embody the Command pattern and what they add on top of it (queuing, retries, serialisation)',
    'Build a command history stack that supports multi-step undo/redo without side effects',
    'Describe macro commands and how they compose atomic commands into a transaction-like sequence',
    'Know when a command bus adds value versus when it is unnecessary indirection',
  ],
  segments: [
    { type: 'h2', key: 'h_core_concept' },
    { type: 'p', key: 'p_core_concept' },
    { type: 'callout', style: 'info', key: 'callout_four_participants' },
    { type: 'h2', key: 'h_interfaces' },
    { type: 'p', key: 'p_interfaces' },
    {
      type: 'code',
      lang: 'php',
      label: 'Command & Handler Interfaces',
      code: `<?php

declare(strict_types=1);

namespace App\\Commands\\Contracts;

interface CommandInterface {}

interface UndoableCommandInterface extends CommandInterface
{
    public function undo(): void;
}

interface CommandHandlerInterface
{
    public function handle(CommandInterface $command): mixed;
}`,
    },
    {
      type: 'code',
      lang: 'php',
      label: 'TransferFundsCommand (data object)',
      code: `<?php

declare(strict_types=1);

namespace App\\Commands;

use App\\Commands\\Contracts\\CommandInterface;

// Command = data only, no logic
final class TransferFundsCommand implements CommandInterface
{
    public function __construct(
        public readonly int    $fromAccountId,
        public readonly int    $toAccountId,
        public readonly float  $amount,
        public readonly string $currency = 'USD',
    ) {}
}`,
    },
    {
      type: 'code',
      lang: 'php',
      label: 'TransferFundsHandler',
      code: `<?php

declare(strict_types=1);

namespace App\\Commands\\Handlers;

use App\\Commands\\TransferFundsCommand;
use App\\Repositories\\Contracts\\AccountRepositoryInterface;
use App\\Services\\AuditService;
use Illuminate\\Support\\Facades\\DB;

final class TransferFundsHandler
{
    public function __construct(
        private readonly AccountRepositoryInterface $accounts,
        private readonly AuditService               $audit,
    ) {}

    public function handle(TransferFundsCommand $command): void
    {
        DB::transaction(function () use ($command): void {
            $from = $this->accounts->findById($command->fromAccountId);
            $to   = $this->accounts->findById($command->toAccountId);

            $from->debit($command->amount);
            $to->credit($command->amount);

            $this->accounts->save($from);
            $this->accounts->save($to);

            $this->audit->record($command);
        });
    }
}`,
    },
    { type: 'h2', key: 'h_command_bus' },
    { type: 'p', key: 'p_command_bus' },
    {
      type: 'code',
      lang: 'php',
      label: 'Simple Command Bus',
      code: `<?php

declare(strict_types=1);

namespace App\\Bus;

use App\\Commands\\Contracts\\CommandInterface;
use Illuminate\\Contracts\\Container\\Container;
use RuntimeException;

final class CommandBus
{
    /** @var array<class-string, class-string> */
    private array $map = [];

    public function __construct(private readonly Container $container) {}

    /** @param class-string $commandClass  @param class-string $handlerClass */
    public function register(string $commandClass, string $handlerClass): void
    {
        $this->map[$commandClass] = $handlerClass;
    }

    public function dispatch(CommandInterface $command): mixed
    {
        $handlerClass = $this->map[$command::class]
            ?? throw new RuntimeException("No handler for " . $command::class);

        $handler = $this->container->make($handlerClass);
        return $handler->handle($command);
    }
}`,
    },
    { type: 'h2', key: 'h_laravel_jobs' },
    { type: 'p', key: 'p_laravel_jobs' },
    {
      type: 'code',
      lang: 'php',
      label: 'Laravel Job as Command',
      code: `<?php

declare(strict_types=1);

namespace App\\Jobs;

use App\\Models\\User;
use App\\Services\\MailService;
use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Queue\\InteractsWithQueue;
use Illuminate\\Queue\\SerializesModels;

final class SendPasswordResetEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 30;

    public function __construct(private readonly User $user) {}

    public function handle(MailService $mail): void
    {
        $token = $this->user->generatePasswordResetToken();
        $mail->sendPasswordReset($this->user->email, $token);
    }
}

// Dispatching — same pattern as any command bus
SendPasswordResetEmail::dispatch($user)->onQueue('notifications');`,
    },
    { type: 'h2', key: 'h_undo_redo' },
    { type: 'p', key: 'p_undo_redo' },
    {
      type: 'code',
      lang: 'php',
      label: 'MoveTextCommand + CommandHistory',
      code: `<?php

declare(strict_types=1);

namespace App\\Commands;

use App\\Commands\\Contracts\\UndoableCommandInterface;

final class MoveTextCommand implements UndoableCommandInterface
{
    private string $previousContent = '';

    public function __construct(
        private readonly Document $document,
        private readonly int $fromLine,
        private readonly int $toLine,
    ) {}

    public function execute(): void
    {
        $this->previousContent = $this->document->getContent();
        $this->document->moveLine($this->fromLine, $this->toLine);
    }

    public function undo(): void
    {
        $this->document->setContent($this->previousContent);
    }
}

final class CommandHistory
{
    /** @var UndoableCommandInterface[] */
    private array $history = [];

    /** @var UndoableCommandInterface[] */
    private array $redoStack = [];

    public function execute(UndoableCommandInterface $command): void
    {
        $command->execute();
        $this->history[]  = $command;
        $this->redoStack  = []; // new action clears redo
    }

    public function undo(): void
    {
        if ($command = array_pop($this->history)) {
            $command->undo();
            $this->redoStack[] = $command;
        }
    }

    public function redo(): void
    {
        if ($command = array_pop($this->redoStack)) {
            $command->execute();
            $this->history[] = $command;
        }
    }
}`,
    },
    { type: 'h2', key: 'h_macro_commands' },
    { type: 'p', key: 'p_macro_commands' },
    {
      type: 'code',
      lang: 'php',
      label: 'MacroCommand (Composite)',
      code: `<?php

declare(strict_types=1);

namespace App\\Commands;

use App\\Commands\\Contracts\\UndoableCommandInterface;

final class MacroCommand implements UndoableCommandInterface
{
    /** @param UndoableCommandInterface[] $commands */
    public function __construct(private readonly array $commands) {}

    public function execute(): void
    {
        foreach ($this->commands as $command) {
            $command->execute();
        }
    }

    public function undo(): void
    {
        // Reverse order to correctly unwind
        foreach (array_reverse($this->commands) as $command) {
            $command->undo();
        }
    }
}

// Usage: create user + send welcome email as atomic macro
$history->execute(new MacroCommand([
    new CreateUserCommand($data),
    new SendWelcomeEmailCommand($data['email']),
]));`,
    },
    { type: 'h2', key: 'h_when_not_to_use' },
    { type: 'p', key: 'p_when_not_to_use' },
    { type: 'callout', style: 'warn', key: 'callout_cqrs_boundary' },
    { type: 'qa', key: 'qa' },
    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_core_concept: 'The Core Concept',
    p_core_concept: 'A command is a plain object that represents an intention — "transfer $200 from account A to B", "publish article 42", "send password-reset email to user 7". It carries everything needed to perform the action: the parameters, references to dependencies (injected via the bus), and optionally the information needed to reverse the action. The <em>invoker</em> (the bus, a controller, a scheduler) does not know what the command does; it only knows how to dispatch it. The <em>receiver</em> (the handler) does not know who triggered it.',
    callout_four_participants: {
      title: 'Four Participants',
      html: '<strong>Command</strong> — the intent object. <strong>Invoker</strong> — triggers execution (bus, scheduler). <strong>Receiver</strong> — the object that actually performs the work (a service, a model). <strong>Client</strong> — creates and configures the command before handing it to the invoker.',
    },
    h_interfaces: 'Command and Handler Interfaces',
    p_interfaces: 'Define the contracts first. A command is a pure data-transfer object; a handler contains the logic. Separating them allows multiple handlers (logging, auditing) to wrap one core handler via middleware without modifying it.',
    h_command_bus: 'A Simple Command Bus',
    p_command_bus: 'The bus is the invoker. It maps command class names to handler class names, resolves handlers from the container, and dispatches the command. Real-world buses (Tactician, Laravel Bus) add middleware pipelines for logging, validation, and transaction management.',
    h_laravel_jobs: 'Laravel Jobs as Commands',
    p_laravel_jobs: 'Laravel\'s <code>dispatch()</code> helper and <code>ShouldQueue</code> interface are a first-class implementation of the Command pattern. A job class is the command object; <code>handle()</code> is the handler. Laravel adds serialisation, queue routing, retry policies, and timeouts on top of the raw pattern. Understanding this lets you reason about when to use a plain synchronous command bus versus queued jobs.',
    h_undo_redo: 'Undo / Redo with a Command History Stack',
    p_undo_redo: 'When commands implement an <code>undo()</code> method you can maintain a history stack and replay or reverse operations. This is common in rich-client apps, document editors, and multi-step wizards. Each executed command is pushed onto the history; undo pops and reverses; redo re-executes from a forward stack.',
    h_macro_commands: 'Macro Commands',
    p_macro_commands: 'A macro command composes multiple atomic commands into a single executable unit. It implements the same interface as any other command, so the bus or history manager has no idea it is composite. This is the Composite pattern applied to commands, and it enables transaction-like sequences that can also be undone as a unit.',
    h_when_not_to_use: 'When Not to Use a Command Bus',
    p_when_not_to_use: 'A command bus is excellent when you need cross-cutting concerns (logging, validation, transactions) applied uniformly, or when separating commands from handlers aids team scaling. It is overkill for small applications, simple CRUD controllers, or when the "handler" would contain only a single line calling a service method. Always weigh the indirection cost against the flexibility gained.',
    callout_cqrs_boundary: {
      title: 'CQRS Boundary',
      html: 'The Command pattern is the foundation of CQRS (Command Query Responsibility Segregation). Commands mutate state and return void (or a command ID). Queries read state and return data. Mixing them — a command that also returns the newly created entity — is pragmatic but violates strict CQRS. Know the trade-off before deciding.',
    },
    qa: {
      pairs: [
        {
          q: 'What is the difference between a command and an event in event-driven systems?',
          a: 'A command is an <em>instruction</em> directed at a specific handler: "do this thing now". It has one intended recipient and may be rejected. An event is a <em>notification</em> that something has already happened: "this thing occurred". It has zero or many listeners and cannot be rejected — the fact is immutable. Commands are imperative ("transfer funds"); events are past-tense ("FundsTransferred"). In Laravel: jobs and commands are commands; Laravel events / listeners are the event model.',
        },
        {
          q: 'How do you handle validation — in the command object or in the handler?',
          a: 'Format/type validation (is the amount a positive number?) belongs in the command constructor or a dedicated validation middleware in the bus pipeline, so invalid commands never reach the handler. Business-rule validation (does the account have sufficient funds?) belongs in the handler or a domain service, because it requires database state. Keeping these layers separate prevents coupling infrastructure (validation rules from HTTP request) to domain logic.',
        },
        {
          q: 'Can commands return values, or must they be void?',
          a: 'Strict CQRS says commands should return void — they mutate state but don\'t return data. In practice, returning the ID of a newly created resource (not the full entity) is a widely accepted pragmatic exception. Returning a full domain object from a command blurs the command/query boundary and makes handlers harder to use in asynchronous contexts. Laravel\'s synchronous bus allows return values; queued jobs run asynchronously and cannot return values to the caller.',
        },
      ],
    },
    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'A command is a plain data object representing an intent; a handler contains the execution logic — keep them separate.',
        'The command bus is the invoker: it maps command classes to handler classes and applies middleware (logging, transactions, validation).',
        'Laravel jobs are a first-class implementation of the Command pattern enriched with serialisation, queuing, and retry policies.',
        'Commands with <code>undo()</code> methods enable a history stack for multi-step undo/redo without exposing internals.',
        'Macro commands compose atomic commands using the Composite pattern, allowing rollback of an entire sequence in reverse order.',
        'Commands should be void in strict CQRS; returning a resource ID is a pragmatic compromise widely used in PHP frameworks.',
        'A command bus adds value for cross-cutting concerns but is overkill in simple CRUD scenarios — apply deliberately.',
      ],
    },
  },
};

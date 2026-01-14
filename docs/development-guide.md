# Development Guide

## Architecture Overview

Microsoft 365 AI Agent built with Clean Architecture principles:

- **Runtime**: Bun with TypeScript, Express.js server
- **M365 SDK**: `@microsoft/agents-hosting` for bot framework integration
- **AI**: Azure OpenAI via `@ai-sdk/azure` with streaming responses
- **DI**: TSyringe container for service management
- **Build**: ESBuild with source maps

## Directory Structure

```
src/
  application/          # Application layer - use cases & orchestration
    commands/           # User-facing command implementations
    services/           # Application services (message processing, routing)

  domain/               # Domain layer - pure business logic
    commands/           # Command abstractions (base class, executor, parser)
    repositories/       # Repository interfaces and implementations

  infrastructure/       # Infrastructure layer - external concerns
    adapter/            # CloudAdapter factory
    config/             # Configuration service, validators, prompts
    http/               # Express routes (messages, health)
    logging/            # Logger service
    storage/            # Storage factory

  bot/                  # Bot handlers
    activity-handlers/  # Activity handlers (echo, demo, admin)
    main-handler/       # Primary AI handler

  features/             # Feature modules (vertical slices)
    demo-scenarios/     # Demo feature (cards, scenarios)

  shared/               # Shared utilities and types
    interfaces/         # Consolidated TypeScript interfaces

  utils/                # Utility functions

  bootstrap/            # Application bootstrapping
```

## Key Files

### Entry Points

- `src/index.ts` - Application bootstrap and startup
- `src/infrastructure/http/index.ts` - Express router configuration
- `src/infrastructure/http/routes/messages.ts` - Bot message endpoint handler

### Application Layer

- `src/application/services/message-processor.service.ts` - Composition root for message handling
- `src/application/services/handler-manager.service.ts` - Handler registration and resolution
- `src/application/services/message-router.service.ts` - Routes messages to commands or handlers
- `src/application/commands/` - User-facing commands (menu, set-mode, etc.)

### Domain Layer

- `src/domain/commands/command.ts` - Abstract Command base class
- `src/domain/commands/command-executor.ts` - Executes commands
- `src/domain/commands/command-parser.ts` - Parses command strings
- `src/domain/repositories/user-preferences.repository.ts` - User state management

### Infrastructure Layer

- `src/infrastructure/adapter/adapter.factory.ts` - CloudAdapter factory
- `src/infrastructure/config/configuration.service.ts` - Configuration management
- `src/infrastructure/config/env-config-loader.ts` - Loads from environment variables
- `src/infrastructure/config/config-validator.ts` - Validates configuration
- `src/infrastructure/config/prompts.ts` - Centralized AI system prompts
- `src/infrastructure/http/index.ts` - Express router setup
- `src/infrastructure/http/routes/messages.ts` - Bot message endpoint
- `src/infrastructure/logging/logger.service.ts` - Logging service
- `src/infrastructure/storage/storage.factory.ts` - Factory for creating storage instances

### Bot Layer

- `src/bot/activity-handlers/` - Activity handlers
  - `base.handler.ts` - Base class for activity handlers
  - `echo.handler.ts`, `demo.handler.ts`, `admin.handler.ts` - Specialized handlers
  - `raw-activity.handler.ts` - Raw activity handler
- `src/bot/main-handler/ai.handler.ts` - AI-powered handler with streaming

### Shared

- `src/shared/interfaces/` - Consolidated TypeScript interfaces
  - `logger.interface.ts` - ILogger interface
  - `config.interface.ts` - Configuration interfaces
  - `bot.interface.ts` - Bot-related interfaces
  - `orchestrator.interface.ts` - Orchestrator interfaces

### Bootstrap

- `src/bootstrap/services.ts` - DI container service registration

## Code Patterns

### Dependency Injection (TSyringe)

```typescript
// Registration (in bootstrap/services.ts)
container.register<ServiceType>(ServiceType, { useValue: instance });

// Resolution
const service = container.resolve<ServiceType>(ServiceType);
```

### Activity Handlers

Extend `BaseActivityHandler` to reduce boilerplate:

```typescript
import { TurnContext } from "@microsoft/agents-hosting";
import { BaseActivityHandler } from "src/bot/activity-handlers/base.handler";
import { ILogger } from "src/shared/interfaces";

export class MyHandler extends BaseActivityHandler {
  constructor(logger: ILogger) {
    super("MyHandler", logger);
  }

  protected async processMessage(context: TurnContext): Promise<void> {
    await context.sendActivity(`You said: ${context.activity.text}`);
  }

  // Optional: Override welcome message
  protected getWelcomeMessage(): string {
    return "Welcome to MyHandler!";
  }
}
```

### Commands

```typescript
import { TurnContext } from "@microsoft/agents-hosting";
import { Command } from "src/domain/commands/command";
import { CommandRequest } from "src/shared/interfaces";

export class MyCommand extends Command {
  constructor() {
    super("mycommand", "Description", [{ name: "arg1", required: true }]);
  }

  canExecute(request: CommandRequest): boolean {
    return true;
  }

  async execute(request: CommandRequest, context: TurnContext) {
    await context.sendActivity(`Arg1: ${request.args[0]}`);
  }
}
```

### Streaming Responses

```typescript
context.streamingResponse.queueTextChunk(text);
context.streamingResponse.queueInformativeUpdate("status");
await context.streamingResponse.endStream();
```

## Common Tasks

### Adding a New Command

1. Create file in `src/application/commands/`
2. Export in `src/application/commands/index.ts`
3. Register in `src/application/services/message-processor.service.ts`

### Adding a New Handler

1. Create file in `src/bot/activity-handlers/`
2. Extend `BaseActivityHandler`
3. Export in `src/bot/activity-handlers/index.ts`
4. Add to `getActivityHandlers()` factory function
5. Add handler name to `HandlerName` type

### Adding Environment Variables

1. Add to `src/infrastructure/config/env-config-loader.ts`
2. Add to `src/shared/interfaces/config.interface.ts` if needed
3. Add to `.env.example`

### Modifying AI Behavior

- Edit `src/infrastructure/config/prompts.ts` - AI system prompts and personality
- Edit `src/bot/main-handler/ai.handler.ts` - Message processing logic

## Build & Run

```bash
bun run dev          # Development with auto-reload
bun run build        # ESBuild compilation to dist/
bun run start        # Run compiled version
bun run debug        # Debug mode on port 9229
```

## Code Quality

```bash
bun run check        # Format check + lint
bun run format       # Prettier formatting
bun run lint:fix     # ESLint with auto-fix
```

## Debugging

- Set `LOG_LEVEL=debug` for verbose logging
- Use `bun run debug` for Node.js inspector on localhost:9229
- Source maps enabled for TypeScript debugging

## Layer Dependencies

Follow Clean Architecture dependency rules:

- `application/` → can import from `domain/`, `infrastructure/`, `bot/`, `shared/`
- `domain/` → can import from `shared/` only (no infrastructure dependencies)
- `infrastructure/` → can import from `shared/` only
- `bot/` → can import from `infrastructure/`, `features/`, `shared/`
- `features/` → can import from `shared/`
- `shared/` → no imports from other layers

## Key Integration Points

- **M365 Authentication**: Via `@microsoft/agents-hosting` CloudAdapter
- **Azure OpenAI**: Streaming text generation with system prompts
- **Express Routes**: Health checks (`/health`) and messages (`/api/messages`)
- **Graceful Shutdown**: SIGTERM/SIGINT handling with container disposal

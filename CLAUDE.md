# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-platform bot built with Clean Architecture, Azure OpenAI integration, and TSyringe dependency injection. Currently supports Microsoft Teams via Microsoft 365 Agents SDK. Uses Bun runtime with Express.js server.

## Build & Development Commands

```bash
bun run dev          # Development with auto-reload (nodemon)
bun run build        # Build to dist/
bun run build:prod   # Production build (NODE_ENV=production)
bun run start        # Run compiled dist/index.js
bun run debug        # Debug mode with inspector on localhost:9229

bun run check        # Run format:check + lint
bun run format       # Prettier formatting
bun run lint:fix     # ESLint with auto-fix
```

## Architecture

### Directory Structure (Clean Architecture)

```
src/
  application/                    # Application layer - use cases & orchestration
    commands/                     # User-facing command implementations
    services/                     # Application services
      message-processor.service.ts  # Composition root for message handling
      handler-manager.service.ts    # Handler registration and resolution
      message-router.service.ts     # Routes messages to commands or handlers

  domain/                         # Domain layer - pure business logic
    commands/                     # Command abstractions
      command.ts                  # Abstract Command base class
      command-executor.ts         # Command execution orchestration
      command-parser.ts           # Input parsing
    repositories/                 # Repository interfaces and implementations
      user-preferences.repository.ts

  infrastructure/                 # Infrastructure layer - external concerns
    adapter/                      # CloudAdapter factory
      adapter.factory.ts          # Creates CloudAdapter instances
    config/                       # Configuration loading & validation
      configuration.service.ts    # App configuration management
      env-config-loader.ts        # Environment variable loading
      config-validator.ts         # Configuration validation
      prompts.ts                  # Centralized AI system prompts
      constants.ts                # Configuration constants
      runtime-config.ts           # Runtime configuration
    http/                         # Express routes
      routes/messages.ts          # Bot message endpoint
    logging/                      # Logging infrastructure
      logger.service.ts           # Structured logging
    storage/                      # Storage implementations
      storage.factory.ts          # Creates storage instances

  bot/                            # Bot handlers (Microsoft Teams)
    activity-handlers/            # Activity handler implementations
      base.handler.ts             # Base activity handler
      echo.handler.ts             # Echo handler
      demo.handler.ts             # Demo handler
      admin.handler.ts            # Admin handler
      raw-activity.handler.ts     # Raw activity handler
    main-handler/                 # Primary AI handler
      ai.handler.ts               # AI handler with streaming

  features/                       # Feature modules (vertical slices)
    demo-scenarios/               # Demo feature - self-contained
      cards/                      # Adaptive cards
      scenarios/                  # Demo scenarios

  shared/                         # Shared utilities and types
    interfaces/                   # Consolidated TypeScript interfaces

  utils/                          # Utility functions
    helpers.ts

  bootstrap/                      # Application bootstrapping
    services.ts                   # DI container setup
```

### Request Flow

```
HTTP Request → Express Router → JWT Auth → MessageProcessor → MessageRouter → Handler/Command → Response
```

### Key Components

- **Entry**: `src/index.ts` bootstraps services and starts server
- **Application Layer** (`src/application/`):
  - `commands/` - User commands like `$menu`, `$set-mode`
  - `services/` - Message processing, routing, handler manager
- **Domain Layer** (`src/domain/`):
  - `commands/` - Command base class, parser, executor
  - `repositories/` - User preferences repository
- **Infrastructure Layer** (`src/infrastructure/`):
  - `adapter/` - CloudAdapter factory
  - `config/` - Configuration service, validators, prompts
  - `http/` - Express routes
  - `logging/` - Logger service
  - `storage/` - Storage factory
- **Bot Layer** (`src/bot/`):
  - `activity-handlers/` - Activity handlers (echo, demo, admin, etc.)
  - `main-handler/` - AI handler with streaming
- **Features** (`src/features/`):
  - `demo-scenarios/` - Demo cards and scenarios
- **Shared** (`src/shared/interfaces/`): Consolidated TypeScript interfaces
- **Utils** (`src/utils/`): Utility functions

### Bot Handlers

The `bot/` directory contains bot-specific implementations:

```typescript
// Import handlers
import { BaseActivityHandler } from "src/bot/activity-handlers/base.handler";
import { AIHandler } from "src/bot/main-handler/ai.handler";
import { getActivityHandlers } from "src/bot/activity-handlers";

// Import adapter factory
import { createAdapter } from "src/infrastructure/adapter";
```

### Dependency Injection (TSyringe)

Services registered in `src/bootstrap/services.ts`:

```typescript
container.register<LoggerService>(LoggerService, { useValue: logger });
const logger = container.resolve<LoggerService>(LoggerService);
```

### Adding New Commands

1. Create file in `src/application/commands/`:

```typescript
import { Command } from "src/domain/commands/command";
import { CommandRequest } from "src/shared/interfaces";

export class MyCommand extends Command {
  constructor() {
    super("mycommand", "Description", [{ name: "arg1", required: true }]);
  }

  canExecute(request: CommandRequest) {
    return true;
  }

  async execute(request: CommandRequest, context: TurnContext) {
    await context.sendActivity("Hello!");
  }
}
```

2. Export in `src/application/commands/index.ts`
3. Register in `src/application/services/message-processor.service.ts`

### Adding New Activity Handlers

1. Create handler class extending `BaseActivityHandler` in `src/bot/activity-handlers/`:

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
}
```

2. Register in `src/bot/activity-handlers/index.ts`
3. Add command to switch to it (see `set-mode.ts`)

### Streaming Responses (AI Handler)

```typescript
context.streamingResponse.queueTextChunk(text);
context.streamingResponse.queueInformativeUpdate("thinking...");
await context.streamingResponse.endStream();
```

## Configuration

- Environment config loaded via `src/infrastructure/config/env-config-loader.ts`
- Validation in `src/infrastructure/config/config-validator.ts`
- `.env` only loaded in non-production environments
- Required: BOT_ID, TENANT_ID, BOT_PASSWORD, AZURE_OPENAI_* vars

## Code Conventions

See `docs/code-conventions.md` for full details:

- Max 500 lines per file (break up at 400)
- Functions under 30-40 lines
- Single responsibility per file/class
- Use ViewModel/Manager/Coordinator patterns
- Descriptive names (avoid `data`, `info`, `helper`, `temp`)

### Import Convention

Use `src/` prefix for all imports (TypeScript path alias configured in `tsconfig.json`):

```typescript
// Good - use src/ prefix
import { ILogger } from "src/shared/interfaces";
import { Command } from "src/domain/commands/command";
import { ConfigurationService } from "src/infrastructure/config";
import { AIHandler } from "src/bot/main-handler/ai.handler";
import { BaseActivityHandler } from "src/bot/activity-handlers/base.handler";

// Avoid - relative imports (except within same layer/module)
import { ILogger } from "../../shared/interfaces";
```

### File Naming

- Services: `*.service.ts` (e.g., `configuration.service.ts`)
- Handlers: `*.handler.ts` or descriptive name (e.g., `ai.handler.ts`, `base.handler.ts`)
- Repositories: `*.repository.ts`
- Factories: `*.factory.ts`
- Interfaces: `*.interface.ts`

### Layer Dependencies

Follow Clean Architecture dependency rules:
- `application/` → can import from `domain/`, `infrastructure/`, `bot/`, `shared/`
- `domain/` → can import from `shared/` only (no infrastructure dependencies)
- `infrastructure/` → can import from `shared/` only
- `bot/` → can import from `infrastructure/`, `features/`, `shared/`
- `features/` → can import from `shared/`
- `shared/` → no imports from other layers

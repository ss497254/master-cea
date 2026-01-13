# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Microsoft Teams bot built with Microsoft 365 Agents SDK, Azure OpenAI integration, and TSyringe dependency injection. Uses Bun runtime with Express.js server.

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

### Request Flow

```
HTTP Request → Express Router → JWT Auth → Message Processor → Activity Handler → Command Executor (if command) → Response
```

### Key Components

- **Entry**: `src/index.ts` bootstraps services and starts server
- **Server**: `src/server.ts` configures Express routes
- **Activity Handlers** (`src/bot/activity-handlers/`): Handle different bot modes (AI, Echo, Demo, Admin)
- **Commands** (`src/commands/`): User commands like `-help`, `-set-mode`
- **Core Commands** (`src/core/commands/`): Command base class, parser, and executor
- **Core Services** (`src/core/services/`):
  - `configuration.service.ts` - App configuration management
  - `logger.service.ts` - Structured logging
  - `message-processor.service.ts` - Composition root for message handling
  - `handler-registry.service.ts` - Handler registration and resolution
  - `message-router.service.ts` - Routes messages to commands or handlers
  - `storage.factory.ts` - Creates storage instances
- **Repositories** (`src/core/repositories/`): `UserPreferencesRepository` for user state
- **Shared Interfaces** (`src/shared/interfaces/`): Consolidated TypeScript interfaces
- **Prompts** (`src/config/prompts.ts`): Centralized AI system prompts

### Dependency Injection (TSyringe)

Services registered in `src/core/bootstrap/services.ts`:

```typescript
container.register<LoggerService>(LoggerService, { useValue: logger });
const logger = container.resolve<LoggerService>(LoggerService);
```

### Adding New Commands

1. Create file in `src/commands/`:

```typescript
export class MyCommand extends Command {
  name = "mycommand";
  description = "Description";
  args = [{ name: "arg1", required: true }];

  canExecute(request: CommandRequest) {
    return true;
  }
  async execute(request: CommandRequest, context: TurnContext) {}
}
```

2. Register in `src/commands/index.ts`

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

- Environment config loaded via `src/config/env-config-loader.ts`
- Validation in `src/config/config-validator.ts`
- `.env` only loaded in non-production environments
- Required: BOT*ID, TENANT_ID, BOT_PASSWORD, AZURE_OPENAI*\* vars

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
import { Command } from "src/core/commands/command";

// Avoid - relative imports
import { ILogger } from "../../shared/interfaces";
```

### File Naming

- Services: `*.service.ts` (e.g., `configuration.service.ts`)
- Handlers: `*.handler.ts` or descriptive name (e.g., `ai.ts`, `base.handler.ts`)
- Repositories: `*.repository.ts`
- Factories: `*.factory.ts`
- Interfaces: `*.interface.ts`

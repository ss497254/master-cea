# Development Guide

## Architecture Overview

Microsoft 365 AI Agent built with:

- **Runtime**: Bun with TypeScript, Express.js server
- **M365 SDK**: `@microsoft/agents-hosting` for bot framework integration
- **AI**: Azure OpenAI via `@ai-sdk/azure` with streaming responses
- **DI**: TSyringe container for service management
- **Build**: ESBuild with source maps

## Key Files

### Entry Points

- `src/index.ts` - Application bootstrap and startup
- `src/server.ts` - Express server configuration
- `src/routes/messages.ts` - Bot message endpoint handler

### Core Services

- `src/core/services/configuration.service.ts` - Configuration management
- `src/core/services/logger.service.ts` - Logging service
- `src/core/services/message-processor.service.ts` - Composition root for message handling
- `src/core/services/handler-registry.service.ts` - Handler registration and resolution
- `src/core/services/message-router.service.ts` - Routes messages to commands or handlers
- `src/core/services/storage.factory.ts` - Factory for creating storage instances
- `src/core/bootstrap/services.ts` - Service registration

### Repositories

- `src/core/repositories/user-preferences.repository.ts` - User state management (mode preferences)

### Bot Handlers

- `src/bot/activity-handlers/base.handler.ts` - Base class for all handlers
- `src/bot/activity-handlers/ai.ts` - AI-powered handler (main)
- `src/bot/activity-handlers/echo.ts` - Echo handler
- `src/bot/activity-handlers/demo.ts` - Demo handler
- `src/bot/activity-handlers/admin.ts` - Admin handler
- `src/bot/activity-handlers/index.ts` - Handler registration

### Shared Interfaces

- `src/shared/interfaces/` - Consolidated TypeScript interfaces
  - `logger.interface.ts` - ILogger interface
  - `config.interface.ts` - Configuration interfaces
  - `bot.interface.ts` - Bot-related interfaces
  - `orchestrator.interface.ts` - Orchestrator interfaces

### Command System

- `src/core/commands/command-executor.ts` - Executes commands
- `src/core/commands/command-parser.ts` - Parses command strings
- `src/commands/` - User-facing commands

### Configuration

- `src/config/env-config-loader.ts` - Loads from environment variables
- `src/config/config-validator.ts` - Validates configuration
- `src/config/prompts.ts` - Centralized AI system prompts

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
import { Command } from "src/core/commands/command";
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

### Adding a New Feature

1. Identify the layer: Handler, Command, Service, or Route
2. Use dependency injection via TSyringe
3. Follow existing patterns
4. Update configuration if needed
5. Register in appropriate index files

### Adding Environment Variables

1. Add to `src/config/env-config-loader.ts`
2. Add to `src/shared/interfaces/config.interface.ts` if needed
3. Add to `.env.example`

### Modifying AI Behavior

- Edit `src/config/prompts.ts` - AI system prompts and personality
- Edit `src/bot/activity-handlers/ai.ts` - Message processing logic

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

## Key Integration Points

- **M365 Authentication**: Via `@microsoft/agents-hosting` CloudAdapter
- **Azure OpenAI**: Streaming text generation with system prompts
- **Express Routes**: Health checks (`/health`) and messages (`/api/messages`)
- **Graceful Shutdown**: SIGTERM/SIGINT handling with container disposal

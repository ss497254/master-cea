# GitHub Copilot Instructions

## Architecture Overview

This is a Microsoft 365 AI Agent built with:

- **Runtime**: Bun with TypeScript, Express.js server
- **M365 SDK**: `@microsoft/agents-hosting` for bot framework integration
- **AI**: Azure OpenAI via `@ai-sdk/azure` with streaming responses
- **DI**: TSyringe container for service management
- **Build**: ESBuild with source maps and Node.js 18 target

## Key Patterns

### Dependency Injection & Bootstrap

- Use TSyringe container (`src/core/bootstrap/services.ts`) for service registration
- Services are registered at startup and resolved via `container.resolve<T>()`
- Example: `const logger = container.resolve<LoggerService>(LoggerService)`

### Service Architecture

- **ConfigurationService**: Environment-based config with validation (`src/core/services/`)
- **LoggerService**: Structured logging with different levels
- Services follow interface contracts in `src/interfaces/services/`

### Command System

- Commands in `src/commands/` follow a registration pattern
- CommandExecutor handles parsing, validation, and execution
- Commands extend base `Command` class with `execute()` and `canExecute()` methods
- Support both positional args and named args

### Activity Handlers

- Located in `src/activity-handlers/` for different bot interaction modes
- `AIHandler` uses streaming responses with Azure OpenAI
- Extend `ActivityHandler` from Microsoft agents SDK

## Development Workflows

### Build & Run

```bash
bun run dev          # Development with auto-reload (nodemon)
bun run build        # ESBuild compilation to dist/
bun run start        # Run compiled version
bun --inspect        # Debug mode on port 9229
```

### Code Quality

```bash
bun run check        # Format check + lint
bun run format       # Prettier formatting
bun run lint:fix     # ESLint with auto-fix
```

### Deployment

- Custom deployment system via `scripts/deploy.js`
- Versioned deployments with symlink switching
- Global CLI installation via `scripts/install-global.sh`

## File Organization Rules

Follow the existing patterns from `.github/rules.md`:

- **Max 500 lines per file** (break up at 400 lines)
- **Single responsibility** - one concern per class/file
- **Service separation**: ViewModel/Manager/Coordinator patterns
- **Core services** in `src/core/services/`
- **Interfaces** define contracts in `src/interfaces/`

## Configuration

- Environment-based config loading via `EnvironmentConfigLoader`
- Validation via `ConfigValidator`
- Config accessed through `ConfigurationService` methods like `getAzureOpenAIConfig()`
- Bot config, Azure OpenAI, logging, and command settings

## Key Integration Points

- **M365 Authentication**: Via `@microsoft/agents-hosting` CloudAdapter
- **Azure OpenAI**: Streaming text generation with system prompts
- **Express Routes**: Health checks and message endpoints in `src/routes/`
- **Graceful Shutdown**: SIGTERM/SIGINT handling with container disposal

## Debugging

- Multiple VS Code debug configurations available
- Bun inspector support on localhost:9229
- Source maps enabled for TypeScript debugging

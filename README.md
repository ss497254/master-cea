# Master CEA

A modern, flexible, and extensible AI agent built with the Microsoft 365 Agents SDK that integrates seamlessly with M365 services and provides intelligent assistance powered by Azure OpenAI.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development](#development)
- [Key Concepts](#key-concepts)
- [Extension Points](#extension-points)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

Master CEA is a Microsoft Teams bot that provides AI-powered assistance using Azure OpenAI. The bot supports:

- **AI-powered conversations** via Azure OpenAI with streaming responses
- **Command system** for executing specific actions
- **Multiple activity handlers** (AI, Echo, Demo, Pro modes)
- **Flexible storage** (memory, file, Azure Blob, CosmosDB)
- **Dependency injection** using TSyringe
- **Structured logging** with configurable levels

## Architecture

### Core Components

1. **Express Server** (`src/server.ts`): HTTP server with routes for bot messages
2. **Activity Handlers** (`src/bot/activity-handlers/`): Handle different types of bot interactions
3. **Command System** (`src/core/commands/`): Executes user commands with parsing and validation
4. **Configuration Service** (`src/core/services/configuration-service.ts`): Manages app configuration
5. **Message Processor** (`src/core/services/message-processor.service.ts`): Processes incoming messages and routes to appropriate handlers

### Request Flow

```
HTTP Request → Express Router → JWT Authorization → Message Processor
    → Activity Handler → Command Executor (if command) → Response
```

### Dependency Injection

The project uses **TSyringe** for dependency injection. Services are registered in `src/core/bootstrap/services.ts` and resolved using the container.

## Project Structure

```
master-cea/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── server.ts                # Express server setup
│   ├── adapter.ts               # Bot adapter configuration
│   │
│   ├── bot/                     # Bot-specific code
│   │   └── activity-handlers/   # Different bot modes/handlers
│   │       ├── ai.ts           # AI-powered handler (Azure OpenAI)
│   │       ├── echo.ts         # Echo handler
│   │       ├── demo.ts         # Demo handler
│   │       └── pro.ts          # Pro-Bot handler
│   │
│   ├── commands/                # User-facing commands
│   │   ├── help.ts             # Help command
│   │   ├── set-mode.ts         # Set bot mode
│   │   ├── get-mode.ts         # Get current mode
│   │   └── list-mode.ts        # List available modes
│   │
│   ├── core/                    # Core application logic
│   │   ├── bootstrap/          # Service registration
│   │   ├── commands/           # Command execution system
│   │   └── services/           # Core services (Config, Logger, MessageProcessor)
│   │
│   ├── config/                  # Configuration management
│   │   ├── env-config-loader.ts    # Loads config from environment
│   │   ├── config-validator.ts     # Validates configuration
│   │   └── constants.ts            # Configuration constants
│   │
│   ├── interfaces/              # TypeScript interfaces
│   │   ├── bot/                # Bot-related interfaces
│   │   ├── config/             # Configuration interfaces
│   │   └── services/           # Service interfaces
│   │
│   ├── routes/                  # Express routes
│   │   └── messages.ts         # Bot message endpoint
│   │
│   └── utils/                   # Utility functions
│
├── appPackage/                  # Teams app package (manifest, icons)
├── bot-storage/                 # File-based bot state storage
├── dist/                        # Compiled JavaScript output
├── scripts/                     # Deployment and utility scripts
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── esbuild.config.js            # Build configuration
```

## Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** >= 1.0 (primary runtime)
- **Node.js** >= 18.0 (for compatibility)
- **TypeScript** (included in devDependencies)
- **Azure OpenAI** account with API access
- **Microsoft Bot Framework** app registration

### Installation

```bash
# Install dependencies
bun install
```

### Environment Setup

Create a `.env` file in the project root (see [Configuration](#configuration) for all variables):

```bash
# Bot Configuration
BOT_ID=your-bot-id
TENANT_ID=your-tenant-id
BOT_PASSWORD=your-bot-password
AUTHORITY=https://login.microsoftonline.com

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_MAX_TOKENS=2000
AZURE_OPENAI_TEMPERATURE=0.7

# Server Configuration
PORT=8080
NODE_ENV=development

# Logging
LOG_LEVEL=info
ENABLE_CONSOLE_LOGGING=true

# Commands
ENABLE_COMMANDS=true
COMMAND_PREFIX=-

# Storage (choose one)
STORAGE_TYPE=memory  # Options: memory, file, blob, cosmosdb
```

### Running the Application

```bash
# Development mode with auto-reload (uses nodemon)
bun run dev

# Build the project
bun run build

# Start production build
bun run start

# Direct TypeScript execution (development)
bun src/index.ts

# Debug mode (with inspector)
bun run debug
```

## Configuration

### Environment Variables

#### Bot Authentication

- `BOT_ID`: Microsoft Bot Framework application ID
- `TENANT_ID`: Azure AD tenant ID
- `BOT_PASSWORD`: Bot application secret
- `AUTHORITY`: OAuth authority (default: `https://login.microsoftonline.com`)

#### Azure OpenAI

- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key (required)
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint URL (required)
- `AZURE_OPENAI_DEPLOYMENT_NAME`: Model deployment name (default: `gpt-4`)
- `AZURE_OPENAI_API_VERSION`: API version (default: `2024-12-01-preview`)
- `AZURE_OPENAI_MAX_TOKENS`: Maximum tokens per response (default: `2000`)
- `AZURE_OPENAI_TEMPERATURE`: Temperature setting (default: `0.7`)

#### Server

- `PORT`: Server port (default: `8080`)
- `NODE_ENV`: Environment (`development`, `staging`, `production`)

#### Logging

- `LOG_LEVEL`: Log level (`debug`, `info`, `warn`, `error`, default: `info`)
- `ENABLE_CONSOLE_LOGGING`: Enable console output (default: `true`)

#### Commands

- `ENABLE_COMMANDS`: Enable command system (default: `false`)
- `COMMAND_PREFIX`: Command prefix character (default: `-`)

#### Storage

**Memory Storage** (default):

```bash
STORAGE_TYPE=memory
```

**File Storage**:

```bash
STORAGE_TYPE=file
STORAGE_FOLDER_PATH=./bot-storage
```

**Azure Blob Storage**:

```bash
STORAGE_TYPE=blob
BLOB_CONTAINER_ID=bot-container
BLOB_CONNECTION_STRING=your-connection-string
```

**CosmosDB Storage**:

```bash
STORAGE_TYPE=cosmosdb
COSMOSDB_DATABASE_ID=BotDatabase
COSMOSDB_CONTAINER_ID=BotContainer
COSMOSDB_ENDPOINT=your-endpoint
COSMOSDB_KEY=your-key
```

### Configuration Loading

Configuration is loaded from environment variables via `EnvironmentConfigLoader`. In non-production environments, it automatically loads from `.env` using `dotenv`.

The `ConfigurationService` validates all required configuration values on startup.

## Development

### Available Scripts

```bash
# Development
bun run dev              # Start with nodemon (auto-reload)
bun run debug            # Start with Node.js inspector

# Building
bun run build            # Build for production
bun run build:watch      # Build with watch mode
bun run build:prod       # Production build with NODE_ENV=production
bun run clean            # Remove dist directory

# Code Quality
bun run lint             # Run ESLint
bun run lint:fix         # Fix ESLint errors
bun run format           # Format code with Prettier
bun run format:check     # Check formatting
bun run check            # Run format:check and lint

# Deployment
bun run deploy           # Build and deploy
```

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Auto-reload**: `bun run dev` watches for changes and restarts
3. **Test locally**: Use Bot Framework Emulator or Teams
4. **Build**: `bun run build` compiles to `dist/`
5. **Deploy**: `bun run deploy` builds and deploys

### Adding New Activity Handlers

1. Create a new handler class in `src/bot/activity-handlers/`:

```typescript
import { ActivityHandler, TurnContext } from "@microsoft/agents-hosting";

export class MyHandler extends ActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      await context.sendActivity("Hello from MyHandler!");
      await next();
    });
  }
}
```

2. Register it in `src/bot/activity-handlers/index.ts`
3. Add a command to switch to it (see `src/commands/set-mode.ts`)

### Adding New Commands

1. Create command file in `src/commands/`:

```typescript
import { Command } from "../core/commands/command";
import { CommandRequest, TurnContext } from "../interfaces";

export class MyCommand extends Command {
  name = "mycommand";
  description = "Does something cool";
  args = [];

  async execute(request: CommandRequest, context: TurnContext) {
    await context.sendActivity("Command executed!");
  }
}
```

2. Register it in `src/commands/index.ts`
3. The command will be available as `-mycommand` (or your configured prefix)

## Key Concepts

### Activity Handlers

Activity handlers extend `ActivityHandler` from `@microsoft/agents-hosting` and respond to bot activities:

- `onMessage`: Handles text messages
- `onMembersAdded`: Handles when members join
- `onMessageReaction`: Handles message reactions
- And more...

### Command System

Commands are executed when users type messages starting with the command prefix (default: `-`). Commands support:

- **Named arguments**: `-command --arg value`
- **Positional arguments**: `-command value1 value2`
- **Required/optional arguments**
- **Permission checks** via `canExecute()`

### Streaming Responses

The AI handler uses streaming responses for real-time text generation:

```typescript
context.streamingResponse.queueTextChunk(text);
context.streamingResponse.queueInformativeUpdate("thinking...");
await context.streamingResponse.endStream();
```

### Dependency Injection

Services are registered and resolved using TSyringe:

```typescript
// Registration (in bootstrap/services.ts)
container.register<LoggerService>(LoggerService, { useValue: logger });

// Resolution (anywhere)
const logger = container.resolve<LoggerService>(LoggerService);
```

## Extension Points

### Custom Storage Backends

Implement a storage adapter by extending the storage configuration in `env-config-loader.ts` and implementing the storage interface.

### Custom Configuration Loaders

Implement `IConfigLoader` interface to load configuration from other sources (e.g., Azure Key Vault, database).

### Custom Loggers

Implement `ILogger` interface to add custom logging backends (e.g., Application Insights, Splunk).

### Middleware

Add Express middleware in `src/server.ts` for cross-cutting concerns (authentication, rate limiting, etc.).

## Deployment

### Build for Production

```bash
bun run build:prod
```

This sets `NODE_ENV=production` and creates an optimized build in `dist/`.

### Deploy Script

The project includes a deployment script (`scripts/deploy.js`) that:

1. Builds the project
2. Sets up deployment directory
3. Copies necessary files
4. Creates environment file from template

```bash
bun run deploy
```

### Manual Deployment

1. Set environment variables in your hosting platform
2. Build: `bun run build:prod`
3. Copy `dist/` and `appPackage/` to server
4. Install production dependencies: `bun install --production`
5. Start: `bun dist/index.js`

### Teams App Package

The `appPackage/` directory contains:

- `manifest.json`: Teams app manifest
- `color.png`: App icon (color)
- `outline.png`: App icon (outline)

Upload this package to Teams to install the bot.

## Troubleshooting

### Common Issues

**Bot not responding:**

- Check `BOT_ID`, `TENANT_ID`, and `BOT_PASSWORD` are correct
- Verify the bot is registered in Azure Portal
- Check network connectivity to Azure services

**Azure OpenAI errors:**

- Verify `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT`
- Check deployment name matches `AZURE_OPENAI_DEPLOYMENT_NAME`
- Ensure API version is supported

**Configuration errors:**

- Check all required environment variables are set
- Review logs for validation errors
- Ensure `.env` file is in project root (development only)

**Build errors:**

- Run `bun install` to ensure dependencies are installed
- Check TypeScript errors: `bun run lint`
- Clear `dist/` and rebuild: `bun run clean && bun run build`

### Debugging

1. **Enable debug logging**: Set `LOG_LEVEL=debug` in `.env`
2. **Use debug mode**: `bun run debug` and attach Node.js inspector
3. **Check logs**: Review console output for error messages
4. **Test endpoints**:
   - Health: `http://localhost:8080/`
   - Messages: `http://localhost:8080/api/messages` (requires auth)

### Getting Help

- Check Microsoft Bot Framework documentation
- Review Azure OpenAI API documentation
- Examine logs with `LOG_LEVEL=debug`
- Use Bot Framework Emulator for local testing

## License

[Add your license information here]

## Author

Saurabh Singh

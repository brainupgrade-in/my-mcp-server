# Build Your Own MCP Server (TypeScript)

> **Last Updated:** January 2026

This guide accompanies **Video 4: Build Your Own MCP Server** from the [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai) MCP Masterclass.

📺 **Watch the full playlist:** [MCP Masterclass](https://www.youtube.com/playlist?list=PLqGvN2U9LT-ukrMpG3SsyjtwK72qjIc54)

📖 **Setup Guide:** [MCP Setup Guide](https://github.com/brainupgrade-in/mcp-server-typescript-starter/blob/main/mcp-setup.md) - Install prerequisites and configure your MCP host

🔗 **This Repository:** [my-mcp-server](https://github.com/brainupgrade-in/my-mcp-server)

---

## Video Timeline

| Time | Section | Jump To |
|------|---------|---------|
| 0:00 | Why build your own? | [Introduction](#introduction) |
| 0:30 | Project setup | [Step 1: Project Setup](#step-1-project-setup-030) |
| 1:30 | Install MCP SDK | [Step 2: Install Dependencies](#step-2-install-dependencies-130) |
| 2:30 | Server skeleton | [Step 3: Server Skeleton](#step-3-server-skeleton-230) |
| 4:00 | Add your first TOOL | [Step 4: Adding a Tool](#step-4-adding-a-tool-400) |
| 6:00 | Add a RESOURCE | [Step 5: Adding a Resource](#step-5-adding-a-resource-600) |
| 7:30 | Test with Claude Desktop | [Step 6: Testing](#step-6-testing-730) |
| 9:00 | Your server is live! | [Next Steps](#next-steps) |

---

## Introduction

Using someone else's MCP server is nice. **Building your own is power.**

In this tutorial, we'll create a **Greeting Server** that:
- Has 1 tool: `create_greeting` - generates personalized greetings
- Has 1 resource: `greeting://templates` - lists available styles

Simple, focused, and easy to understand in 10 minutes.

---

## Step 1: Project Setup (0:30)

### Create Project Directory

```bash
mkdir my-mcp-server
cd my-mcp-server
```

### Initialize npm Project

```bash
npm init -y
```

---

## Step 2: Install Dependencies (1:30)

```bash
# MCP SDK - the core library
npm install @modelcontextprotocol/sdk

# TypeScript development tools
npm install -D typescript @types/node
```

### Configure package.json

Update your `package.json`:

```json
{
  "name": "mcp-server-greeting",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch",
    "inspector": "npx @modelcontextprotocol/inspector node dist/index.js"
  }
}
```

> **Key:** `"type": "module"` enables ES modules (required for MCP SDK)

### Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### Create Source Directory

```bash
mkdir src
touch src/index.ts
```

---

## Step 3: Server Skeleton (2:30)

Open `src/index.ts` and add:

### Import MCP SDK

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
```

**What each import does:**

| Import | Purpose |
|--------|---------|
| `Server` | Main MCP server class |
| `StdioServerTransport` | Communication via stdin/stdout |
| `ListToolsRequestSchema` | Handler for listing available tools |
| `CallToolRequestSchema` | Handler for executing tools |
| `ListResourcesRequestSchema` | Handler for listing resources |
| `ReadResourceRequestSchema` | Handler for reading resource content |
| `ErrorCode`, `McpError` | Error handling |

### Create Server Instance

```typescript
const server = new Server(
  {
    name: "greeting-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);
```

### Start the Server (add at the end)

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Greeting Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

> **Important:** Use `console.error()` for logging. `console.log()` would interfere with the MCP protocol on stdout.

---

## Step 4: Adding a Tool (4:00)

Tools are **operations the AI can perform**. Let's add a greeting tool.

### Register Tool List Handler

Add this BEFORE the `main()` function:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_greeting",
        description: "Create a personalized greeting message",
        inputSchema: {
          type: "object" as const,
          properties: {
            name: {
              type: "string",
              description: "The name of the person to greet",
            },
            style: {
              type: "string",
              enum: ["formal", "casual", "excited"],
              description: "The style of greeting (formal, casual, or excited)",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});
```

**Tool Definition Structure:**

```typescript
{
  name: "tool_name",           // Unique identifier
  description: "What it does", // AI uses this to decide when to call
  inputSchema: {               // JSON Schema for parameters
    type: "object",
    properties: { ... },
    required: ["param1"]
  }
}
```

### Handle Tool Calls

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "create_greeting") {
    const { name: personName, style = "casual" } = args as {
      name: string;
      style?: "formal" | "casual" | "excited";
    };

    const greetings: Record<string, string> = {
      formal: `Good day, ${personName}. It is a pleasure to meet you.`,
      casual: `Hi ${personName}! How's it going?`,
      excited: `Hey ${personName}!!! So awesome to see you! 🎉`,
    };

    const greeting = greetings[style] || greetings.casual;

    return {
      content: [
        {
          type: "text" as const,
          text: greeting,
        },
      ],
    };
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});
```

**Tool Response Structure:**

```typescript
return {
  content: [
    {
      type: "text",    // or "image", "resource"
      text: "Result message",
    },
  ],
};
```

---

## Step 5: Adding a Resource (6:00)

Resources are **read-only data** the AI can access.

### Register Resource List Handler

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "greeting://templates",
        name: "Greeting Templates",
        description: "Available greeting styles and examples",
        mimeType: "text/plain",
      },
    ],
  };
});
```

**Resource Definition Structure:**

```typescript
{
  uri: "protocol://path",      // Unique identifier
  name: "Display Name",        // Human-readable name
  description: "What it is",   // Explains the resource
  mimeType: "text/plain"       // Content type
}
```

### Handle Resource Reads

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "greeting://templates") {
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `Available Greeting Styles:

1. formal - Professional, polite greeting
   Example: "Good day, John. It is a pleasure to meet you."

2. casual - Friendly, everyday greeting
   Example: "Hi John! How's it going?"

3. excited - Enthusiastic, celebratory greeting
   Example: "Hey John!!! So awesome to see you! 🎉"

Usage: Ask Claude to "greet [name] in [style] style"`,
        },
      ],
    };
  }

  throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
});
```

---

## Step 6: Testing (7:30)

### Build the Project

```bash
npm run build
```

### Test with MCP Inspector

```bash
npm run inspector
```

This opens a browser UI where you can:
1. See the `create_greeting` tool
2. Call it with test parameters
3. Browse the `greeting://templates` resource
4. Read resource contents

### Test in Claude Desktop

1. Add to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "greeting": {
      "command": "node",
      "args": ["/full/path/to/my-mcp-server/dist/index.js"]
    }
  }
}
```

2. Restart Claude Desktop completely

3. Test with prompts:

```
"Greet John in formal style"
→ "Good day, John. It is a pleasure to meet you."

"Create an excited greeting for Sarah"
→ "Hey Sarah!!! So awesome to see you! 🎉"

"What greeting styles are available?"
→ (reads the greeting://templates resource)
```

---

## Complete Code

Here's the full `src/index.ts`:

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// ============ SERVER SETUP ============
const server = new Server(
  { name: "greeting-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// ============ TOOL: create_greeting ============
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_greeting",
      description: "Create a personalized greeting message",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Person's name" },
          style: {
            type: "string",
            enum: ["formal", "casual", "excited"],
            description: "Greeting style",
          },
        },
        required: ["name"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "create_greeting") {
    const { name: personName, style = "casual" } = args as {
      name: string;
      style?: string;
    };

    const greetings: Record<string, string> = {
      formal: `Good day, ${personName}. It is a pleasure to meet you.`,
      casual: `Hi ${personName}! How's it going?`,
      excited: `Hey ${personName}!!! So awesome to see you! 🎉`,
    };

    return {
      content: [{ type: "text" as const, text: greetings[style] || greetings.casual }],
    };
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});

// ============ RESOURCE: greeting://templates ============
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "greeting://templates",
      name: "Greeting Templates",
      description: "Available greeting styles",
      mimeType: "text/plain",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "greeting://templates") {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/plain",
          text: "Styles: formal, casual, excited",
        },
      ],
    };
  }
  throw new McpError(ErrorCode.InvalidRequest, `Unknown resource`);
});

// ============ START SERVER ============
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Greeting Server running");
}

main().catch(console.error);
```

---

## Next Steps

### Expand Your Server

Ideas to try:
1. Add more greeting styles (pirate, shakespearean, emoji-only)
2. Add a `get_random_greeting` tool
3. Store greeting history in memory
4. Add multiple languages

### Challenge: Add a Second Tool

Try adding this tool yourself:

```typescript
{
  name: "get_random_greeting",
  description: "Get a random greeting for someone",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Person's name" },
    },
    required: ["name"],
  },
}
```

### Key Concepts Recap

| Concept | What It Is | Example |
|---------|------------|---------|
| **Tool** | Operation AI can invoke | `create_greeting` |
| **Resource** | Read-only data | `greeting://templates` |
| **Handler** | Function that responds | `setRequestHandler(...)` |

| Handler | Purpose |
|---------|---------|
| `ListToolsRequestSchema` | Tell MCP what tools exist |
| `CallToolRequestSchema` | Execute a tool |
| `ListResourcesRequestSchema` | Tell MCP what resources exist |
| `ReadResourceRequestSchema` | Return resource content |

---

## MCP Masterclass Videos

| # | Video | Status | Link |
|---|-------|--------|------|
| 1 | What is MCP? | ✅ Published | [Watch](https://www.youtube.com/watch?v=sMzEGEv-6-4) |
| 2 | MCP Architecture | ✅ Published | [Watch](https://www.youtube.com/watch?v=t7O9T6UxK5k) |
| 3 | Install MCP Server | ✅ Published | [Watch](https://www.youtube.com/watch?v=lbLNb2eNmf8) |
| 4 | **Build Your Own Server** | 📍 YOU ARE HERE | Coming Soon |
| 5 | AI + Database | ⏳ Pending | Coming Soon |

---

## Resources

### Official Documentation
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Building MCP Servers](https://modelcontextprotocol.io/docs/concepts/servers)
- [Tools Documentation](https://modelcontextprotocol.io/docs/concepts/tools)
- [Resources Documentation](https://modelcontextprotocol.io/docs/concepts/resources)

### Learning
- [Anthropic MCP Course](https://anthropic.skilljar.com/introduction-to-model-context-protocol)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)

### This Repository
- [README](./README.md) - Quick start guide
- [Example Config](./examples/claude_desktop_config.json) - Claude Desktop configuration
- [Setup Guide](https://github.com/brainupgrade-in/mcp-server-typescript-starter/blob/main/mcp-setup.md) - Full installation guide

---

Made with ❤️ by [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai)

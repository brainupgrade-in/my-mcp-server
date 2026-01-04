#!/usr/bin/env node
/**
 * My MCP Server - Greeting Server
 *
 * Tutorial companion for: "Build Your Own MCP Server (TypeScript)"
 * Video 4 - MCP Masterclass
 * Channel: Gheware DevOps AI
 *
 * Features:
 * - TOOL: create_greeting - Generate personalized greetings
 * - RESOURCE: greeting://templates - List available greeting styles
 */

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

// ============================================
// MCP SERVER SETUP
// ============================================

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

// ============================================
// TOOL: create_greeting
// ============================================

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

// ============================================
// RESOURCE: greeting://templates
// ============================================

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

// ============================================
// START THE SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Greeting Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

# My MCP Server - Greeting Server

A simple MCP server tutorial companion for **Video 4: Build Your Own MCP Server** from [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai).

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Test with MCP Inspector
npm run inspector
```

## Features

| Type | Name | Description |
|------|------|-------------|
| **Tool** | `create_greeting` | Generate personalized greetings |
| **Resource** | `greeting://templates` | List available greeting styles |

## Greeting Styles

- **formal** - "Good day, John. It is a pleasure to meet you."
- **casual** - "Hi John! How's it going?"
- **excited** - "Hey John!!! So awesome to see you! 🎉"

## Usage with Claude Desktop

Add to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "greeting": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"]
    }
  }
}
```

Then try:
- "Greet John in formal style"
- "Create an excited greeting for Sarah"
- "What greeting styles are available?"

## Documentation

- [Full Build Guide](./mcp-build-server.md) - Step-by-step tutorial
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## MCP Masterclass Videos

1. [What is MCP?](https://www.youtube.com/watch?v=sMzEGEv-6-4) ✅
2. [MCP Architecture](https://www.youtube.com/watch?v=t7O9T6UxK5k) ✅
3. [Install MCP Server](https://www.youtube.com/watch?v=lbLNb2eNmf8) ✅
4. [**Build Your Own Server**](https://www.youtube.com/watch?v=xLASLzK3w90) 📍 YOU ARE HERE
5. AI + Database (Coming Soon)

---

Made with ❤️ by [Gheware DevOps AI](https://www.youtube.com/@gheware-devops-ai)

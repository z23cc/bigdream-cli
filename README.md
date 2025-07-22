# BigDream CLI

A conversational AI CLI tool powered by BigDream with intelligent text editor capabilities and tool usage.

<img width="980" height="435" alt="Screenshot 2025-07-21 at 13 35 41" src="https://github.com/user-attachments/assets/192402e3-30a8-47df-9fc8-a084c5696e78" />

## Features

- **🤖 Conversational AI**: Natural language interface powered by BigDream-3
- **📝 Smart File Operations**: AI automatically uses tools to view, create, and edit files
- **⚡ Bash Integration**: Execute shell commands through natural conversation
- **🔧 Automatic Tool Selection**: AI intelligently chooses the right tools for your requests
- **💬 Interactive UI**: Beautiful terminal interface built with Ink
- **🌍 Global Installation**: Install and use anywhere with `npm i -g @vibe-kit/bigdream-cli`

## Installation

### Prerequisites
- Node.js 16+ 
- BigDream API key from X.AI

### Global Installation (Recommended)
```bash
npm install -g @vibe-kit/bigdream-cli
```

### Local Development
```bash
git clone <repository>
cd bigdream-cli
npm install
npm run build
npm link
```

## Setup

1. Get your BigDream API key from [X.AI](https://x.ai)

2. **Quick Start (Recommended)**
   ```bash
   # First time - API key will be automatically saved
   bigdream --api-key your_api_key_here
   
   # Future usage - no need to provide API key again
   bigdream
   ```

3. **Alternative Setup Methods**:

**Method 1: Environment Variable**
```bash
export GROK_API_KEY=your_api_key_here
```

**Method 2: .env File**
```bash
cp .env.example .env
# Edit .env and add your API key
```

**Method 3: Manual User Settings**
Create `~/.bigdream/user-settings.json`:
```json
{
  "apiKey": "your_api_key_here"
}
```

### Custom Base URL (Optional)

You can configure a custom BigDream API endpoint:

**Quick Setup:**
```bash
# First time - both API key and base URL will be saved
bigdream --api-key your_key --base-url https://your-custom-endpoint.com/v1

# Future usage - settings are remembered
bigdream
```

**Alternative Methods:**

**Method 1: Environment Variable**
```bash
export GROK_BASE_URL=https://your-custom-endpoint.com/v1
```

**Method 2: Command Line Flag**
```bash
bigdream --api-key your_api_key_here --baseurl https://your-custom-endpoint.com/v1
```

**Method 3: User Settings File**
Add to `~/.bigdream/user-settings.json`:
```json
{
  "apiKey": "your_api_key_here",
  "baseURL": "https://your-custom-endpoint.com/v1"
}
```

## Usage

### First Time Usage
```bash
# Set up your credentials (saved automatically)
bigdream --api-key your_api_key_here

# With custom endpoint
bigdream --api-key your_key --base-url https://api.anthropic.com/v1 --model claude-sonnet-4-20250514
```
You'll see confirmation that settings are saved:
```
✓ API key saved to ~/.bigdream/user-settings.json
✓ Base URL saved to ~/.bigdream/user-settings.json
🤖 Starting BigDream CLI Conversational Assistant...
```

### Regular Usage
```bash
# Just run without any arguments - settings are remembered
bigdream

# Or specify a working directory
bigdream -d /path/to/project

# Override saved settings temporarily
bigdream --model gpt-4 --base-url https://api.openai.com/v1
```

### Custom Instructions

You can provide custom instructions to tailor BigDream's behavior to your project by creating a `.bigdream/BigDream.md` file in your project directory:

```bash
mkdir .bigdream
```

Create `.bigdream/BigDream.md` with your custom instructions:
```markdown
# Custom Instructions for BigDream CLI

Always use TypeScript for any new code files.
When creating React components, use functional components with hooks.
Prefer const assertions and explicit typing over inference where it improves clarity.
Always add JSDoc comments for public functions and interfaces.
Follow the existing code style and patterns in this project.
```

BigDream will automatically load and follow these instructions when working in your project directory. The custom instructions are added to BigDream's system prompt and take priority over default behavior.

### CLI Options

BigDream CLI supports various command-line options:

```bash
# Basic options
bigdream --api-key <key>              # API key (saved automatically)
bigdream --base-url <url>             # Custom API endpoint (saved automatically)  
bigdream --model <model>              # Specify model to use
bigdream --directory <dir>            # Set working directory

# Combined example
bigdream --api-key sk-... --base-url https://api.anthropic.com/v1 --model claude-sonnet-4-20250514
```

**Auto-Save Behavior:**
- API key and base URL are automatically saved to `~/.bigdream/user-settings.json`
- Only saves values provided via CLI (not from environment variables)
- Future runs will use saved settings unless overridden

### Model Configuration

BigDream CLI supports customizing available models through a configuration file. This allows you to add models from different providers like Anthropic, OpenAI, or other compatible APIs.

**Initialize Configuration:**
```bash
bigdream  # Start BigDream CLI, then use:
/config   # Creates ~/.bigdream/models.json template
```

**Configuration File Format:**
Create or edit `~/.bigdream/models.json`:
```json
{
  "models": [
    "grok-4-latest",
    "grok-3-latest", 
    "claude-sonnet-4-20250514",
    "gpt-4"
  ],
  "defaultModel": "grok-4-latest"
}
```

**Usage with Custom Models:**
```bash
# Use specific model via CLI
bigdream --model claude-sonnet-4-20250514 --base-url https://api.anthropic.com/v1 --api-key your_key

# Switch models during conversation
/models  # Shows model selection menu

# Or switch directly
/models claude-sonnet-4-20250514
```

**Configuration Commands:**
- `/config` - Initialize configuration file
- `/config help` - Show configuration help
- `/models` - Switch between available models

## Example Conversations

Instead of typing commands, just tell BigDream what you want to do:

```
💬 "Show me the contents of package.json"
💬 "Create a new file called hello.js with a simple console.log"
💬 "Find all TypeScript files in the src directory"
💬 "Replace 'oldFunction' with 'newFunction' in all JS files"
💬 "Run the tests and show me the results"
💬 "What's the current directory structure?"
```

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build project
npm run build

# Run linter
npm run lint

# Type check
npm run typecheck
```

## Architecture

- **Agent**: Core command processing and execution logic
- **Tools**: Text editor and bash tool implementations
- **UI**: Ink-based terminal interface components
- **Types**: TypeScript definitions for the entire system

## License

MIT

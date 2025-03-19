# Drive-Chat MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server implementation for the [Drive Chat app](https://github.com/akuya-ekorot/drive-chat), enabling AI-powered conversations with your Google Drive files.

## Features

- **Multi-client support** powered by Redis pub/sub architecture
- **Secure access** to Google Drive files with proper authentication

## Architecture

This server uses a Redis-based architecture to support multiple concurrent clients:

1. Each client establishes an SSE connection with a unique session ID
2. Messages are routed through Redis pub/sub channels
3. Responses are delivered back to the appropriate client
4. All file operations are performed using the Google Drive API

## Prerequisites

- Node.js 20+
- Redis server (local or hosted)
- Google Cloud Platform account with API access

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Copy `.env.example` to `.env` and configure:
   ```
   cp .env.example .env
   ```
4. Start the server:
   ```
   pnpm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REDIS_URL` | Connection URL for Redis (e.g., `redis://localhost:6379`) | Yes |
| `GOOGLE_API_KEY` | API key from Google Cloud Console | Yes |
| `PORT` | Server port (default: 8080) | No |

## Google Drive API Setup

1. Visit the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Create OAuth credentials (OAuth 2.0 Client ID)
5. Configure the OAuth consent screen
6. Add the following scope: `https://www.googleapis.com/auth/drive.readonly`
   - This grants read-only access to files and folders in Google Drive
   - Note: No write permissions are required for this application

## Integration

This server is designed to connect with MCP clients using the SSE Transport, providing them access to Google Drive files via the Model Context Protocol. The server exposes two main endpoints:

- `/sse` - For establishing SSE connections
- `/messages` - For handling message exchanges


## Available Tools

The MCP server exposes the following tools to AI clients:

- `health` - Verify server and API connection status
- `list` - Retrieve a list of files and folders with filtering options
- `export` - Convert Google Workspace files to plain text formats
- `get` - Retrieve file content

This server is built using [Effect](https://effect.website) because I wanted to get hands on experience with it.

## License

[MIT License](LICENSE)

# Drive-Chat Frontend

AI-powered interface for chatting with your Google Drive files.

## Overview

Frontend is built with Next.js and integrates with the [SSE MCP Server backend](https://github.com/akuya-ekorot/drive-chat/tree/main/apps/mcp-server) to provide a seamless experience for querying and exploring Google Drive content using AI. The app leverages Mastra components to create intelligent AI agents that can understand and process file content.

## Features

- **Chat with your documents** - Ask questions about your files in natural language
- **Secure authentication** - Sign in with Google and authorize access to your Drive
- **Assistant UI** - Modern, responsive interface built with Assistant UI

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Authentication**: [Clerk](https://clerk.dev/)
- **Database**: PostgreSQL
- **AI Components**:
  - [@mastra/core](https://www.npmjs.com/package/@mastra/core)
  - [@mastra/pg](https://www.npmjs.com/package/@mastra/pg)
  - [@mastra/mcp](https://www.npmjs.com/package/@mastra/mcp)
  - [@mastra/memory](https://www.npmjs.com/package/@mastra/memory)
- **UI**: [Assistant UI](https://assistant-ui.com)
- **AI SDK**: [AI SDK](https://github.com/vercel/ai)

## Prerequisites

- PostgreSQL database
- Access to the [Drive Chat MCP Server](https://github.com/akuya-ekorot/drive-chat/tree/main/apps/mcp-server)
- Google Cloud Platform account (for Google Drive API)
- API key for your chosen AI provider
- Clerk account for authentication

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/akuya-ekorot/drive-chat.git
   cd drive-chat
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables by copying the `.env.example` files in each package:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables (see Environment Variables section)

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `MCP_SERVER_URL` | URL to your MCP Server (e.g., `http://localhost:8080/sse`) | Yes |
| `DB_URL` | PostgreSQL connection string | Yes |
| `CLERK_SECRET_KEY` | Secret key from Clerk dashboard | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public key from Clerk dashboard | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page URL (e.g., `/sign-in`) | Yes |

## Authentication Setup

This application uses Clerk for authentication and to obtain Google Drive access tokens:

1. Create a [Clerk account](https://clerk.dev/)
2. Set up a new application in the Clerk dashboard
3. Configure Google OAuth:
   - Add Google as a social connection
   - Request the `https://www.googleapis.com/auth/drive.readonly` scope
4. Copy your Clerk keys to your environment variables

## MCP Client Integration

The MCP client connects to the MCP server to allow the AI to access Google Drive content. The implementation can be found in `api/chat/route.ts`.

Key aspects of the integration:
- SSE (Server-Sent Events) connection to the MCP server
- Forwarding of Google Drive access tokens

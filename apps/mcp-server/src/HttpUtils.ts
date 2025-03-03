import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { Readable } from "node:stream";

export interface SerializedRequest {
  requestId: string;
  url: string;
  method: string;
  body: string;
  headers: Record<string, string | string[] | undefined>;
}

export interface SerializedResponse {
  status: number;
  body: string;
}

export interface SyntheticIncomingMessageOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: string | Buffer | Record<string, any> | null;
}

export function createSyntheticIncomingMessage(
  options: SyntheticIncomingMessageOptions = {},
): IncomingMessage {
  const { method = "GET", url = "/", headers = {}, body = null } = options;

  // Create a socket
  const socket = new Socket();

  // Create a readable stream that will be used as the base for IncomingMessage
  const readable = new Readable();
  readable._read = (): void => {}; // Required implementation

  // Create the IncomingMessage instance
  const req = new IncomingMessage(socket);

  // Set the properties
  req.method = method;
  req.url = url;
  req.headers = headers;

  // Add body content if provided
  if (body) {
    const originalPush = req.push.bind(req);
    req.push = (chunk: any) => {
      return originalPush(chunk);
    };

    if (typeof body === "string") {
      req.push(body);
    } else if (Buffer.isBuffer(body)) {
      req.push(body);
    } else {
      req.push(JSON.stringify(body));
    }
    req.push(null); // Signal end of stream
  }

  return req;
}

export async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

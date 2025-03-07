import { Mastra } from '@mastra/core/mastra';
import { googleDriveAgent } from './agents/googleDriveAgent';
import { Logger } from '@mastra/core';

export const mastra = new Mastra({
  agents: { googleDriveAgent },
  logger: new Logger({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' }),
})


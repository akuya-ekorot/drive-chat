import { Mastra } from '@mastra/core/mastra';
import { googleDriveAgent } from './agents/googleDriveAgent';

export const mastra = new Mastra({
  agents: { googleDriveAgent }
})


import { VercelDeployer } from "@mastra/deployer-vercel";

if (!process.env.VERCEL_TEAM_ID) {
  throw new Error("VERCEL_TEAM_ID is not set");
}

if (!process.env.VERCEL_PROJECT_NAME) {
  throw new Error("VERCEL_PROJECT_NAME is not set");
}

if (!process.env.VERCEL_TOKEN) {
  throw new Error("VERCEL_TOKEN is not set");
}

export const deployer = new VercelDeployer({
  teamId: process.env.VERCEL_TEAM_ID,
  projectName: process.env.VERCEL_PROJECT_NAME,
  token: process.env.VERCEL_TOKEN,
});

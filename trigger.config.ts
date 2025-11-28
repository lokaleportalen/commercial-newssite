import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_wtrwvgkepmkszqbtjofk",
  runtime: "node",
  logLevel: "info",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600, // 1 hour for long AI operations
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./trigger"], // Next.js convention
});

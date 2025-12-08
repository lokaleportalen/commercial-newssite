import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database/db";
import { sendWelcomeEmail, sendPasswordReset } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset({
        to: user.email,
        userName: user.name,
        resetUrl: url,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sendWelcomeEmail({
              to: user.email,
              userName: user.name,
              userId: user.id,
            });
            console.log(`Welcome email sent to ${user.email}`);
          } catch (error) {
            console.error("Failed to send welcome email:", error);
          }
        },
      },
    },
  },
});

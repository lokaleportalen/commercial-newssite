import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database/db";
import { sendEmail } from "./email";
import { getWelcomeEmail } from "./email-templates";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Send welcome email after user is created
          if (user.email && user.name) {
            sendEmail({
              to: user.email,
              ...getWelcomeEmail({
                userName: user.name,
                userEmail: user.email,
              }),
            }).catch((error) => {
              console.error("Failed to send welcome email:", error);
            });
          }
        },
      },
    },
  },
});

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
    // Custom email sender for password reset
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendPasswordReset({
          to: user.email,
          userName: user.name,
          resetUrl: url,
          expirationMinutes: 60,
        });
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
      }
    },
  },
  // Hooks for user events
  hooks: {
    after: [
      {
        // Send welcome email after user is created
        matcher: (context) => context.path === "/sign-up/email",
        handler: async (context) => {
          if (context.user && context.returned) {
            try {
              await sendWelcomeEmail({
                to: context.user.email,
                userName: context.user.name,
                userId: context.user.id,
              });
              console.log(
                `Welcome email sent to ${context.user.email} (${context.user.id})`
              );
            } catch (error) {
              // Don't fail the signup if email fails
              console.error("Failed to send welcome email:", error);
            }
          }
        },
      },
    ],
  },
});

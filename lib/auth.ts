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
  hooks: {
    after: [
      {
        matcher: (context) => {
          return context.path === "/sign-up/email" && context.method === "POST";
        },
        handler: async (context) => {
          const user = context.context?.returnedData as {
            user?: { email: string; name: string };
          };

          if (user?.user?.email && user?.user?.name) {
            // Send welcome email asynchronously
            sendEmail({
              to: user.user.email,
              ...getWelcomeEmail({
                userName: user.user.name,
                userEmail: user.user.email,
              }),
            }).catch((error) => {
              console.error("Failed to send welcome email:", error);
            });
          }
        },
      },
    ],
  },
});

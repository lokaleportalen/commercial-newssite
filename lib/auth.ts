import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { db } from "@/database/db";
import { role } from "@/database/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail, sendPasswordReset } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  trustedOrigins: [
    "https://estatenews.dk",
    "https://www.estatenews.dk",
  ],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Use void to prevent timing attacks (as per Better-Auth docs)
      void sendPasswordReset({
        to: user.email,
        userId: user.id,
        userName: user.name,
        resetUrl: url,
      });
    },
  },
  plugins: [
    customSession(async ({ session, user }) => {
      // Fetch user role from database
      const userRole = await db
        .select()
        .from(role)
        .where(eq(role.userId, session.userId))
        .limit(1);

      return {
        user,
        session,
        role: userRole.length > 0 ? userRole[0].role : "user",
      };
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create role entry for new user
          try {
            await db.insert(role).values({
              id: `role_${user.id}`,
              userId: user.id,
              role: "user",
            });
            console.log(`Role entry created for user ${user.id}`);
          } catch (error) {
            console.error("Failed to create role entry:", error);
          }

          // Send welcome email
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

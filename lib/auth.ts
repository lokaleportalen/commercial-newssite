import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database/db";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true to require verification before login
    sendResetPassword: async ({ user, url, token }) => {
      // Send password reset email
      const name = user.name || user.email.split("@")[0];
      await sendPasswordResetEmail(user.email, name, token);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // Send welcome email with verification link
      const name = user.name || user.email.split("@")[0];
      await sendWelcomeEmail(user.email, name, token);
    },
    sendOnSignUp: true, // Automatically send verification email on signup
  },
});

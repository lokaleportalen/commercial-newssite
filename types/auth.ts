import type { Session, User } from "better-auth/types";

/**
 * Extended session type that includes custom fields from customSession plugin
 * This is needed because auth.$Infer.Session doesn't properly infer custom fields
 * See: https://github.com/better-auth/better-auth/issues/4875
 */
export interface ExtendedSession extends Session {
  user: User;
  role: string;
}

/**
 * Client-side session data type from useSession hook
 */
export interface ClientSessionData {
  user: User;
  session: Session;
  role: string;
}

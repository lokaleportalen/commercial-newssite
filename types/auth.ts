import type { Session, User } from "better-auth/types";

export interface ExtendedSession extends Session {
  user: User;
  role: string;
}

export interface ClientSessionData {
  user: User;
  session: Session;
  role: string;
}

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    /** Google OAuth access token (used to call Google APIs) */
    access_token?: string;
  }

  interface Account {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }
}

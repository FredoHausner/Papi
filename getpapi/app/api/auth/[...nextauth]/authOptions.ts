import {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent", // force new grant after scope change
          include_granted_scopes: "false", // don't silently keep old scopes
          scope: [
            "openid",
            "email",
            "profile",
            // list ALL Drive files' metadata (needed to see all Docs in Drive)
            "https://www.googleapis.com/auth/drive.metadata.readonly",
            // read Google Docs content (safe read-only)
            "https://www.googleapis.com/auth/documents.readonly",
            // keep if you CREATE/APPEND to Docs via API
            "https://www.googleapis.com/auth/documents",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({token, account}) {
      if (account) {
        const a = account as unknown as {
          access_token?: string;
          refresh_token?: string;
          expires_at?: number;
        };
        token.access_token = a.access_token;
        token.refresh_token = a.refresh_token;
        token.expires_at = a.expires_at;
      }
      return token;
    },
    async session({session, token}) {
      (session as any).access_token = token.access_token;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

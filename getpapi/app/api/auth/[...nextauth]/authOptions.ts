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
          prompt: "consent",
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents",
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

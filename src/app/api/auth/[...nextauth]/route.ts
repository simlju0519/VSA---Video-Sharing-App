import NextAuth, { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "azure-ad",
      name: "Microsoft",
      type: "oauth",
      wellKnown: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid profile email" } },
      profile(profile) {
        return { id: profile.sub, name: profile.name, email: profile.email };
      },
    },
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

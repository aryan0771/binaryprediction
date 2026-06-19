import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);
        
        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;
        
        const user = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordsMatch) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        return null;
      }
    })
  ],
});

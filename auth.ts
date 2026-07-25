import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
  strategy: "jwt",
},

  providers: [
  Credentials({
    credentials: {
      email: {
        label: "E-mail",
        type: "email",
      },
      password: {
        label: "Mot de passe",
        type: "password",
      },
    },

    async authorize(credentials) {
      const email = credentials?.email;
      const password = credentials?.password;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (!user || !user.passwordHash || !user.active) {
        return null;
      }

      const passwordIsValid = await compare(
        password,
        user.passwordHash,
      );

      if (!passwordIsValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  }),
],
});
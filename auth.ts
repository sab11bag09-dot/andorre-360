import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginAttemptKeys, loginRateLimiter } from "@/lib/auth/loginRateLimit";

/** Trop d’échecs récents : la page de connexion affiche un message dédié. */
class TooManyLoginAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}

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

    async authorize(credentials, request) {
      const email = credentials?.email;
      const password = credentials?.password;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return null;
      }

      // Limite des tentatives : voir lib/auth/loginRateLimit.ts.
      const attemptKeys = loginAttemptKeys(email, request);
      if (loginRateLimiter.isBlocked(attemptKeys)) {
        throw new TooManyLoginAttempts();
      }

      const user = await prisma.user.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (!user || !user.passwordHash || !user.active) {
        loginRateLimiter.recordFailure(attemptKeys);
        return null;
      }

      const passwordIsValid = await compare(
        password,
        user.passwordHash,
      );

      if (!passwordIsValid) {
        loginRateLimiter.recordFailure(attemptKeys);
        return null;
      }

      loginRateLimiter.reset(attemptKeys.filter((key) => key.startsWith("email:")));

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  }),
],
});
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  clearLoginFailures,
  getClientAddress,
  isLoginAllowed,
  recordLoginFailure,
} from "@/lib/auth/loginRateLimit";

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
        console.warn("[auth.login]", JSON.stringify({
          event: "invalid_credentials_shape",
        }));
        return null;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const clientAddress = getClientAddress(request);
      const rateLimitKey = `${normalizedEmail}:${clientAddress}`;

      if (!isLoginAllowed(rateLimitKey)) {
        console.warn("[auth.login]", JSON.stringify({
          event: "rate_limited",
          email: normalizedEmail,
          clientAddress,
        }));
        return null;
      }

      const user = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (!user || !user.passwordHash || !user.active) {
        const result = recordLoginFailure(rateLimitKey);
        console.warn("[auth.login]", JSON.stringify({
          event: "login_failure",
          reason: "unknown_user_or_inactive",
          email: normalizedEmail,
          clientAddress,
          blocked: result.blocked,
        }));
        return null;
      }

      const passwordIsValid = await compare(
        password,
        user.passwordHash,
      );

      if (!passwordIsValid) {
        const result = recordLoginFailure(rateLimitKey);
        console.warn("[auth.login]", JSON.stringify({
          event: "login_failure",
          reason: "invalid_password",
          email: normalizedEmail,
          clientAddress,
          blocked: result.blocked,
        }));
        return null;
      }

      clearLoginFailures(rateLimitKey);
      console.info("[auth.login]", JSON.stringify({
        event: "login_success",
        userId: user.id,
        email: normalizedEmail,
        clientAddress,
      }));

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  }),
],
});
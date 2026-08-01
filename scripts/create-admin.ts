import "dotenv/config";
import { hash } from "bcryptjs";

import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME?.trim();
  const lastName = process.env.ADMIN_LAST_NAME?.trim();

  if (!email || !password || !firstName || !lastName) {
    throw new Error(
      "Variables manquantes : ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME et ADMIN_LAST_NAME.",
    );
  }

  if (password.length < 12) {
    throw new Error("Le mot de passe doit contenir au moins 12 caractères.");
  }

  const passwordHash = await hash(password, 12);
  const name = `${firstName} ${lastName}`;

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      firstName,
      lastName,
      name,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
    create: {
      firstName,
      lastName,
      name,
      email,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log(`Administrateur créé ou mis à jour : ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
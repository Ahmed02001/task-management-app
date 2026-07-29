import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/hash.util.js";

export async function registerUserService(name, email, password) {
  const isFound = await prisma.user.findUnique({ where: { email } });
  if (isFound) throw new Error("This email is already registered");

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return newUser;
}

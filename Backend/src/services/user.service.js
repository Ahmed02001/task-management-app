import { prisma } from "../config/prisma.js";
import AppError from "../utils/app.error.js";

export async function findUserByEmailService(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

import { prisma } from "../config/prisma.js";
import { comparePassword, hashPassword } from "../utils/hash.util.js";
import generateToken from "../utils/jwt.util.js";

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

export async function loginUserService(email, password) {
  const isEmailExist = await prisma.user.findUnique({ where: { email } });

  if (!isEmailExist) throw new Error("Invalid email or password");

  const isPasswordValid = await comparePassword(
    password,
    isEmailExist.password,
  );
  if (!isPasswordValid) throw new Error("Invalid email or password");

  const token = await generateToken({
    userId: isEmailExist.id,
    role: isEmailExist.role,
  });

  return {
    token,
    user: {
      id: isEmailExist.id,
      name: isEmailExist.name,
      email: isEmailExist.email,
    },
  };
}

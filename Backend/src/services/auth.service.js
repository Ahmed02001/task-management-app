import { prisma } from "../config/prisma.js";
import AppError from "../utils/app.error.js";
import { comparePassword, hashPassword } from "../utils/hash.util.js";
import generateToken from "../utils/jwt.util.js";

export async function registerUserService(name, email, password) {
  const isFound = await prisma.user.findUnique({ where: { email } });
  if (isFound) throw new AppError("This email is already registered", 409);

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

  if (!isEmailExist) throw new AppError("Invalid email or password", 401);

  const isPasswordValid = await comparePassword(
    password,
    isEmailExist.password,
  );
  if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

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

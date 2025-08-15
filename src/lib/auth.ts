import { prismaClient } from "./prismaClient";
import bcrypt from "bcryptjs";

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = data;

  const userExists = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });

  if (userExists) {
    throw new Error("El usuario ya existe");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

export const validatePassword = async (
  password: string,
  hashedPassword: string
) => {
  return bcrypt.compare(password, hashedPassword);
};

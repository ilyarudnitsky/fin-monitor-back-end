import { db } from "../db/index.js";

export const user = async (_, args, context) => {
  const user = await db.User.findUnique({
    where: { id: args.input.id },
  });

  return user;
};

export const userCollection = async (_, args, context) => {
  const users = await db.User.findMany({
    orderBy: { id: "asc" },
    ...(args.input.take != null ? { take: args.input.take } : {}),
    ...(args.input.skip != null ? { skip: args.input.skip } : {}),
  });

  return { items: users };
};

export const userCreate = async (_, args, context) => {
  const user = await db.User.create({
    data: args.input,
  });

  return user;
};

export const userUpdate = async (_, args, context) => {
  const { id, ...fields } = args.input;

  const data = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value != null),
  );

  if (Object.keys(data).length === 0) {
    throw new Error("userUpdate requires at least one field to update");
  }

  const user = await db.User.update({
    where: { id },
    data,
  });

  return user;
};

export const userDelete = async (_, args, context) => {
  const user = await db.User.delete({
    where: { id: args.input.id },
  });

  return user;
};

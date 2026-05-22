import { db } from "../db/index.js";
import { auth } from "../middleware/auth.js";
import { logging } from "../middleware/logging.js";
import { composeResolver } from "../middleware/compose.js";

export const user = composeResolver([
  auth,
  async (_, args) => {
    const user = await db.User.findUnique({
      where: { id: args.input.id },
    });

    return user;
  },
  logging,
]);

export const userCollection = composeResolver([
  auth,
  async (_, args) => {
    const users = await db.User.findMany({
      orderBy: { id: "asc" },
      ...(args.input.take != null ? { take: args.input.take } : {}),
      ...(args.input.skip != null ? { skip: args.input.skip } : {}),
    });

    return { items: users };
  },
  logging,
]);

export const userCreate = composeResolver([
  auth,
  async (_, args) => {
    const user = await db.User.create({
      data: args.input,
    });

    return user;
  },
  logging,
]);

export const userUpdate = composeResolver([
  auth,
  async (_, args) => {
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
  },
  logging,
]);

export const userDelete = composeResolver([
  auth,
  async (_, args) => {
    const user = await db.User.delete({
      where: { id: args.input.id },
    });

    return user;
  },
  logging,
]);

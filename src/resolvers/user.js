import { db } from "../db/index.js";

/*
 * Query
 */

export const user = async (...payload) => {
  const [, args] = payload;

  return db.User.findUnique({
    where: { id: args.input.id },
  });
};

export const userCollection = async (...payload) => {
  const [, args] = payload;

  return db.User.paginate({
    orderBy: { id: "asc" },
    ...args.input,
  });
};

/*
 * Mutations
 */

export const userCreate = async (...payload) => {
  const [, args] = payload;

  return db.User.create({
    data: args.input,
  });
};

export const userUpdate = async (...payload) => {
  const [, args] = payload;
  const { id, ...fields } = args.input;

  const data = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value != null),
  );

  if (Object.keys(data).length === 0) {
    throw new Error("userUpdate requires at least one field to update");
  }

  return db.User.update({
    where: { id },
    data,
  });
};

export const userDelete = async (...payload) => {
  const [, args] = payload;

  return db.User.delete({
    where: { id: args.input.id },
  });
};

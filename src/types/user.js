import {
  objectType,
  inputObjectType,
  queryField,
  mutationField,
  nonNull,
} from "nexus";
import * as resolvers from "../resolvers/user.js";

/*
 * Objects
 */

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("email");
    t.nonNull.string("name");
    t.string("firstName");
    t.string("lastName");
  },
});

export const UserCollection = objectType({
  name: "UserCollection",
  definition(t) {
    t.nonNull.list.nonNull.field("items", { type: "User" });
  },
});

/*
 * Inputs
 */

export const UserCollectionInput = inputObjectType({
  name: "UserCollectionInput",
  definition(t) {
    t.int("take");
    t.int("skip");
  },
});

export const UserCreateInput = inputObjectType({
  name: "UserCreateInput",
  definition(t) {
    t.nonNull.string("email");
    t.nonNull.string("name");
    t.string("firstName");
    t.string("lastName");
  },
});

export const UserUpdateInput = inputObjectType({
  name: "UserUpdateInput",
  definition(t) {
    t.nonNull.id("id");
    t.string("email");
    t.string("name");
    t.string("firstName");
    t.string("lastName");
  },
});

/*
 * Queries
 */

export const user = queryField("user", {
  type: "User",
  args: { input: nonNull("EntityInput") },
  resolve: resolvers.user,
});

export const userCollection = queryField("userCollection", {
  type: "UserCollection",
  args: { input: nonNull("UserCollectionInput") },
  resolve: resolvers.userCollection,
});

/*
 * Mutations
 */

export const userCreate = mutationField("userCreate", {
  type: "User",
  args: { input: nonNull("UserCreateInput") },
  resolve: resolvers.userCreate,
});

export const userUpdate = mutationField("userUpdate", {
  type: "User",
  args: { input: nonNull("UserUpdateInput") },
  resolve: resolvers.userUpdate,
});

export const userDelete = mutationField("userDelete", {
  type: "User",
  args: { input: nonNull("EntityInput") },
  resolve: resolvers.userDelete,
});

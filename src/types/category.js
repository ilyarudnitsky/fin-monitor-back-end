import {
  objectType,
  inputObjectType,
  queryField,
  mutationField,
  nonNull,
} from "nexus";
import { defineEntityCollectionByPageInput } from "./entity.js";
import * as resolvers from "../resolvers/index.js";

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.implements("Entity");
    t.string("label");
    t.string("title");
    t.field("stats", { type: "CategoryStats" });
  },
});

export const CategoryCollection = objectType({
  name: "CategoryCollection",
  definition(t) {
    t.implements("EntityCollectionByPage");
    t.list.field("items", { type: "Category" });
  },
});

export const CategoryCollectionInput = inputObjectType({
  name: "CategoryCollectionInput",
  definition(t) {
    defineEntityCollectionByPageInput(t);
  },
});

export const CategoryCreateInput = inputObjectType({
  name: "CategoryCreateInput",
  definition(t) {
    t.nonNull.string("title");
    t.nonNull.string("label");
  },
});

export const categoryCollection = queryField("categoryCollection", {
  type: "CategoryCollection",
  args: { input: nonNull("CategoryCollectionInput") },
  resolve: resolvers.categoryCollection,
});

export const categoryByTitle = queryField("categoryByTitle", {
  type: "Category",
  args: { title: nonNull("String") },
  resolve: resolvers.categoryByTitle,
});

export const categoryCreate = mutationField("categoryCreate", {
  type: "Category",
  args: { input: nonNull("CategoryCreateInput") },
  resolve: resolvers.categoryCreate,
});

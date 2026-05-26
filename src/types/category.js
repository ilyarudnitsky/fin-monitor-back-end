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
    t.nonNull.string("label");
    t.nonNull.string("title");
    t.nonNull.field("metrics", { type: "CategoryMetrics" });
  },
});

export const CategoryCollection = objectType({
  name: "CategoryCollection",
  definition(t) {
    t.implements("EntityCollectionByPage");
    t.nonNull.list.nonNull.field("items", { type: "Category" });
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

export const categoryCreate = mutationField("categoryCreate", {
  type: "Category",
  args: { input: nonNull("CategoryCreateInput") },
  resolve: resolvers.categoryCreate,
});

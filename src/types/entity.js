import {
  objectType,
  inputObjectType,
  interfaceType,
  enumType,
} from "nexus";

export const Entity = interfaceType({
  name: "Entity",
  resolveType: () => "Entity",
  definition(t) {
    t.uuid("id");

    t.dateTime("createdAt");
    t.dateTime("updatedAt");
  },
});

export const EntityId = objectType({
  name: "EntityId",
  definition(t) {
    t.uuid("id");
  },
});

export const EntityInput = inputObjectType({
  name: "EntityInput",
  definition(t) {
    t.nonNull.uuid("id");
  },
});

export const DateRangeInput = inputObjectType({
  name: "DateRangeInput",
  definition(t) {
    t.nonNull.dateTime("gte");
    t.nonNull.dateTime("lte");
  },
});

export const RangeInput = inputObjectType({
  name: "RangeInput",
  definition(t) {
    t.nonNull.string("gte");
    t.nonNull.string("lte");
  },
});

export const EntityCollectionFilterInput = inputObjectType({
  name: "EntityCollectionFilterInput",
  definition(t) {
    t.field("search", { type: "EntityCollectionFilterSearchInput" });
  },
});

export const EntityCollectionFilterSearchInput = inputObjectType({
  name: "EntityCollectionFilterSearchInput",
  definition(t) {
    t.nonNull.list.string("by");
    t.nonNull.string("query");
  },
});

/*
 * Entity Collection by Page types
 */

export const EntityCollectionByPage = interfaceType({
  name: "EntityCollectionByPage",
  resolveType: () => "EntityCollectionByPage",
  definition(t) {
    t.nonNull.field("meta", { type: "EntityCollectionByPageMeta" });
  },
});

export const EntityCollectionByPageMeta = objectType({
  name: "EntityCollectionByPageMeta",
  definition(t) {
    t.nonNull.int("page");
    t.nonNull.int("pages");
    defineEntityCollectionMeta(t);
  },
});

export const defineEntityCollectionByPageInput = (t) => {
  t.int("page");
  t.int("limit");
  t.field("sort", { type: "EntityCollectionSortInput" });
  t.field("filter", { type: "EntityCollectionFilterInput" });
};

/*
 * Entity Collection by Cursor types
 */

export const EntityCollectionMongoByCursor = interfaceType({
  name: "EntityCollectionMongoByCursor",
  resolveType: () => "EntityCollectionMongoByCursor",
  definition(t) {
    t.nonNull.field("meta", { type: "EntityCollectionMongoByCursorMeta" });
  },
});

export const EntityCollectionByCursor = interfaceType({
  name: "EntityCollectionByCursor",
  resolveType: () => "EntityCollectionByCursor",
  definition(t) {
    t.nonNull.field("meta", { type: "EntityCollectionByCursorMeta" });
  },
});

export const EntityCollectionByCursorMeta = objectType({
  name: "EntityCollectionByCursorMeta",
  definition(t) {
    t.float("cursor");
  },
});

export const EntityCollectionMongoByCursorMeta = objectType({
  name: "EntityCollectionMongoByCursorMeta",
  definition(t) {
    t.string("cursor");
    t.boolean("hasNext");
  },
});

export const defineEntityCollectionMongoByCursorInput = (t) => {
  t.string("cursor");
  t.int("limit");
  t.field("sort", { type: "EntityCollectionSortInput" });
  t.field("filter", { type: "EntityCollectionFilterInput" });
};

export const defineEntityCollectionByCursorInput = (t) => {
  t.float("cursor");
  t.int("limit");
  t.field("sort", { type: "EntityCollectionSortInput" });
  t.field("filter", { type: "EntityCollectionFilterInput" });
};

export const EntityCollectionSortInput = inputObjectType({
  name: "EntityCollectionSortInput",
  definition(t) {
    t.string("by");
    t.field("order", { type: "EntityCollectionSortOrder" });
  },
});

export const EntityCollectionSortOrder = enumType({
  name: "EntityCollectionSortOrder",
  members: ["asc", "desc"],
  description: "Sort order directions",
});

/*
 * Private
 */

function defineEntityCollectionMeta(t) {
  t.nonNull.int("total");
}

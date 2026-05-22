import { inputObjectType, nonNull } from "nexus";

export const EntityInput = inputObjectType({
  name: "EntityInput",
  definition(t) {
    t.nonNull.id("id");
  },
});

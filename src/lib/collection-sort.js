export function mapSortToOrderBy(
  sort,
  { defaultBy = "createdAt", defaultOrder = "desc" } = {},
) {
  const by = sort?.by ?? defaultBy;
  const order = sort?.order === "asc" ? "asc" : "desc";

  return { [by]: order };
}

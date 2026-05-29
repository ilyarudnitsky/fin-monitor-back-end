export function buildUpdateData(fields, errorMessage) {
  const data = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value != null),
  );

  if (Object.keys(data).length === 0) {
    throw new Error(errorMessage);
  }

  return data;
}

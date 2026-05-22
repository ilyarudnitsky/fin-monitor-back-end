export async function logging(parent, args, context, info, result) {
  console.log("[graphql]", {
    field: info?.fieldName,
    result,
  });

  return result;
}

logging.isMiddleware = true;

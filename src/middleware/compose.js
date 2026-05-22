export function composeResolver(layers) {
  if (layers.length === 0) {
    throw new Error("composeResolver requires at least one layer");
  }

  const handlerIndex = layers.findIndex((layer) => !layer.isMiddleware);

  if (handlerIndex === -1) {
    throw new Error("composeResolver requires a resolver handler");
  }

  const handler = layers[handlerIndex];
  const before = layers.slice(0, handlerIndex);
  const after = layers.slice(handlerIndex + 1);

  return async (parent, args, context, info) => {
    let next = () => handler(parent, args, context, info);

    for (let i = before.length - 1; i >= 0; i--) {
      const middleware = before[i];
      const inner = next;

      next = () => middleware(parent, args, context, info, inner);
    }

    let result = await next();

    for (const middleware of after) {
      result = await middleware(parent, args, context, info, result);
    }

    return result;
  };
}

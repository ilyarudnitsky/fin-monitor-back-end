export const STUB_AUTH_TOKEN = "stub-token";
export const STUB_AUTH_HEADER = `Bearer ${STUB_AUTH_TOKEN}`;

export const STUB_AUTH_USER = {
  id: "00000000-0000-4000-8000-000000000099",
  email: "stub@example.com",
  name: "Stub User",
};

function getHeader(context, name) {
  const headers = context?.headers ?? {};
  const key = Object.keys(headers).find(
    (header) => header.toLowerCase() === name.toLowerCase(),
  );

  return key ? headers[key] : undefined;
}

export function authenticateContext(context) {
  const authorization = getHeader(context, "authorization");

  if (authorization !== STUB_AUTH_HEADER) {
    throw new Error("Unauthorized");
  }

  context.auth = STUB_AUTH_USER;
}

import { STUB_AUTH_HEADER } from "../../src/middleware/auth.js";

export function createAuthContext(overrides = {}) {
  return {
    headers: {
      authorization: STUB_AUTH_HEADER,
      ...overrides.headers,
    },
    ...overrides,
  };
}

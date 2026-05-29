const DECIMAL_PATTERN = String.raw`(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)`;

function parseLeadingDecimal(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(
    new RegExp(`^(-?\\$?\\s*)(${DECIMAL_PATTERN})`),
  );

  if (!match) {
    return null;
  }

  const sign = match[1].includes("-") ? -1 : 1;
  const numericPart = match[2].replace(/,/g, "");
  const amount = sign * Number(numericPart);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return {
    amount,
    normalized: toCanonicalDecimal(amount),
    suffix: trimmed.slice(match[0].length).trim(),
  };
}

function toCanonicalDecimal(amount) {
  if (!Number.isFinite(amount)) {
    return null;
  }

  const absolute = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const [whole, fraction = ""] = absolute.toString().split(".");
  const trimmedFraction = fraction.replace(/0+$/, "");

  if (!trimmedFraction) {
    return `${sign}${whole}`;
  }

  return `${sign}${whole}.${trimmedFraction}`;
}

export function normalizeMoneyValue(value) {
  const parsed = parseLeadingDecimal(value);

  if (!parsed || parsed.suffix.length > 0) {
    return String(value ?? "").trim();
  }

  return parsed.normalized;
}

export function normalizeAmountWithUnitValue(value) {
  const parsed = parseLeadingDecimal(value);

  if (!parsed) {
    return String(value ?? "").trim();
  }

  if (!parsed.suffix) {
    return parsed.normalized;
  }

  return `${parsed.normalized} ${parsed.suffix}`;
}

export function normalizeQuantityValue(value) {
  const parsed = parseLeadingDecimal(value);

  if (!parsed || parsed.suffix.length > 0) {
    return String(value ?? "").trim();
  }

  return parsed.normalized;
}

export function parseStoredMoneyValue(value) {
  const parsed = parseLeadingDecimal(value);

  if (!parsed) {
    return 0;
  }

  if (parsed.suffix.length > 0) {
    return parsed.amount;
  }

  return parsed.amount;
}

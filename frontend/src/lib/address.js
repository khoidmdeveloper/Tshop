const EMPTY_SHIPPING_ADDRESS = {
  address: "",
  provinceId: "",
  provinceName: "",
  districtId: "",
  districtName: "",
  wardCode: "",
  wardName: "",
};

function toText(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
}

function toIdText(value) {
  const text = toText(value).trim();
  return text || "";
}

function toTrimmedNullableText(value) {
  const text = toText(value).trim();
  return text || null;
}

function toNullableInteger(value) {
  const text = toIdText(value);
  if (!text) {
    return null;
  }

  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeShippingAddress(payload = {}) {
  return {
    ...EMPTY_SHIPPING_ADDRESS,
    address: toText(payload.address).trim(),
    provinceId: toIdText(payload.provinceId),
    provinceName: toText(payload.provinceName ?? payload.city).trim(),
    districtId: toIdText(payload.districtId),
    districtName: toText(payload.districtName ?? payload.state).trim(),
    wardCode: toText(payload.wardCode).trim(),
    wardName: toText(payload.wardName).trim(),
  };
}

function buildShippingAddressPayload(address = {}) {
  const normalized = normalizeShippingAddress(address);

  return {
    address: toTrimmedNullableText(normalized.address),
    provinceId: toNullableInteger(normalized.provinceId),
    provinceName: toTrimmedNullableText(normalized.provinceName),
    districtId: toNullableInteger(normalized.districtId),
    districtName: toTrimmedNullableText(normalized.districtName),
    wardCode: toTrimmedNullableText(normalized.wardCode),
    wardName: toTrimmedNullableText(normalized.wardName),
    city: toTrimmedNullableText(normalized.provinceName),
    state: toTrimmedNullableText(normalized.districtName),
  };
}

function hasCompleteShippingAddress(address = {}) {
  const normalized = normalizeShippingAddress(address);
  return Boolean(
    normalized.address &&
      normalized.provinceId &&
      normalized.provinceName &&
      normalized.districtId &&
      normalized.districtName &&
      normalized.wardCode &&
      normalized.wardName
  );
}

function formatShippingAddress(address = {}) {
  const normalized = normalizeShippingAddress(address);
  return [
    normalized.address,
    normalized.wardName,
    normalized.districtName,
    normalized.provinceName,
  ]
    .filter(Boolean)
    .join(", ");
}

const addressSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "0.75rem",
    backgroundColor: state.isDisabled ? "rgba(12, 16, 24, 0.45)" : "rgba(12, 16, 24, 0.92)",
    borderColor: state.isFocused ? "hsl(var(--primary))" : "rgba(148, 163, 184, 0.24)",
    boxShadow: state.isFocused ? "0 0 0 1px hsl(var(--primary) / 0.45)" : "none",
    paddingInline: "0.2rem",
    transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
    "&:hover": {
      borderColor: "hsl(var(--primary) / 0.8)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingInline: "0.6rem",
    paddingBlock: "0.15rem",
  }),
  input: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  placeholder: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
  singleValue: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
    "&:hover": {
      color: "hsl(var(--primary))",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    "&:hover": {
      color: "hsl(var(--destructive))",
    },
  }),
  menu: (base) => ({
    ...base,
    marginTop: "0.4rem",
    borderRadius: "0.9rem",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    backgroundColor: "rgba(7, 10, 18, 0.98)",
    overflow: "hidden",
    boxShadow: "0 18px 48px rgba(2, 6, 23, 0.45)",
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    paddingBlock: "0.35rem",
  }),
  option: (base, state) => ({
    ...base,
    padding: "0.8rem 0.95rem",
    backgroundColor: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
        ? "rgba(14, 165, 233, 0.16)"
        : "transparent",
    color: state.isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
    cursor: "pointer",
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
  loadingMessage: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
};

function toSelectValue(value, label) {
  if (!value || !label) {
    return null;
  }

  return { value, label };
}

export {
  EMPTY_SHIPPING_ADDRESS,
  addressSelectStyles,
  buildShippingAddressPayload,
  formatShippingAddress,
  hasCompleteShippingAddress,
  normalizeShippingAddress,
  toSelectValue,
};

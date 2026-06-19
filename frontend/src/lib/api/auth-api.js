import { request } from "@/lib/api/http-client";

const AUTH_RESPONSE_FIELDS = {
  accessToken: ["access_token", "accessToken"],
  refreshToken: ["refresh_token", "refreshToken"],
  tokenType: ["token_type", "tokenType"],
  email: ["email"],
  fullName: ["full_name", "fullName"],
  phone: ["phone"],
  role: ["role"]
};

function readField(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return fallback;
}

function normalizeAuthResponse(payload) {
  const roleValue = String(readField(payload, AUTH_RESPONSE_FIELDS.role, "customer")).trim().toLowerCase();
  const role = roleValue === "admin" ? "admin" : "customer";

  return {
    accessToken: readField(payload, AUTH_RESPONSE_FIELDS.accessToken),
    refreshToken: readField(payload, AUTH_RESPONSE_FIELDS.refreshToken),
    tokenType: readField(payload, AUTH_RESPONSE_FIELDS.tokenType, "Bearer"),
    email: String(readField(payload, AUTH_RESPONSE_FIELDS.email)).trim().toLowerCase(),
    fullName: String(readField(payload, AUTH_RESPONSE_FIELDS.fullName)).trim(),
    phone: readField(payload, AUTH_RESPONSE_FIELDS.phone),
    role
  };
}

function splitFullName(fullName) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

function mapAuthPayloadToSession(data) {
  const auth = normalizeAuthResponse(data);
  const { firstName, lastName } = splitFullName(auth.fullName);

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    tokenType: auth.tokenType,
    user: {
      id: auth.email,
      email: auth.email,
      fullName: auth.fullName,
      firstName,
      lastName,
      phone: auth.phone,
      role: auth.role
    }
  };
}

async function loginApi({ email, password }) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: { email, password }
  });
  return mapAuthPayloadToSession(data);
}

async function registerApi({ firstName, lastName, email, password, phone }) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const data = await request("/api/auth/register", {
    method: "POST",
    body: {
      email,
      password,
      fullName,
      phone
    }
  });

  return mapAuthPayloadToSession(data);
}

async function refreshTokenApi(refreshToken) {
  const data = await request("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken }
  });
  return mapAuthPayloadToSession(data);
}

async function logoutApi(refreshToken) {
  await request("/api/auth/logout", {
    method: "POST",
    body: { refreshToken }
  });
}

async function getCustomersApi() {
  return await request("/api/admin/customers", {
    method: "GET",
    auth: true
  });
}

export { loginApi, logoutApi, registerApi, refreshTokenApi, getCustomersApi };

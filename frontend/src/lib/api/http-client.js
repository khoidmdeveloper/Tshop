const DEFAULT_API_BASE_URL = "http://localhost:8080";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

let authSession = {
  getAccessToken: () => "",
  refreshAccessToken: null,
  onAuthFailure: null
};

let refreshInFlight = null;
let authFailureNotified = false;

function configureAuthSession(config = {}) {
  authSession = {
    ...authSession,
    ...config
  };
}

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeToken(token) {
  if (typeof token !== "string") {
    return "";
  }
  return token.trim();
}

function createApiError(response, payload) {
  const message = payload?.message || payload?.error || `Request failed with status ${response.status}`;
  return new ApiError(message, response.status, payload);
}

function unwrapPayload(response, payload) {
  if (payload && typeof payload.success === "boolean") {
    if (!payload.success) {
      throw new ApiError(payload.message || "Request failed", response.status, payload);
    }
    return payload.data;
  }
  return payload;
}

async function fetchWithPayload(path, { method, body, headers, token }) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  const payload = await parseJsonSafely(response);
  return { response, payload };
}

function notifyAuthFailure() {
  if (authFailureNotified) {
    return;
  }
  authFailureNotified = true;
  try {
    authSession.onAuthFailure?.();
  } finally {
    setTimeout(() => {
      authFailureNotified = false;
    }, 0);
  }
}

async function refreshAccessTokenOnce() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  if (typeof authSession.refreshAccessToken !== "function") {
    throw new ApiError("Session expired. Please sign in again.", 401, null);
  }

  refreshInFlight = (async () => {
    const refreshResult = await authSession.refreshAccessToken();
    if (!refreshResult?.ok) {
      throw new ApiError(refreshResult?.message || "Session expired. Please sign in again.", 401, refreshResult);
    }

    const nextAccessToken = normalizeToken(authSession.getAccessToken?.());
    if (!nextAccessToken) {
      throw new ApiError("Session expired. Please sign in again.", 401, refreshResult);
    }
    return nextAccessToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function request(path, options = {}) {
  const { method = "GET", body, headers = {}, token, auth = false, _retryAfterRefresh = false } = options;
  const resolvedToken = normalizeToken(token) || (auth ? normalizeToken(authSession.getAccessToken?.()) : "");

  const { response, payload } = await fetchWithPayload(path, {
    method,
    body,
    headers,
    token: resolvedToken
  });

  if (response.ok) {
    return unwrapPayload(response, payload);
  }

  const isUnauthorized = response.status === 401;
  const shouldTryRefresh = isUnauthorized && !_retryAfterRefresh && (auth || Boolean(resolvedToken));

  if (shouldTryRefresh) {
    try {
      const nextAccessToken = await refreshAccessTokenOnce();
      return request(path, {
        ...options,
        token: nextAccessToken,
        auth: false,
        _retryAfterRefresh: true
      });
    } catch (refreshError) {
      notifyAuthFailure();
      if (refreshError instanceof ApiError) {
        throw refreshError;
      }
      throw new ApiError(refreshError?.message || "Session expired. Please sign in again.", 401, refreshError);
    }
  }

  throw createApiError(response, payload);
}

export { API_BASE_URL, ApiError, configureAuthSession, request };

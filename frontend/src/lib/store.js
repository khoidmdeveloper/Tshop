import { create } from "zustand";
import { loginApi, logoutApi, refreshTokenApi, registerApi } from "@/lib/api/auth-api";
import { configureAuthSession } from "@/lib/api/http-client";
import { getCartApi, addToCartApi, updateCartItemApi, removeCartItemApi, clearCartApi } from "@/lib/api/cart-api";

const AUTH_STORAGE_KEY = "tshop.auth.session";

function normalizeStoredUser(user) {
  if (!user) {
    return null;
  }

  const roleValue = String(user.role || "customer").trim().toLowerCase();
  const role = roleValue === "admin" ? "admin" : "customer";

  return {
    ...user,
    role
  };
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawData = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawData) {
      return null;
    }
    const parsedData = JSON.parse(rawData);
    if (!parsedData?.currentUser || !parsedData?.accessToken) {
      return null;
    }
    return {
      ...parsedData,
      currentUser: normalizeStoredUser(parsedData.currentUser)
    };
  } catch {
    return null;
  }
}

function saveStoredSession(currentUser, accessToken, refreshToken) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      currentUser: normalizeStoredUser(currentUser),
      accessToken,
      refreshToken
    })
  );
}

function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function clearAuthState(set) {
  clearStoredSession();
  set({
    currentUser: null,
    accessToken: "",
    refreshToken: ""
  });
}

function redirectToLoginPage() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname.startsWith("/auth/login")) {
    return;
  }

  window.location.assign("/auth/login");
}

function parsePrice(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function normalizeCartPayload(productOrId, fallbackPrice) {
  if (typeof productOrId === "object" && productOrId !== null) {
    const productId = String(productOrId.productId ?? productOrId.id ?? "").trim();
    return {
      productId,
      name: String(productOrId.name || "").trim(),
      thumbnail: String(productOrId.thumbnail || "").trim(),
      price: parsePrice(productOrId.price)
    };
  }

  return {
    productId: String(productOrId || "").trim(),
    name: "",
    thumbnail: "",
    price: parsePrice(fallbackPrice)
  };
}

const useCartStore = create((set, get) => ({
  cartItems: [],
  isLoadingCart: false,

  loadCart: async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    set({ isLoadingCart: true });
    try {
      const data = await getCartApi();
      let items = Array.isArray(data) ? data : (data?.items || data?.content || data?.data || []);
      
      // Normalize backend CartItemResponse fields -> local cart fields
      items = items.map(item => ({
        ...item,
        name: item.name || item.productName,
        thumbnail: item.thumbnail || item.productThumbnail,
        price: item.price !== undefined ? item.price : item.productPrice,
      }));

      set({ cartItems: items });
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      set({ isLoadingCart: false });
    }
  },

  addToCart: async (productOrId, quantity = 1, fallbackPrice) => {
    const payload = normalizeCartPayload(productOrId, fallbackPrice);
    if (!payload.productId) return;

    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const token = useAuthStore.getState().accessToken;

    if (token) {
      try {
        await addToCartApi(payload.productId, safeQuantity);
        await get().loadCart();
      } catch (error) {
        console.error("Failed to add to cart API", error);
      }
      return;
    }

    set((state) => {
      const existing = state.cartItems.find((item) => item.productId === payload.productId);
      if (existing) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.productId === payload.productId
              ? {
                  ...item,
                  quantity: item.quantity + safeQuantity,
                  name: payload.name || item.name,
                  thumbnail: payload.thumbnail || item.thumbnail,
                  price: payload.price || item.price
                }
              : item
          )
        };
      }
      return {
        cartItems: [
          ...state.cartItems,
          {
            productId: payload.productId,
            quantity: safeQuantity,
            price: payload.price,
            name: payload.name,
            thumbnail: payload.thumbnail
          }
        ]
      };
    });
  },

  removeFromCart: async (productId) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      try {
        const item = get().cartItems.find((i) => i.productId === productId);
        if (item?.id) {
          // If the item has a backend `id`
          await removeCartItemApi(item.id);
        } else {
          // Fallback if missing id
          await removeCartItemApi(productId);
        }
        await get().loadCart();
      } catch (error) {
        console.error("Failed to remove from cart API", error);
      }
      return;
    }

    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.productId !== productId)
    }));
  },

  updateQuantity: async (productId, quantity) => {
    const token = useAuthStore.getState().accessToken;
    const safeQuantity = Math.max(1, quantity);

    if (token) {
      try {
        const item = get().cartItems.find((i) => i.productId === productId);
        if (item?.id) {
          await updateCartItemApi(item.id, safeQuantity);
        } else {
          await updateCartItemApi(productId, safeQuantity);
        }
        await get().loadCart();
      } catch (error) {
        console.error("Failed to update cart API", error);
      }
      return;
    }

    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQuantity } : item
      )
    }));
  },

  clearCart: async () => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      try {
        await clearCartApi();
        set({ cartItems: [] });
      } catch (error) {
        console.error("Failed to clear cart API", error);
      }
      return;
    }

    set({ cartItems: [] });
  },

  getCartTotal: () => {
    const state = get();
    const items = Array.isArray(state.cartItems) ? state.cartItems : [];
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}));

const initialSession = readStoredSession();

const useAuthStore = create((set, get) => ({
  currentUser: initialSession?.currentUser || null,
  accessToken: initialSession?.accessToken || "",
  refreshToken: initialSession?.refreshToken || "",
  clearAuth: () => {
    clearAuthState(set);
  },

  login: async (email, password) => {
    try {
      const session = await loginApi({
        email: email.trim().toLowerCase(),
        password
      });
      set({
        currentUser: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      });
      saveStoredSession(session.user, session.accessToken, session.refreshToken);
      await useCartStore.getState().loadCart(); // Load server cart after login
      return { ok: true, user: session.user };
    } catch (error) {
      return { ok: false, message: error?.message || "Login failed." };
    }
  },

  signup: async ({ firstName, lastName, email, password, phone }) => {
    try {
      const session = await registerApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: (phone || "").trim()
      });
      set({
        currentUser: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      });
      saveStoredSession(session.user, session.accessToken, session.refreshToken);
      useCartStore.getState().clearCart(); // Start fresh after sign-up
      return { ok: true, user: session.user };
    } catch (error) {
      return { ok: false, message: error?.message || "Sign up failed." };
    }
  },

  refreshAccessToken: async () => {
    const currentRefreshToken = get().refreshToken;
    if (!currentRefreshToken) {
      return { ok: false, message: "No refresh token available." };
    }

    try {
      const session = await refreshTokenApi(currentRefreshToken);
      set({
        currentUser: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      });
      saveStoredSession(session.user, session.accessToken, session.refreshToken);
      return { ok: true, user: session.user };
    } catch (error) {
      clearAuthState(set);
      return { ok: false, message: error?.message || "Session expired." };
    }
  },

  logout: async () => {
    const currentRefreshToken = get().refreshToken;
    try {
      if (currentRefreshToken) {
        await logoutApi(currentRefreshToken);
      }
    } finally {
      clearAuthState(set);
      useCartStore.getState().clearCart(); // Clear cart state locally
    }
  },

  updateCurrentUserProfile: (profile) => {
    const state = get();
    if (!state.currentUser) {
      return;
    }

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    const updatedUser = {
      ...state.currentUser,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName,
      phone: profile.phone
    };

    set({ currentUser: updatedUser });
    saveStoredSession(updatedUser, state.accessToken, state.refreshToken);
  }
}));

configureAuthSession({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: () => useAuthStore.getState().refreshAccessToken(),
  onAuthFailure: () => {
    useAuthStore.getState().clearAuth();
    redirectToLoginPage();
  }
});

const useStore = useCartStore;

// Auto-load cart if we booted with a session
if (typeof window !== "undefined" && useAuthStore.getState().accessToken) {
  setTimeout(() => {
    useCartStore.getState().loadCart();
  }, 0);
}

export { useAuthStore, useCartStore, useStore };

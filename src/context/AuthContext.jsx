/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiRequest,
  getAccessToken,
  saveAccessToken,
  clearAccessToken,
} from "../api/api.js";

const AuthContext = createContext(null);

// Normalize email addresses before sending them to the backend.
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Handle different possible user response structures.
function getUserFromResponse(data) {
  return (
    data?.user ??
    data?.data?.user ??
    data?.data ??
    (data?.id || data?.email ? data : null)
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the currently authenticated user.
  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return null;
    }

    try {
      const data = await apiRequest("/users/me");

      const currentUser = getUserFromResponse(data);

      if (!currentUser) {
        throw new Error(
          "Unable to retrieve your account details."
        );
      }

      setUser(currentUser);

      return currentUser;
    } catch {
      clearAccessToken();
      setUser(null);

      return null;
    }
  }, []);

  // Restore the login session when the application loads.
  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        // No token means there is no saved login session.
        if (!getAccessToken()) {
          if (active) {
            setUser(null);
          }

          return;
        }

        // Retrieve the authenticated user's profile.
        const data = await apiRequest("/users/me");

        const currentUser = getUserFromResponse(data);

        if (!currentUser) {
          throw new Error(
            "Unable to retrieve your account details."
          );
        }

        if (active) {
          setUser(currentUser);
        }
      } catch {
        clearAccessToken();

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  // LOGIN
  const login = useCallback(async (credentials) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: normalizeEmail(credentials.email),
        password: credentials.password,
      }),
    });

    // Retrieve the access token from the backend response.
    const token =
      data?.access_token ??
      data?.data?.access_token;

    if (!token) {
      throw new Error(
        "Login succeeded, but the backend did not return an access token."
      );
    }

    // Save the token according to the Remember Me checkbox.
    // Checked   = localStorage
    // Unchecked = sessionStorage
    saveAccessToken(
      token,
      credentials.remember === true
    );

    try {
      // Retrieve the logged-in user's profile.
      const me = await apiRequest("/users/me");

      const currentUser = getUserFromResponse(me);

      if (!currentUser) {
        throw new Error(
          "Authentication succeeded, but the current user could not be loaded."
        );
      }

      setUser(currentUser);

      return {
        ...data,
        user: currentUser,
      };
    } catch (error) {
      clearAccessToken();
      setUser(null);

      throw error;
    }
  }, []);

  // SIGNUP
  const signup = useCallback(async (formData) => {
    const payload = {
      first_name: String(
        formData.firstName || ""
      ).trim(),

      last_name: String(
        formData.lastName || ""
      ).trim(),

      phone_number: String(
        formData.phone || ""
      ).trim(),

      email: normalizeEmail(formData.email),

      address: String(
        formData.address || ""
      ).trim(),

      state: String(
        formData.state || ""
      ).trim(),

      password: formData.password,

      confirm_password: formData.confirmPassword,

      terms_accepted:
        formData.termsAccepted === true ||
        formData.agreeToTerms === true,
    };

    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    let currentUser = getUserFromResponse(data);

    // Only attempt to retrieve the profile if a token exists.
    if (!currentUser && getAccessToken()) {
      try {
        const me = await apiRequest("/users/me");

        currentUser = getUserFromResponse(me);
      } catch {
        currentUser = null;
      }
    }

    if (currentUser) {
      setUser(currentUser);
    }

    return {
      ...data,
      user: currentUser,
    };
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      // Remove the token from both storage locations.
      clearAccessToken();

      setUser(null);
    }
  }, []);

  // Values and functions available throughout the application.
  const value = {
    user,
    isLoggedIn: Boolean(user),
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing authentication.
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}

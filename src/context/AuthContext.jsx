
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiRequest } from "../api/api.js";
import { approvedUsers } from "../auth/approvedUsers.js";

const AuthContext = createContext(null);

const MOCK_AUTH_KEY = "civicintel_test_users";
const MOCK_SESSION_KEY = "civicintel_test_session";

const useMockAuth =
  import.meta.env.VITE_USE_MOCK_AUTH === "true";

// Normalize email addresses consistently.
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Find an email on the approved testers list.
function findApprovedUser(email) {
  const normalizedEmail = normalizeEmail(email);

  return approvedUsers.find(
    (item) => normalizeEmail(item.email) === normalizedEmail
  );
}

// Never expose stored passwords through the auth context.
function sanitizeUser(user, approvedUser) {
  if (!user || !approvedUser) return null;

  const { password, ...safeUser } = user;

  return {
    ...safeUser,
    email: normalizeEmail(safeUser.email),
    role: approvedUser.role,
  };
}

// Read mock users safely.
function getStoredUsers() {
  try {
    const stored = localStorage.getItem(MOCK_AUTH_KEY);
    const users = JSON.parse(stored || "[]");

    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

// Read the mock session safely.
function getStoredSession() {
  try {
    return JSON.parse(
      localStorage.getItem(MOCK_SESSION_KEY) || "null"
    );
  } catch {
    return null;
  }
}

// Load the current user WITHOUT updating React state.
// This function can safely be awaited during initialization.
async function loadCurrentUser() {
  if (useMockAuth) {
    const session = getStoredSession();
    const users = getStoredUsers();

    const storedUser = session
      ? users.find((item) => item.id === session.userId)
      : null;

    const approvedUser = storedUser
      ? findApprovedUser(storedUser.email)
      : null;

    // Remove sessions belonging to invalid or unapproved users.
    if (!storedUser || !approvedUser) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      return null;
    }

    return sanitizeUser(storedUser, approvedUser);
  }

  // Production/backend authentication.
  try {
    const data = await apiRequest("/auth/me");

    return (
      data?.user ??
      (data?.id || data?.email ? data : null)
    );
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication asynchronously.
  // State updates happen after the current user has been loaded.
  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        const currentUser = await loadCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch {
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

  // Refresh authentication after login, signup, or other changes.
  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const currentUser = await loadCurrentUser();

      setUser(currentUser);

      return currentUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Log in an approved user.
  const login = async (credentials) => {
    if (useMockAuth) {
      const email = normalizeEmail(credentials.email);
      const password = String(credentials.password || "");

      const approvedUser = findApprovedUser(email);

      if (!approvedUser) {
        throw new Error(
          "This email is not approved for Civic Intel testing. Please contact the project administrator."
        );
      }

      const users = getStoredUsers();

      const foundUser = users.find(
        (item) => normalizeEmail(item.email) === email
      );

      if (
        !foundUser ||
        foundUser.password !== password
      ) {
        throw new Error(
          "Incorrect email address or password."
        );
      }

      const safeUser = sanitizeUser(
        foundUser,
        approvedUser
      );

      localStorage.setItem(
        MOCK_SESSION_KEY,
        JSON.stringify({ userId: foundUser.id })
      );

      setUser(safeUser);

      return { user: safeUser };
    }

    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (data?.user) {
      setUser(data.user);
      return data;
    }

    const currentUser = await refreshUser();

    if (!currentUser) {
      throw new Error(
        "Login did not establish an authenticated session."
      );
    }

    return data;
  };

  // Register an approved user.
  const signup = async (formData) => {
    if (useMockAuth) {
      const email = normalizeEmail(formData.email);
      const password = String(formData.password || "");

      const approvedUser = findApprovedUser(email);

      if (!approvedUser) {
        throw new Error(
          "Your email is not approved for Civic Intel testing. Please contact the project administrator."
        );
      }

      if (!password) {
        throw new Error("Please enter a password.");
      }

      const users = getStoredUsers();

      if (
        users.some(
          (item) => normalizeEmail(item.email) === email
        )
      ) {
        throw new Error(
          "An account with this email already exists. Please log in instead."
        );
      }

      const newUser = {
        id: crypto.randomUUID(),
        firstName: String(formData.firstName || "").trim(),
        lastName: String(formData.lastName || "").trim(),
        phone: String(formData.phone || "").trim(),
        email,
        address: String(formData.address || "").trim(),
        state: String(formData.state || ""),
        role: approvedUser.role,
      };

      // Mock mode only. Never store plaintext passwords in production.
      const savedUser = {
        ...newUser,
        password,
      };

      localStorage.setItem(
        MOCK_AUTH_KEY,
        JSON.stringify([...users, savedUser])
      );

      localStorage.setItem(
        MOCK_SESSION_KEY,
        JSON.stringify({ userId: newUser.id })
      );

      const safeUser = sanitizeUser(
        newUser,
        approvedUser
      );

      setUser(safeUser);

      return { user: safeUser };
    }

    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    let currentUser = data?.user ?? null;

    if (currentUser) {
      setUser(currentUser);
    } else {
      currentUser = await refreshUser();
    }

    return { ...data, user: currentUser };
  };

  // Log out the current user.
  const logout = async () => {
    if (useMockAuth) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      setUser(null);
      return;
    }

    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
    }
  };

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

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}


import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiRequest } from "../api/api.js";

const AuthContext = createContext(null);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getUserFromResponse(data) {
  return data?.user ?? data?.data?.user ?? null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiRequest("/users/me");;
      const currentUser =
        getUserFromResponse(data) ??
        data?.data ??
        (data?.id || data?.email ? data : null);

      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        const data = await apiRequest("/users/me");;

        const currentUser =
          getUserFromResponse(data) ??
          data?.data ??
          (data?.id || data?.email ? data : null);

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

  
  const login = useCallback(async (credentials) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: normalizeEmail(credentials.email),
        password: credentials.password,
      }),
    });

    const token =
      data?.access_token ??
      data?.data?.access_token;

    if (!token) {
      throw new Error(
        "Login succeeded, but the backend did not return an access token."
      );
    }

    // Save the token before requesting the current user.
    localStorage.setItem("civicintel_access_token", token);

    try {
      const me = await apiRequest("/users/me");

      const currentUser =
        getUserFromResponse(me) ??
        me?.data?.user ??
        me?.data ??
        (me?.id || me?.email ? me : null);

      if (!currentUser) {
        throw new Error(
          "Authentication succeeded, but the current user could not be loaded."
        );
      }

      setUser(currentUser);

      return { ...data, user: currentUser };
    } catch (error) {
      localStorage.removeItem("civicintel_access_token");
      setUser(null);
      throw error;
    }
  }, []);


  
  const signup = useCallback(async (formData) => {
  const payload = {
    first_name: String(formData.firstName || "").trim(),
    last_name: String(formData.lastName || "").trim(),
    phone_number: String(formData.phone || "").trim(),
    email: normalizeEmail(formData.email),
    address: String(formData.address || "").trim(),
    state: String(formData.state || "").trim(),
    password: formData.password,
    confirm_password: formData.confirmPassword,
    terms_accepted: formData.termsAccepted === true,
  };

  const data = await apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  let currentUser = getUserFromResponse(data);

  if (!currentUser) {
    try {
      const me = await apiRequest("/users/me");;

      currentUser =
        getUserFromResponse(me) ??
        me?.data ??
        (me?.id || me?.email ? me : null);
    } catch {
      currentUser = null;
    }
  }

  if (currentUser) {
    setUser(currentUser);
  }

  return { ...data, user: currentUser };
}, []);


  
  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      localStorage.removeItem("civicintel_access_token");
      setUser(null);
    }
  }, []);


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

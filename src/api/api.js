
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-production-91cb.up.railway.app/api/v1"
).replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const token = localStorage.getItem("civicintel_access_token");

  const headers = {
    Accept: "application/json",
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${normalizedPath}`,
      {
        ...options,
        credentials: "include",
        headers,
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to CivicIntel's backend. Check your internet connection or try again later."
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else if (response.status !== 204) {
    const text = await response.text().catch(() => "");
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    const validationErrors = Array.isArray(data?.detail)
      ? data.detail
          .map((item) => item.msg || item.message)
          .filter(Boolean)
          .join(" ")
      : null;

    throw new Error(
      validationErrors ||
        data?.message ||
        data?.error ||
        data?.detail ||
        `Request failed (${response.status}). Please try again.`
    );
  }

  return data;
}

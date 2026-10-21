
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const response = await fetch(
    `${API_BASE_URL}${normalizedPath}`,
    {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : options.body
            ? { "Content-Type": "application/json" }
            : {}),
        ...options.headers,
      },
    }
  );

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

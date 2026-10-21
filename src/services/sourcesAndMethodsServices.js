
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function getSourcesAndMethods() {
  const response = await fetch(
    `${API_BASE_URL}/api/sources-and-methods`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load sources and methods: ${response.status}`
    );
  }

  return response.json();
}

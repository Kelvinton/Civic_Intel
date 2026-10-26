
import { apiRequest } from "./api";

export async function getStates() {
  const data = await apiRequest("/states");

  // Temporary debugging: inspect the exact response from the backend.
  console.log("States API response:", data);
  console.log("Is response an array?", Array.isArray(data));

  return data;
}

import { apiRequest } from "./api.js";

export function getStates() {
  return apiRequest("/states");
}
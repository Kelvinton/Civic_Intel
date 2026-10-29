
import { apiRequest } from "./api.js";

export function getStates() {
  return apiRequest("/states");
}

export function getIndicators() {
  return apiRequest("/indicators");
}

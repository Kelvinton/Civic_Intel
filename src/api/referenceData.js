
import { apiRequest } from "./api.js";

// Fetch comparison options:
// domains, indicators and states.
export function getCompareOptions() {
  return apiRequest("/compare/options");
}

// Fetch actual comparison results.
export function getComparison({
  indicator,
  states,
  fromYear,
  toYear,
}) {
  const params = new URLSearchParams();

  params.set("indicator", indicator);

  states.forEach((state) => {
    params.append("states", state);
  });

  if (fromYear) {
    params.set("year_from", String(fromYear));
  }

  if (toYear) {
    params.set("year_to", String(toYear));
  }

  return apiRequest(`/compare?${params.toString()}`);
}

// Keep these in case other components use them.
export function getStates() {
  return apiRequest("/states");
}

export function getIndicators() {
  return apiRequest("/indicators");
}

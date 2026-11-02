import { apiRequest } from "./api.js";

export function getPublishedRecords({
  sector = "education",
  state,
  indicator,
  year,
  limit = 100,
  offset = 0,
} = {}) {
  const params = new URLSearchParams();

  params.set("sector", sector);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  if (state && state !== "all") {
    params.set("state", state);
  }

  if (indicator && indicator !== "all") {
    params.set("indicator", indicator);
  }

  if (year && year !== "all") {
    params.set("year", String(year));
  }

  return apiRequest(
    `/published/records?${params.toString()}`
  );
}
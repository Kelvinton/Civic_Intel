
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

export async function getAllPublishedRecords({
  sector = "education",
  state,
  indicator,
  year,
  limit = 100,
} = {}) {
  let allRecords = [];
  let offset = 0;
  let total = Infinity;

  while (allRecords.length < total) {
    const response = await getPublishedRecords({
      sector,
      state,
      indicator,
      year,
      limit,
      offset,
    });

    const items = response.items || [];

    allRecords = [...allRecords, ...items];

    total = response.total ?? allRecords.length;

    if (items.length === 0) break;

    offset += items.length;
  }

  return allRecords;
}

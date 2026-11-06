
import { apiRequest } from "./api.js";

// Fetch published media reports
export function getMedia({ limit = 100, offset = 0 } = {}) {
  const params = new URLSearchParams();

  params.set("limit", String(limit));
  params.set("offset", String(offset));

  return apiRequest(`/media?${params.toString()}`);
}

// Fetch available media categories, indicators and years
export function getMediaOptions() {
  return apiRequest("/media/options");
}

// Fetch featured media reports
export function getFeaturedMedia() {
  return apiRequest("/media/featured");
}

// Fetch one media report, including its full article content
export function getMediaById(mediaId) {
  return apiRequest(`/media/${encodeURIComponent(mediaId)}`);
}


import { apiRequest } from "./api.js";

const MEDIA_CACHE_KEY = "civicintel_media_cache";
const MEDIA_CACHE_LIMIT = 20;

// Track media requests currently being refreshed.
const mediaRequests = new Map();

// Notify components when cached media has been refreshed.
const mediaListeners = new Set();

export function subscribeToMedia(callback) {
  mediaListeners.add(callback);

  return () => {
    mediaListeners.delete(callback);
  };
}

// Read cached media reports from localStorage.
function getCachedMedia(cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const parsed = JSON.parse(cached);

    return parsed;
  } catch {
    return null;
  }
}

// Save media reports to localStorage.
function setCachedMedia(cacheKey, data) {
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Ignore storage errors and continue using the API.
  }
}

// Fetch published media reports with shared caching and live updates.
export async function getMedia({ limit = 100, offset = 0 } = {}) {
  const cacheKey = MEDIA_CACHE_KEY;

  const params = new URLSearchParams();
  params.set("limit", String(MEDIA_CACHE_LIMIT));
  params.set("offset", "0");

  const url = `/media?${params.toString()}`;

  const cached = getCachedMedia(cacheKey);

  // Return the requested portion of the shared article collection.
  function getRequestedMedia(data) {
    return {
      ...data,
      items: Array.isArray(data?.items)
        ? data.items.slice(offset, offset + limit)
        : [],
      limit,
      offset,
    };
  }

  // Fetch fresh articles and notify all subscribed pages.
  function refreshMedia() {
    if (mediaRequests.has(cacheKey)) {
      return mediaRequests.get(cacheKey);
    }

    const request = apiRequest(url)
      .then((data) => {
        setCachedMedia(cacheKey, data);

        mediaListeners.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.error("Media update listener failed:", error);
          }
        });

        return data;
      })
      .finally(() => {
        mediaRequests.delete(cacheKey);
      });

    mediaRequests.set(cacheKey, request);

    return request;
  }

  // Display cached articles immediately while checking for updates.
  if (cached) {
    refreshMedia().catch(() => {
      // Keep cached articles if refreshing fails.
    });

    return getRequestedMedia(cached.data);
  }

  // No cache exists, so fetch articles before displaying them.
  const freshData = await refreshMedia();

  return getRequestedMedia(freshData);
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

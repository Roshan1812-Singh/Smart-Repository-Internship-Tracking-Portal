// Central place for the backend origin so we never hardcode localhost again.
// In production set VITE_API_URL on Vercel to your Render backend URL.
const rawOrigin = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Strip any trailing slash to avoid `//api` style bugs.
export const API_ORIGIN = rawOrigin.replace(/\/+$/, "");

export const API_BASE = `${API_ORIGIN}/api`;

if (!import.meta.env.VITE_API_URL) {
  console.warn(
    "[config] VITE_API_URL not set; falling back to",
    API_ORIGIN,
    "- set it on Vercel for production."
  );
}

/**
 * Build a usable URL for an uploaded file.
 * - Absolute URLs (e.g. Cloudinary `https://...`) are returned as-is.
 * - Relative paths (legacy local `/uploads/...`) are prefixed with the API origin.
 */
export const fileUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};

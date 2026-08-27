// src/utils/mapUtils.ts

/**
 * Generates a Google Maps URL for searching / viewing a specific location.
 */
export function getGoogleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

/**
 * Generates a Google Maps URL for calculating directions / navigation
 * from the user's current location to the specified destination.
 */
export function getGoogleMapsDirectionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.trim())}`;
}

/**
 * Generates an embeddable Google Maps iframe URL.
 */
export function getGoogleMapsEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Helper to open the location in Google Maps in a new tab.
 */
export function openInGoogleMaps(query: string): void {
  if (!query || !query.trim()) return;
  window.open(getGoogleMapsSearchUrl(query), '_blank', 'noopener,noreferrer');
}

/**
 * Helper to open directions to destination in Google Maps in a new tab.
 */
export function openDirectionsInGoogleMaps(destination: string): void {
  if (!destination || !destination.trim()) return;
  window.open(getGoogleMapsDirectionsUrl(destination), '_blank', 'noopener,noreferrer');
}

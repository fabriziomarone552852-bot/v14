// src/utils/googleMapsLoader.ts

let googleMapsPromise: Promise<boolean> | null = null;

/**
 * Returns whether the Google Maps Places library is currently loaded and available.
 */
export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.google?.maps?.places);
}

/**
 * Loads the Google Maps JavaScript API with Places library asynchronously.
 * Supports modern dynamic library import and loading=async pattern.
 */
export function loadGoogleMaps(apiKey?: string): Promise<boolean> {
  const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!key || !key.trim()) {
    return Promise.resolve(false);
  }

  if (isGoogleMapsLoaded()) {
    return Promise.resolve(true);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise<boolean>((resolve) => {
    // Check if script element already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (isGoogleMapsLoaded()) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', async () => {
        try {
          if (window.google?.maps?.importLibrary) {
            await window.google.maps.importLibrary('places');
          }
          resolve(isGoogleMapsLoaded());
        } catch {
          resolve(false);
        }
      });
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    // Genera un nome callback unico con il prefisso tipizzato in global.d.ts
    const suffix = Math.random().toString(36).substring(2, 9);
    const callbackName = `__googleMapsCallback_${suffix}` as const;

    window[callbackName] = async () => {
      delete window[callbackName];
      try {
        if (window.google?.maps?.importLibrary) {
          await window.google.maps.importLibrary('places');
        }
        resolve(isGoogleMapsLoaded());
      } catch {
        resolve(isGoogleMapsLoaded());
      }
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window[callbackName];
      console.warn('Google Maps script failed to load. Falling back to open autocomplete.');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

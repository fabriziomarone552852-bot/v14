// src/api/geocodingApi.ts

export interface LocationSuggestion {
  id: string;
  mainText: string;
  secondaryText?: string;
  fullText: string;
  source: 'google' | 'osm';
}

/** Photon (Komoot) GeoJSON response types */
interface PhotonProperties {
  osm_id?: number;
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
}
interface PhotonFeature {
  properties?: PhotonProperties;
}
interface PhotonResponse {
  features?: PhotonFeature[];
}

/** Nominatim (OpenStreetMap) response type */
interface NominatimResult {
  place_id?: number;
  display_name?: string;
}

export const fetchPhotonSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    // 1. Try Photon (fast search)
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=5`
    );
    if (response.ok) {
      const data: PhotonResponse = await response.json();
      const features = data.features || [];
      if (features.length > 0) {
        return features.map((f): LocationSuggestion => {
          const p = f.properties || {};
          const streetAndNum = [p.street, p.housenumber].filter(Boolean).join(' ');
          const main = p.name || streetAndNum || p.city || trimmed;
          const secondaryParts = [
            streetAndNum && streetAndNum !== main ? streetAndNum : null,
            p.city || p.town || p.village,
            p.state,
            p.country,
          ].filter(Boolean);

          const fullParts = [
            p.name,
            streetAndNum && streetAndNum !== p.name ? streetAndNum : null,
            p.city || p.town || p.village,
            p.state,
            p.country,
          ].filter(Boolean);

          const uniqueFull = fullParts.filter((v, idx, arr) => arr.indexOf(v) === idx).join(', ');

          return {
            id: `osm-${p.osm_id || Math.random()}`,
            mainText: main,
            secondaryText: secondaryParts.join(', '),
            fullText: uniqueFull || main,
            source: 'osm',
          };
        });
      }
    }
  } catch {
    // Fall through to Nominatim
  }

  try {
    // 2. OpenStreetMap Nominatim
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&addressdetails=1&limit=5&accept-language=it`
    );
    if (nomRes.ok) {
      const items: NominatimResult[] = await nomRes.json();
      return items.map((item) => {
        const parts = (item.display_name || '').split(',');
        const main = parts[0] || trimmed;
        const secondary = parts.slice(1, 4).join(',').trim();
        return {
          id: `nom-${item.place_id || Math.random()}`,
          mainText: main,
          secondaryText: secondary,
          fullText: item.display_name || main,
          source: 'osm',
        };
      });
    }
  } catch {
    // Empty
  }

  return [];
};

export const fetchGooglePlacesSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // I tipi per places e i suoi metodi sono definiti in global.d.ts
  const placesLib = window.google?.maps?.places;
  if (placesLib?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
    try {
      const response = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: trimmed,
      });
      const suggestionsList = response?.suggestions || [];
      if (suggestionsList.length > 0) {
        return suggestionsList
          .filter((s) => s.placePrediction)
          .map((s) => {
            const p = s.placePrediction;
            const main = p?.mainText?.text || p?.text?.text || trimmed;
            const secondary = p?.secondaryText?.text || '';
            const full = p?.text?.text || (secondary ? `${main}, ${secondary}` : main);
            return {
              id: p?.placeId || `google-${Math.random()}`,
              mainText: main,
              secondaryText: secondary,
              fullText: full,
              source: 'google',
            };
          });
      }
    } catch {
      // Google Places API error -> silently fail
    }
  }
  return [];
};

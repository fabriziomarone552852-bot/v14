export {};

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ── Tipo minimale per l'oggetto Google Maps ──
// Descrive SOLO le parti dell'API che il nostro progetto utilizza davvero
// (importLibrary per il caricamento, e AutocompleteSuggestion per i suggerimenti).

/** Singolo suggerimento restituito da Google Places AutocompleteSuggestion */
interface GooglePlacePrediction {
  placeId?: string;
  mainText?: { text?: string };
  secondaryText?: { text?: string };
  text?: { text?: string };
}

/** Wrapper del suggerimento (l'API Google lo avvolge in un oggetto con la chiave `placePrediction`) */
interface GoogleAutocompleteSuggestionItem {
  placePrediction?: GooglePlacePrediction;
}

/** Risposta di fetchAutocompleteSuggestions */
interface GoogleAutocompleteSuggestionsResponse {
  suggestions?: GoogleAutocompleteSuggestionItem[];
}

/** La libreria Places con il metodo Autocomplete che usiamo */
interface GooglePlacesLibrary {
  AutocompleteSuggestion?: {
    fetchAutocompleteSuggestions?: (
      request: { input: string }
    ) => Promise<GoogleAutocompleteSuggestionsResponse>;
  };
}

/** Struttura minimale di google.maps usata nel progetto */
interface GoogleMapsNamespace {
  places?: GooglePlacesLibrary;
  importLibrary?: (name: string) => Promise<unknown>;
}

/** Struttura minimale di window.google usata nel progetto */
interface GoogleNamespace {
  maps?: GoogleMapsNamespace;
}

declare global {
  interface Window {
    google?: GoogleNamespace;
    __googleMapsCallback?: () => void;
    // Index signature per i callback dinamici usati da googleMapsLoader.ts
    // (es. __googleMapsCallback_abc1234)
    [key: `__googleMapsCallback_${string}`]: (() => void) | undefined;
  }
}

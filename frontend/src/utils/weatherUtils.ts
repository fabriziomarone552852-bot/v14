// frontend/src/utils/weatherUtils.ts

/**
 * Restituisce una descrizione testuale in italiano per uno symbol_code MET Norway.
 */
export const getWeatherDescription = (symbolCode?: string): string => {
  if (!symbolCode) return 'Meteo non disponibile';
  const code = symbolCode.toLowerCase();

  if (code.includes('clearsky')) {
    return code.includes('night') ? 'Sereno (notte)' : 'Sereno';
  }
  if (code.includes('fair')) {
    return code.includes('night') ? 'Poco nuvoloso (notte)' : 'Prevalentemente soleggiato';
  }
  if (code.includes('partlycloudy')) {
    return 'Parzialmente nuvoloso';
  }
  if (code.includes('thunder')) {
    return 'Temporale';
  }
  if (code.includes('snow')) {
    return code.includes('heavy') ? 'Forti nevicate' : 'Neve';
  }
  if (code.includes('sleet')) {
    return 'Nevischio';
  }
  if (code.includes('heavyrain')) {
    return 'Forte pioggia';
  }
  if (code.includes('lightrain') || code.includes('rainshowers')) {
    return 'Rovesci di pioggia';
  }
  if (code.includes('rain')) {
    return 'Pioggia';
  }
  if (code.includes('fog')) {
    return 'Nebbia o foschia';
  }
  if (code.includes('cloudy')) {
    return 'Nuvoloso';
  }
  return 'Variabile';
};

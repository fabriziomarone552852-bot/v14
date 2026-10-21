// src/data/changelogs/v13.ts
import type { ChangelogItem } from './types';

export const CHANGELOG_V13: ChangelogItem[] = [
  {
    id: 'v13.5.0',
    version: '13.5.0',
    date: 'Agosto 2026',
    title: 'Sincronizzazione Google Calendar & Ottimizzazioni Mobile',
    isLatest: false,
    published: true,
    highlights: [
      'Integrazione bidirezionale con Google Calendar.',
      'Selezione multipla ed eliminazione massiva eventi e task su mobile.',
      'Nuovo hub per le liste e lotti della spesa con gestione sconti e offerte.'
    ],
    features: [
      'Sincronizzazione Google Calendar con feedback visivo dello stato.',
      'Selezione multipla avanzata su Mobile con barra azioni dedicata.',
      'Nuovi filtri per data, marca e fornitore nell\'archivio spesa.'
    ],
    improvements: [
      'Refactoring dei form modali con validazione in tempo reale.',
      'Ottimizzazione delle animazioni e delle transizioni tra schermate.'
    ],
    fixes: [
      'Corretta la visualizzazione degli eventi a cavallo di più giorni nella vista mensile.'
    ]
  },
  {
    id: 'v13.0.0',
    version: '13.0.0',
    date: 'Luglio 2026',
    title: 'Nuova Architettura Modulare & Modulo Shopping',
    isLatest: false,
    published: true,
    highlights: [
      'Ristrutturazione completa dell\'architettura frontend a moduli e domini dedicati.',
      'Rilascio del nuovo modulo Shopping con gestione liste, prodotti, fornitori e prezzi.',
      'Supporto per la connessione remota sicura con Tailscale Tsnet.'
    ],
    features: [
      'Modulo Shopping completo con storico prezzi e confronto fornitori.',
      'Nuova gestione delle abitudini, routine e countdown con immagini personalizzabili.',
      'Integrazione Tailscale VPN per sincronizzazione nativa su rete privata.'
    ],
    improvements: [
      'Riduzione del tempo di avvio e code-splitting avanzato con Vite.',
      'Refactoring del backend FastAPI con schemi Pydantic rigorosi.'
    ],
    fixes: [
      'Risolti errori di rendering nelle griglie calendario ad alta densità.',
      'Migliorata la persistenza dei token di autenticazione.'
    ]
  }
];

// src/data/loadingMessages.ts

// =============================================
// FRASI DI CARICAMENTO — A rotazione per pagina
// =============================================

export const LOADING_MESSAGES: Record<string, string[]> = {
  // --- Pagine Agenda ---
  home: [
    'I pianeti si stanno allineando...',
    'Le streghe si stanno riunendo...',
    'Evocando gli spiriti della produttività...',
    'Ungendo gli ingranaggi del tempo...',
  ],
  day: [
    'Cercando di capire chi ha rubato le tue ore di sonno...',
    'In cerca di una pozione magica…',
    'Nascondendo le distrazioni sotto il tappeto...',
  ],
  week: [
    'Consultando la sfera di cristallo per i tuoi appuntamenti...',
    'Invocando la pazienza degli spiriti guida…',
    'Calcolando le probabilità di arrivare indenni a domenica...',
  ],
  month: [
    'Contando i giorni che ti separano dal prossimo stipendio...',
    'Interpretando le costellazioni…',
    'Spiegando le vele verso nuove scadenze...',
  ],
  year: [
    "Consultando l'oracolo sul tuo destino…",
    'In che anno siamo...?',
    'Caricando 365 giorni di pura follia gestionale...',
  ],

  // --- Shopping ---
  shopping: [
    'Preparando gli amuleti protettivi…',
    'Contrattando con i loschi mercanti del mercato nero...',
    'Verificando se il frigo è diventato un buco nero...',
  ],

  // --- Admin & Impostazioni ---
  admin: [
    "Inoltrando la richiesta di accesso al Pentagono...",
    "Lucidando il bottone rosso dell'autodistruzione...",
  ],
  settings: [
    'Carichiamo le tue preferenze su misura...',
    'Sintonizziamo i parametri del tuo profilo...',
  ],

  // --- Archivio generico ---
  archive: [
    'Sguinzagliando i cani da tartufo per le tue note...',
    'Dissotterrando le to-do list cadute nel vuoto cosmico...',
    'Spolverando le antiche reliquie del passato...',
  ],

  // --- Pagine Archivio specifiche ---
  archiveShopping: [
    'Evocando gli spettri delle vecchie spese...',
    'Soffiando via la polvere dagli scontrini del passato...',
    'Risvegliando le antiche memorie dei supermercati...',
  ],
  archiveSuppliers: [
    'Passando in rassegna i tuoi fornitori ufficiali…',
    'Invocando gli spiriti guida del commercio…',
    'Ricercando i mercanti più loschi…',
  ],
  archiveTasks: [
    'Scendendo nelle catacombe delle to-do list completate...',
    "Incanalando l'energia dei vecchi task...",
    'Rendendo onore ai compiti portati a termine...',
  ],
  archiveEvents: [
    'Riaprendo le vecchie agende...',
    'Evocando i fantasmi degli eventi di ieri...',
    'Sbirciando nello specchio del passato...',
  ],
  archiveHabits: [
    'Consultando gli antichi registri delle tue vecchie routine...',
    'Riportando alla luce i reperti storici della tua produttività...',
    'Rileggendo le scuse che hai usato più spesso...',
  ],
  archiveNotes: [
    'Spolverando le pergamene dimenticate in soffitta...',
    'Cercando gli appunti caduti sotto la scrivania...',
    'Illuminando gli angoli bui del tuo diario...',
  ],
  archiveCountdowns: [
    'Fissando le clessidre ormai vuote...',
    'Risvegliando i timer che si stanno esaurendo...',
    'Contando ogni secondo rimanente...',
  ],
  archiveCategories: [
    'Smistando il caos nei rispettivi calderoni...',
    'Cercando di dare un senso logico al tuo disordine...',
    'Attribuendo il colore corretto ad ognuno…',
  ],
  archiveTags: [
    "Appiccicando le etichette un po' ovunque…",
    'Decifrando le rune dei tuoi tag…',
    'Ricercando i codici colore…',
  ],
  archiveReviews: [
    'Pesando le scelte dei tuoi mesi passati…',
    'Evocando gli spiriti del pentimento…',
    'Controllando i diari di viaggio…',
  ],
};

// =============================================
// FRASI DI ERRORE — Una per pagina/sezione
// =============================================

export const ERROR_MESSAGES: Record<string, string> = {
  home: 'I dati della tua agenda si sono persi lungo la strada',
  day: 'La pagina sembra insolitamente vuota',
  week: 'I giorni della settimana si sono incrociati sfortunatamente',
  month: 'Abbiamo ricercato i dati sbagliati',
  year: '365 giorni sono tanti da visualizzare, riproviamo con uno per volta',
  shopping: 'Mi sono cadute le liste della spesa, aiutami a riordinarle',
  archive: 'Qualcuno ha archiviato i dati fin troppo bene',
  admin: 'La sala comandi è ben sigillata',
  settings: 'Il pannello delle impostazioni si è momentaneamente bloccato',
};

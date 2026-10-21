# Vita (ex Smart Agenda) - Regole e Istruzioni per Assistenti AI

Fare sempre riferimento a:
1. `AGENTS.md` per le regole operative complete e la gestione multi-chat.
2. `docs/VERSIONING_GUIDE.md` per la procedura standard di rilascio.

### Regola Rapida di Versioning & Multi-Chat
1. Controlla `CHANGELOG_HISTORY[0].published` in `frontend/src/data/changelogData.ts` (rileggi SEMPRE il file su disco, mai fidarsi della memoria chat):
   - Se `published: false`: non cambiare versione in `package.json`, unisci semplicemente le tue novità alla voce draft in cima.
   - Se `published: true`: incrementa `"version": "X.Y.Z"` in `frontend/package.json` seguendo le regole SemVer:
     - **PATCH**: fix bug, ritocchi UI.
     - **MINOR**: nuove funzioni in sezioni esistenti.
     - **MAJOR**: intere nuove MACRO-SEZIONI (es. Media, Shopping).
     Aggiungi poi la nuova voce con `published: false` in cima a `CHANGELOG_HISTORY`.
2. Esegui sempre `npm run build` (che esegue in automatico `node scripts/checkSync.js`) per verificare integrità rotte Nginx, allineamento versioni e assenza di errori TypeScript.
3. Gli script `build_all.ps1`, `build_apk.ps1` e `deploy_build_pc.ps1` finalizzano e pubblicano automaticamente la versione (`published: true`).
4. **Trigger "fine"**: Quando l'utente scrive "fine", eseguire automaticamente il protocollo di chiusura:
   - Spostare i task completati in `docs/BACKLOG_ARCHIVE.md` e mantenere i futuri in `docs/BACKLOG.md`.
   - Aggiornare il Changelog, riassumendo i punti principali se l'ultima versione (`published: false`) risulta troppo lunga.
   - Eseguire `npm run build` e fornire il report finale.

### Regole di Sviluppo (Sintesi)
- **NO Mock Data**: Evita dati mock (hardcoded nel frontend). Usa stati vuoti o procedi subito con l'integrazione backend.
- **DB, Alembic & Idempotenza**:
  - Tutte le migrazioni devono essere difensive e idempotenti (`if_exists=True` su drop index/table, `IF NOT EXISTS` su creazioni). Rimuovere `drop_table` accidentali generate da autogenerate.
  - Verifica sempre su test (`alembic-test.bat`) e accertati dell'allineamento sul DB di produzione NAS (`alembic-prod.bat upgrade head`).
- **Architettura "Mazzo di Carte" & Frontend-First**:
  - Il backend è un archivio CRUD passivo: filtri, ordinamenti, ricerche e gerarchie sottotask avvengono tutti in React/RAM.
  - Allegati e file: **esclusivamente URL testuali**, mai blob o binari nel database.
  - Memoria: dati caldi in RAM, dati storici/freddi caricati su richiesta (Lazy Loading).
  - **Mobile UI & Selettori Centrali**: Su mobile vietati i dropdown/popover inline; usare sempre un piccolo modale centrato a finestra (`SelectModalDialog` / `MobileModalSelect`) con backdrop scuro, righe touch-friendly e chiusura automatica al tap.
  - **Aggiornamento Ottimistico (0ms Latency & Optimistic UI)**: Tasti e toggle frequenti (spunte visto/completato, contatori, citazioni, rating, preferiti) devono aggiornare la UI e la cache TanStack Query istantaneamente in RAM (`onMutate`) a 0ms, con rollback automatico in `onError` e invalidazione silenziosa in `onSettled`. Mai attendere la risposta di rete per mostrare il feedback visivo e mai usare `alert()` nativi.
  - **Campi Decimali Universali (Virgola & Punto)**: In qualsiasi input con decimali (prezzi, quantità, pesi) su Web e Mobile, vietato l'uso di `<input type="number">` (che blocca il tasto punto nei browser in italiano). Usare sempre `type="text" inputMode="decimal"` con `@/utils/decimalUtils` (`sanitizeDecimalString` e `parseDecimalValue`), accettando sempre sia `,` che `.`.
- **Standard Qualità Codice (TypeScript Strict & Clean)**:
  - **Zero any**: vietato l'uso di `any`; tipizzare sempre con `interface`/`type` espliciti.
  - **DRY & Modularità**: estrarre logiche ripetute in utils o custom hooks; spezzare i file lunghi separando UI (JSX) e logica/stato.
  - **File Snelli & Monitoraggio Dimensioni**: se un file creato/modificato diventa troppo grande (> 300-400 righe o troppe responsabilità), segnalare subito il problema nel messaggio successivo all'utente e intervenire per spezzarlo/ridurlo estraendo sotto-componenti, custom hooks o helper.
- **Comunicazione**: spiegazioni chiare, semplici e passo-passo senza tecnicismi superflui; codice sempre completo e rifinito.


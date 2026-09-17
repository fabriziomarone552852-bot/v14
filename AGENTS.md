# Vita (ex Smart Agenda) - Regole per Agenti AI e Sviluppatori

Questo file definisce le istruzioni e le convenzioni operative obbligatorie per qualsiasi assistente AI o sviluppatore che lavora su questa codebase.

---

## 📌 1. Regola di Versioning, Changelog & Multi-Chat Workflow

Ogni volta che vengono apportate modifiche, nuove funzionalità o bug fix rilevanti:

### A. Controllo dello Stato di Pubblicazione (`published`)
L'assistente deve controllare la prima voce in cima a `CHANGELOG_HISTORY` in `frontend/src/data/changelogData.ts`:

1. **Se `published: false` (Versione ancora in sviluppo / non ancora rilasciata)**:
   - **NON creare un nuovo numero di versione** e **NON modificare `package.json`**.
   - **Unisci/aggiungi** semplicemente i nuovi punti salienti (`highlights`, `features`, `improvements`, `fixes`) all'interno della voce draft esistente in cima a `CHANGELOG_HISTORY`.
   - Questo permette a **più chat o sessioni contemporanee** di accumulare modifiche nella stessa versione senza frammentare i numeri.

2. **Se `published: true` (L'ultima versione è già stata rilasciata/pubblicata)**:
   - Determina l'incremento di versione (`MAJOR.MINOR.PATCH`):
     - **PATCH** (`14.0.X`): Correzioni di bug, fix di layout, refactoring minori o piccole modifiche.
     - **MINOR** (`14.X.0`): Nuove sezioni, nuove viste, nuovi moduli o aggiunte funzionali importanti retrocompatibili.
     - **MAJOR** (`X.0.0`): Grandi riscritture architetturali o breaking changes.
   - Aggiorna `"version": "X.Y.Z"` in `frontend/package.json`.
   - Inserisci in cima a `CHANGELOG_HISTORY` in `frontend/src/data/changelogData.ts` la nuova voce con `published: false`, data e dettagli:
   ```typescript
   {
     id: 'vX.Y.Z',
     version: 'X.Y.Z',
     date: 'Mese Anno', // es. 'Settembre 2026'
     title: 'Titolo sintetico dell\'aggiornamento',
     isLatest: true,
     published: false, // Diventerà true in automatico al momento di build APK / deploy
     highlights: [
       'Punto saliente 1...',
     ],
     features: [
       'Nuova funzionalità...',
     ],
     improvements: [
       'Miglioramento...',
     ],
     fixes: [
       'Correzione bug...',
     ],
   }
   ```

### B. Verifica Compilazione
- Eseguire sempre `npm run build` dentro `frontend/` per verificare che non ci siano errori TypeScript prima di concludere.

---

## 🚀 2. Finalizzazione e Pubblicazione Automatica
- **Quando si esegue `.\build_apk.ps1` o `.\deploy_build_pc.ps1`**:
  - Gli script rilevano automaticamente se la versione corrente ha `published: false` e la contrassegnano automaticamente come **`published: true`**.
  - L'APK viene generato con il nome `smartagenda-vX.Y.Z.apk`.
  - Da quel momento, le successive modifiche in qualsiasi chat apriranno un nuovo ciclo di versione (`published: false`).

Per la guida completa e dettagliata, fare riferimento a [`docs/VERSIONING_GUIDE.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/VERSIONING_GUIDE.md).

---

## 🏁 3. Protocollo di Chiusura Sessione (Trigger Parola Chiave "fine")

Quando l'utente scrive **"fine"** (o frasi equivalenti come *"abbiamo finito"*, *"concludi sessione"*, *"chiudi"*), l'assistente AI deve eseguire **automaticamente e senza eccezioni** le seguenti azioni preimpostate:

1. **📋 Sincronizzazione & Aggiornamento Backlog ([`docs/BACKLOG.md`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/docs/BACKLOG.md))**:
   - Controllare le modifiche e le decisioni prese durante la sessione.
   - Segnare come 🟢 **Completato** tutte le voci e gli ID completati (aggiornando sia la tabella riassuntiva sia i paragrafi di dettaglio).
   - Inserire o aggiornare eventuali nuove funzionalità, idee o note emerse nella discussione.

2. **📝 Aggiornamento Changelog & Versioning ([`frontend/src/data/changelogData.ts`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/src/data/changelogData.ts))**:
   - Se ci sono state modifiche al codice o alle funzionalità, applicare la regola di versioning (Sezione 1):
     - Se `published: false`: integrare `highlights`, `features`, `improvements`, `fixes` nella voce bozza in cima.
     - Se `published: true`: incrementare la versione in `package.json` e creare la nuova voce con `published: false`.

3. **🧪 Verifica Compilazione & Type-Check**:
   - Eseguire `npm run build` all'interno di `frontend/` per verificare che non vi siano errori di compilazione TypeScript o problemi di bundling.

4. **📊 Report Finale di Chiusura per l'Utente**:
   - Fornire un riassunto finale conciso che elenca:
     - Le modifiche registrate nel Backlog.
     - Le voci aggiunte al Changelog.
     - L'esito del controllo di compilazione.

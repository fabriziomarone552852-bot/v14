# Guida al Versioning e Rilascio di Smart Agenda

Questo documento definisce la procedura standard e automatica per l'aggiornamento di versione dell'applicazione, la gestione collaborativa su più chat contemporanee (Multi-Chat Workflow), la sincronizzazione del Changelog e la generazione dei pacchetti APK/Docker.

---

## 📌 1. Single Source of Truth & Stato di Pubblicazione (`published`)

La versione e lo storico sono gestiti centralmente in:
1. `frontend/package.json` -> chiave `"version": "X.Y.Z"`
2. `frontend/src/data/changelogData.ts` -> array `CHANGELOG_HISTORY`

Ogni voce di `CHANGELOG_HISTORY` possiede una proprietà booleana fondamentale:
- **`published: false`**: La versione è attualmente **in sviluppo / bozza** (non ancora rilasciata con un build APK o deploy sul server).
- **`published: true`**: La versione è stata **ufficialmente pubblicata e rilasciata**.

---

## 🔄 2. Multi-Chat Workflow (Lavorare con più chat contemporaneamente)

Quando si lavora contemporaneamente su più chat o sessioni diverse prima di un rilascio, per evitare di aumentare continuamente e frammentare la versione ad ogni singolo prompt:

### Regola per l'Assistente AI:
1. **Controllare `CHANGELOG_HISTORY[0].published`**:
   - **Se `published: false`**: Significa che c'è già una versione in fase di sviluppo aperta. **NON** aumentare la versione in `package.json` e **NON** creare una nuova voce. L'assistente deve semplicemente **aggiungere o unire** i propri punti (`features`, `improvements`, `fixes`, `highlights`) all'interno dell'oggetto in cima.
   - **Se `published: true`**: Significa che l'ultima versione è stata già rilasciata. L'assistente deve calcolare il nuovo numero SemVer (`PATCH`, `MINOR`, `MAJOR`), aggiornare `"version"` in `frontend/package.json` e creare una nuova voce in cima con **`published: false`**.

---

## 🛠️ 3. Struttura della Voce Changelog

```typescript
{
  id: 'v14.0.1',
  version: '14.0.1',
  date: 'Settembre 2026',
  title: 'Titolo sintetico dell\'aggiornamento',
  isLatest: true,
  published: false, // Diventerà true in automatico con build_apk o deploy
  highlights: [
    'Sintesi del miglioramento 1',
    'Sintesi del miglioramento 2',
  ],
  features: [
    'Descrizione nuova funzione...',
  ],
  improvements: [
    'Descrizione miglioramento...',
  ],
  fixes: [
    'Risolto problema di...',
  ],
}
```

---

## 🚀 4. Pubblicazione Automatica con APK & Deploy

Quando hai finito tutte le modifiche tra le varie chat e vuoi rilasciare l'aggiornamento:

### A. Compilazione APK Android
Esegui:
```powershell
.\build_apk.ps1
```
Lo script:
1. Controlla `changelogData.ts`: se la versione era `published: false`, la imposta automaticamente a **`published: true`**.
2. Compila il frontend Vite mobile.
3. Compila l'APK e lo copia con il nome versionato: `smartagenda-vX.Y.Z.apk` e `output-apk/smartagenda-vX.Y.Z.apk`.

### B. Build & Deploy Docker per Server / NAS
Esegui:
```powershell
.\deploy_build_pc.ps1
```
Lo script imposta automaticamente `published: true` nel changelog e compila i container aggiornati per il NAS.

---

## 📱 5. Visualizzazione nell'Interfaccia Utente

- **Desktop Web**: Nel pulsante `ℹ️` delle impostazioni utente, il changelog mostra il badge `"In sviluppo"` per le versioni con `published: false` e `"Pubblicata"` per le versioni con `published: true`.
- **Mobile Web / App**: Nella schermata dedicata `/settings/changelog`, le versioni in sviluppo mostrano il badge pulsante ambra `"In sviluppo"`, mentre quelle rilasciate mostrano la data di pubblicazione.

# Guida al Versioning e Rilascio di Smart Agenda

Questo documento definisce la procedura standard e automatica per l'aggiornamento di versione dell'applicazione, la gestione collaborativa su più chat contemporanee (Multi-Chat Workflow), la sincronizzazione del Changelog e la generazione dei pacchetti APK/Docker.

---

## 📌 1. Single Source of Truth & Stato di Pubblicazione (`published`)

La versione e lo storico sono gestiti centralmente in:
1. `frontend/package.json` -> chiave `"version": "X.Y.Z"`
2. `frontend/src/data/changelogs/v<MAJOR>.ts` (es. `v15.ts`, `v14.ts`, `v13.ts`) -> suddivisi per Major version e aggregati centralmente in `frontend/src/data/changelogData.ts` nell'array `CHANGELOG_HISTORY`.

Ogni voce di `CHANGELOG_HISTORY` possiede una proprietà booleana fondamentale:
- **`published: false`**: La versione è attualmente **in sviluppo / bozza** (non ancora rilasciata con un build APK o deploy sul server).
- **`published: true`**: La versione è stata **ufficialmente pubblicata e rilasciata**.

---

## 🔄 2. Multi-Chat Workflow (Lavorare con più chat contemporaneamente)

Quando si lavora contemporaneamente su più chat o sessioni diverse prima di un rilascio, per evitare di aumentare continuamente e frammentare la versione ad ogni singolo prompt:

### Regola per l'Assistente AI:
1. **Controllare `CHANGELOG_HISTORY[0].published`**:
   - **Se `published: false`**: Significa che c'è già una versione in fase di sviluppo aperta. **NON** aumentare la versione in `package.json` e **NON** creare una nuova voce. L'assistente deve semplicemente **aggiungere o unire** i propri punti (`features`, `improvements`, `fixes`, `highlights`) all'interno dell'oggetto in cima.
   - **Se `published: true`**: Significa che l'ultima versione è stata già rilasciata. L'assistente deve calcolare il nuovo numero SemVer (`MAJOR.MINOR.PATCH`), aggiornare `"version"` in `frontend/package.json` e creare una nuova voce in cima con **`published: false`**.
     - **PATCH (`X.Y.Z+1`)**: Correzioni di bug, fix di layout (UI/UX), piccoli aggiustamenti e refactoring minori invisibili all'utente.
     - **MINOR (`X.Y+1.0`)**: Nuove funzionalità aggiunte a *sezioni già esistenti*, nuovi componenti, nuove viste secondarie o aggiunte importanti ma retrocompatibili all'interno di moduli attuali.
     - **MAJOR (`X+1.0.0`)**: **Intere nuove MACRO-SEZIONI o moduli portanti** (es. l'aggiunta del modulo Shopping, della sezione Media/Serie TV, ecc. definiti come "Passo Fondamentale" nel Backlog), grandi riscritture architetturali o breaking changes. Se si introduce un intero nuovo dominio nell'app, è SEMPRE Major.

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

## 🚀 4. Pubblicazione Automatica (Le 3 Modalità di Build)

L'applicazione utilizza una **versione unica per tutto l'ecosistema Vita** (`package.json`, `version.json`, Web e APK Android). Quando hai completato le modifiche e vuoi rilasciare l'aggiornamento, hai a disposizione 3 script PowerShell:

### 🌟 1. Compilazione Unificata Totale (Consigliata) — `.\build_all.ps1`
Esegui:
```powershell
.\build_all.ps1
```
Lo script:
1. Imposta automaticamente `published: true` nel changelog in cima a `CHANGELOG_HISTORY`.
2. Sincronizza `version.json` aggiornando `version` alla versione di `package.json`.
3. Compila ed esporta i container Docker per il NAS (`vxame14_backend.tar` e `vxame14_frontend.tar`).
4. Compila l'APK Android in [`apk/vita-vX.Y.Z.apk`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/apk/).
5. Garantisce la sincronizzazione perfetta tra server e smartphone con un solo comando.

### 🌐 2. Rilascio Solo Web / NAS — `.\deploy_build_pc.ps1`
Esegui:
```powershell
.\deploy_build_pc.ps1
```
Lo script imposta `published: true` nel changelog, allinea `version.json` e compila/esporta i container Docker per il NAS.

### 📱 3. Compilazione Solo APK Android — `.\build_apk.ps1`
Esegui:
```powershell
.\build_apk.ps1
```
Lo script compila l'APK per smartphone salvandolo in [`apk/vita-vX.Y.Z.apk`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/apk/) e [`apk/vita.apk`](file:///c:/Users/Fabrizio/Desktop/app/smart/v14/apk/).

> 💡 **Consiglio Operativo**: Per i rilasci ufficiali, **usa `.\build_all.ps1`**: compila contemporaneamente NAS e APK garantendo che tutto l'ecosistema Vita sia sempre perfettamente allineato allo stesso numero di versione. Se usi gli script singoli per rilasciare entrambi, esegui prima `.\build_apk.ps1` e poi `.\deploy_build_pc.ps1`.

---

## 📱 5. Visualizzazione nell'Interfaccia Utente

- **Desktop Web**: Nel pulsante `ℹ️` delle impostazioni utente, il changelog mostra il badge `"In sviluppo"` per le versioni con `published: false` e `"Pubblicata"` per le versioni con `published: true`.
- **Mobile Web / App**: Nella schermata dedicata `/settings/changelog`, le versioni in sviluppo mostrano il badge pulsante ambra `"In sviluppo"`, mentre quelle rilasciate mostrano la data di pubblicazione.

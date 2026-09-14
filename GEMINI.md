# Smart Agenda - Regole e Istruzioni per Assistenti AI

Fare sempre riferimento a:
1. `AGENTS.md` per le regole operative complete e la gestione multi-chat.
2. `docs/VERSIONING_GUIDE.md` per la procedura standard di rilascio.

### Regola Rapida di Versioning & Multi-Chat
1. Controlla `CHANGELOG_HISTORY[0].published` in `frontend/src/data/changelogData.ts`:
   - Se `published: false`: non cambiare versione in `package.json`, unisci semplicemente le tue novità alla voce draft in cima.
   - Se `published: true`: incrementa `"version": "X.Y.Z"` in `frontend/package.json` e aggiungi la nuova voce con `published: false` in cima a `CHANGELOG_HISTORY`.
2. Esegui sempre `npm run build` per verificare che non ci siano errori.
3. Gli script `build_apk.ps1` e `deploy_build_pc.ps1` finalizzano e pubblicano automaticamente la versione (`published: true`).
4. **Trigger "fine"**: Quando l'utente scrive "fine", eseguire automaticamente il protocollo di chiusura (aggiornamento `docs/BACKLOG.md`, aggiornamento Changelog se applicabile, `npm run build` e report finale).

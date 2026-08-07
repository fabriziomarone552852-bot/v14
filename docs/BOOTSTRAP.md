# Sistema di Bootstrap e Seeding Dinamico (`system_boot`)

Il dominio **`system_boot`** gestisce l'inizializzazione autonoma, la diagnostica e la protezione dell'applicazione al primo avvio su qualsiasi ambiente di database.

---

## 🛡️ Guardia HTTP (`system_boot_guard`)

Il middleware `system_boot_guard` ([backend/domains/system_boot/guards.py](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/domains/system_boot/guards.py)) intercetta tutte le richieste HTTP in arrivo e verifica lo stato del sistema:

* **`ERROR`**: Il server PostgreSQL non è raggiungibile sulla rete/porta configurata.
* **`EMPTY`**: Tabelle di sistema assenti.
* **`LEGACY_SCHEMA_DETECTED`**: Tabelle di sistema presenti ma metadati `system_metadata` non inizializzati.
* **`SUPERUSER_REQUIRED`**: Tabelle e dati di sistema presenti, ma nessun amministratore/SuperUser registrato.
* **`READY`**: Sistema perfettamente funzionante e pronto.

> **Comportamento**: Se lo stato è diverso da `READY`, qualsiasi rotta applicativa protetta restituisce un codice `HTTP 503 Service Unavailable`, lasciando accessibili solo i percorsi di diagnostica `/api/system-boot/*`, `/auth/*` e le documentazioni OpenAPI.

---

## 🔄 Seeder Registry Dinamico

Il seeding dei dati predefiniti di sistema è implementato tramite il **Central Seeder Registry** ([backend/core/seeders.py](file:///c:/Users/user/Documents/PYTHON/VxAme14/backend/core/seeders.py)).

### Come Registrare i Dati di Default per un Nuovo Dominio:
Ogni dominio che necessita di popolare dati iniziali al bootstrap definisce una funzione di seeding e la decora con `@register_seeder`:

```python
from backend.core.seeders import register_seeder

@register_seeder
def seed_default_nuovo_dominio(db: Session) -> None:
    # Logica idempotente di popolamento...
    pass
```

All'invocazione di `/api/system-boot/run`, il metodo `SystemBootService.run_bootstrap`:
1. Crea le tabelle nel DB via `Base.metadata.create_all()`.
2. Esegue le migrazioni Alembic via `run_alembic_upgrade()`.
3. Invece di avere codice cablato, esegue a ciclo continuo tutti i seeder registrati tramite `run_all_system_seeders(db)`.
4. Inserisce i metadati iniziali in `system_metadata`.
5. Transiziona allo stato `SUPERUSER_REQUIRED`.

---

## 👤 Creazione SuperUser Iniziale

La creazione del SuperUser iniziale tramite `/api/system-boot/superuser` provvede automaticamente all'assegnazione delle **9 categorie utente di base** (*Lavoro, Famiglia, Salute, Studio, Gioia, Tristezza, Rabbia, Disgusto, Paura*) per rendere l'account amministrativo immediatamente operativo.

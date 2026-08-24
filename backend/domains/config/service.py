"""
Service del dominio Config.

Gestisce la configurazione applicativa dinamica, i codici di registro (ConfigCode)
e il popolamento automatico dei dati di sistema predefiniti.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.core.seeders import register_seeder
from backend.core.settings import get_settings
from backend.domains.config import repository as repo

settings = get_settings()

DEFAULT_CONFIG_CODES = [
    {"code_type": "currency", "code_value": "EUR", "code_name": "Euro", "description": "Euro", "active": True, "sort_order": 1},
    {"code_type": "group_status", "code_value": "active", "code_name": "Active", "description": "Gruppo attivo", "active": True},
    {"code_type": "group_status", "code_value": "archived", "code_name": "Archived", "description": "Gruppo archiviato", "active": True},
    {"code_type": "item_status", "code_value": "active", "code_name": "Active", "description": "Item attivo", "active": True},
    {"code_type": "item_status", "code_value": "purchased", "code_name": "Purchased", "description": "Item acquistato", "active": True},
    {"code_type": "list_status", "code_value": "active", "code_name": "Active", "description": "Lista attiva", "active": True},
    {"code_type": "list_status", "code_value": "closed", "code_name": "Closed", "description": "Lista chiusa", "active": True},
    {"code_type": "list_visibility", "code_value": "group", "code_name": "Group", "description": "Lista di gruppo", "active": True},
    {"code_type": "list_visibility", "code_value": "private", "code_name": "Private", "description": "Lista privata", "active": True},
    {"code_type": "notification_type", "code_value": "generic", "code_name": "Generic", "description": "Notifica generica", "active": True},
    {"code_type": "offer_flag", "code_value": "no", "code_name": "No offer", "description": "Prezzo non in offerta", "active": True, "sort_order": 1},
    {"code_type": "offer_flag", "code_value": "yes", "code_name": "Offer", "description": "Prezzo in offerta", "active": True, "sort_order": 2},
    {"code_type": "shared_activity_action_type", "code_value": "create", "code_name": "Create", "description": "Creazione", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "update", "code_name": "Update", "description": "Aggiornamento", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "delete", "code_name": "Delete", "description": "Eliminazione logica o fisica", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "restore", "code_name": "Restore", "description": "Ripristino", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "archive", "code_name": "Archive", "description": "Archiviazione", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "close", "code_name": "Close", "description": "Chiusura", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "reopen", "code_name": "Reopen", "description": "Riapertura", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "complete", "code_name": "Complete", "description": "Completamento", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "uncomplete", "code_name": "Uncomplete", "description": "Annullamento completamento", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "add_member", "code_name": "Add Member", "description": "Aggiunta membro", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "remove_member", "code_name": "Remove Member", "description": "Rimozione membro", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "update_role", "code_name": "Update Role", "description": "Aggiornamento ruolo", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "share", "code_name": "Share", "description": "Condivisione", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "unshare", "code_name": "Unshare", "description": "Revoca condivisione", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "login", "code_name": "Login", "description": "Accesso utente", "active": True},
    {"code_type": "shared_activity_action_type", "code_value": "logout", "code_name": "Logout", "description": "Uscita utente", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "shopping_group", "code_name": "Shopping Group", "description": "Entità gruppo shopping", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "shopping_group_member", "code_name": "Shopping Group Member", "description": "Entità membro gruppo shopping", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "shopping_list", "code_name": "Shopping List", "description": "Entità lista shopping", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "shopping_list_item", "code_name": "Shopping List Item", "description": "Entità elemento lista shopping", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "shopping_supplier", "code_name": "Shopping Supplier", "description": "Entità fornitore shopping", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "shopping_price", "code_name": "Shopping Price", "description": "Entità prezzo shopping", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "task", "code_name": "Task", "description": "Entità task", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "event", "code_name": "Event", "description": "Entità evento", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "countdown", "code_name": "Countdown", "description": "Entità countdown", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "habit", "code_name": "Habit", "description": "Entità habit", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "habit_period", "code_name": "Habit Period", "description": "Periodo habit", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "habit_log", "code_name": "Habit Log", "description": "Log giornaliero habit", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "daily_entry", "code_name": "Daily Entry", "description": "Voce giornaliera", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "category", "code_name": "Category", "description": "Categoria condivisa", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "user", "code_name": "User", "description": "Utente", "active": True},
    {"code_type": "shared_activity_entity_type", "code_value": "config", "code_name": "Config", "description": "Configurazione applicativa", "active": True},
    {"code_type": "shared_activity_module", "code_value": "shopping", "code_name": "Shopping", "description": "Modulo shopping", "active": True},
    {"code_type": "shared_activity_module", "code_value": "tasks", "code_name": "Tasks", "description": "Modulo task condivisi", "active": True},
    {"code_type": "shared_activity_module", "code_value": "events", "code_name": "Events", "description": "Modulo eventi condivisi", "active": True},
    {"code_type": "shared_activity_module", "code_value": "countdowns", "code_name": "Countdowns", "description": "Modulo countdown condivisi", "active": True},
    {"code_type": "shared_activity_module", "code_value": "habits", "code_name": "Habits", "description": "Modulo habit condivise", "active": True},
    {"code_type": "shared_activity_module", "code_value": "daily", "code_name": "Daily", "description": "Modulo daily entries condivise", "active": True},
    {"code_type": "shared_activity_module", "code_value": "sharing", "code_name": "Sharing", "description": "Operazioni trasversali di condivisione", "active": True},
    {"code_type": "shared_activity_module", "code_value": "system", "code_name": "System", "description": "Operazioni di sistema", "active": True},
    {"code_type": "shopping_group_role", "code_value": "owner", "code_name": "Owner", "description": "Proprietario del gruppo shopping", "active": True, "sort_order": 1},
    {"code_type": "shopping_group_role", "code_value": "admin", "code_name": "Admin", "description": "Amministratore del gruppo shopping", "active": True, "sort_order": 2},
    {"code_type": "shopping_group_role", "code_value": "editor", "code_name": "Editor", "description": "Può modificare liste e acquisti aperti", "active": True, "sort_order": 3},
    {"code_type": "shopping_group_role", "code_value": "reader", "code_name": "Reader", "description": "Può solo visualizzare", "active": True, "sort_order": 4},
    {"code_type": "shopping_group_status", "code_value": "active", "code_name": "Active", "description": "Stato attivo per gruppi shopping", "active": True},
    {"code_type": "shopping_group_status", "code_value": "inactive", "code_name": "Inactive", "description": "Stato inattivo per gruppi shopping", "active": True},
    {"code_type": "shopping_item_status", "code_value": "open", "code_name": "Open", "description": "Elemento aperto", "active": True, "sort_order": 1},
    {"code_type": "shopping_item_status", "code_value": "purchased", "code_name": "Purchased", "description": "Elemento acquistato", "active": True, "sort_order": 2},
    {"code_type": "shopping_item_status", "code_value": "archived", "code_name": "Archived", "description": "Elemento archiviato", "active": True, "sort_order": 3},
    {"code_type": "shopping_list_status", "code_value": "active", "code_name": "Active", "description": "Lista attiva", "active": True, "sort_order": 1},
    {"code_type": "shopping_list_status", "code_value": "closed", "code_name": "Closed", "description": "Lista chiusa", "active": True, "sort_order": 2},
    {"code_type": "shopping_list_status", "code_value": "archived", "code_name": "Archived", "description": "Lista archiviata", "active": True, "sort_order": 3},
    {"code_type": "shopping_list_visibility", "code_value": "private", "code_name": "Private", "description": "Lista privata", "active": True, "sort_order": 1},
    {"code_type": "shopping_list_visibility", "code_value": "group", "code_name": "Group", "description": "Lista condivisa con un gruppo", "active": True, "sort_order": 2},
    {"code_type": "shopping_unit", "code_value": "conf", "code_name": "CONF", "description": "Confezione", "active": True, "sort_order": 10},
    {"code_type": "shopping_unit", "code_value": "paq", "code_name": "PAQ", "description": "Pacco", "active": True, "sort_order": 20},
    {"code_type": "shopping_unit", "code_value": "bt", "code_name": "BT", "description": "Bottiglia", "active": True, "sort_order": 30},
    {"code_type": "shopping_unit", "code_value": "bar", "code_name": "BAR", "description": "Barattolo", "active": True, "sort_order": 40},
    {"code_type": "shopping_unit", "code_value": "g", "code_name": "G", "description": "Grammi", "active": True, "sort_order": 50},
    {"code_type": "shopping_unit", "code_value": "hg", "code_name": "HG", "description": "Ettogrammi", "active": True, "sort_order": 60},
    {"code_type": "shopping_unit", "code_value": "kg", "code_name": "KG", "description": "Chilogrammi", "active": True, "sort_order": 70},
    {"code_type": "shopping_unit", "code_value": "lt", "code_name": "LT", "description": "Litri", "active": True, "sort_order": 80},
    {"code_type": "shopping_unit", "code_value": "pz", "code_name": "PZ", "description": "Pezzi", "active": True, "sort_order": 90},
    {"code_type": "shopping_unit", "code_value": "rot", "code_name": "ROT", "description": "Rotolo", "active": True, "sort_order": 100},
    {"code_type": "shopping_unit", "code_value": "scat", "code_name": "SCAT", "description": "Scatola", "active": True, "sort_order": 110},
    {"code_type": "shopping_unit", "code_value": "tub", "code_name": "TUB", "description": "Tubetto", "active": True, "sort_order": 120},
    {"code_type": "shopping_unit", "code_value": "bust", "code_name": "BUST", "description": "Busta", "active": True, "sort_order": 130},
    {"code_type": "shopping_unit", "code_value": "fl", "code_name": "FL", "description": "Flacone", "active": True, "sort_order": 140},
    {"code_type": "shopping_unit", "code_value": "vas", "code_name": "VAS", "description": "Vaschetta", "active": True, "sort_order": 150},
    {"code_type": "shopping_unit", "code_value": "brik", "code_name": "BRIK", "description": "Brik", "active": True, "sort_order": 160},
    {"code_type": "shopping_unit", "code_value": "mazz", "code_name": "MAZZ", "description": "Mazzo", "active": True, "sort_order": 170},
    {"code_type": "shopping_unit", "code_value": "fett", "code_name": "FETT", "description": "Fette", "active": True, "sort_order": 180},
    {"code_type": "shopping_unit", "code_value": "m", "code_name": "M", "description": "Metri", "active": True, "sort_order": 190},
    {"code_type": "shopping_unit", "code_value": "latt", "code_name": "LATT", "description": "Lattina", "active": True, "sort_order": 200},
    {"code_type": "shopping_unit", "code_value": "ret", "code_name": "RET", "description": "Retina", "active": True, "sort_order": 210},
    {"code_type": "shopping_unit", "code_value": "paqf", "code_name": "PAQF", "description": "Pacco famiglia", "active": True, "sort_order": 220},
    {"code_type": "shopping_unit", "code_value": "ric", "code_name": "RIC", "description": "Ricarica", "active": True, "sort_order": 230},
    {"code_type": "shopping_unit", "code_value": "cm", "code_name": "CM", "description": "Centimetri", "active": True, "sort_order": 240},
    {"code_type": "shopping_unit", "code_value": "grapp", "code_name": "GRAPP", "description": "Grappolo", "active": True, "sort_order": 250},
    {"code_type": "shopping_unit", "code_value": "spic", "code_name": "SPIC", "description": "Spicchi", "active": True, "sort_order": 260},
    {"code_type": "shopping_unit", "code_value": "kit", "code_name": "KIT", "description": "Kit", "active": True, "sort_order": 270},
    {"code_type": "shopping_unit", "code_value": "mm", "code_name": "MM", "description": "Millimetri", "active": True, "sort_order": 280},
    {"code_type": "shopping_unit", "code_value": "cl", "code_name": "CL", "description": "Centilitri", "active": True, "sort_order": 290},
    {"code_type": "shopping_unit", "code_value": "ml", "code_name": "ML", "description": "Millilitri", "active": True, "sort_order": 300},
    {"code_type": "supplier_status", "code_value": "active", "code_name": "Active", "description": "Fornitore attivo", "active": True},
    {"code_type": "supplier_status", "code_value": "inactive", "code_name": "Inactive", "description": "Fornitore inattivo", "active": True},
]
@register_seeder
def seed_default_configs(db: Session) -> None:
    """Popola le configurazioni applicative di default se assenti."""
    existing = repo.get_config_by_key(db, "max_subtask_depth")
    if existing is None:
        repo.create_config(
            db,
            key="max_subtask_depth",
            value=str(settings.default_max_subtask_depth),
            descrizione="Numero massimo di livelli consentiti per la nidificazione dei sottotask.",
        )

    existing_price = repo.get_config_by_key(db, "price_stats_lookback_days")
    if existing_price is None:
        repo.create_config(
            db,
            key="price_stats_lookback_days",
            value=str(settings.default_price_stats_lookback_days),
            descrizione="Numero di giorni di storico da considerare per il calcolo del prezzo medio e migliore nella spesa (es. 365 per 1 anno, 90 per 3 mesi).",
        )




@register_seeder
def seed_default_config_codes(db: Session) -> None:
    """Popola i codici di configurazione (ConfigCode) di default se assenti."""
    repo.bulk_create_config_codes_if_missing(db, DEFAULT_CONFIG_CODES)

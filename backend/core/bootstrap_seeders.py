"""
Bootstrap Seeders Activator.

Importa esplicitamente tutti i moduli che contengono seeder
per registrarli nel registry centrale.

Per aggiungere nuovi domini con seeder, aggiungi una riga di import qui sotto.
"""

# Import per registrazione dei seeder trasversali di sistema (Fase 1)
import backend.domains.config.service  # noqa: F401
import backend.domains.monthly_entries.service  # noqa: F401
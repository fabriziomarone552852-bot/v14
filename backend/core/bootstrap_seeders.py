"""
Bootstrap Seeders Activator.

Importa esplicitamente tutti i moduli che contengono seeder
per registrarli nel registry centrale.

Per aggiungere nuovi domini con seeder, aggiungi una riga di import qui sotto.
"""

# Import per registrazione dei seeder
import backend.domains.config.service  # noqa: F401
import backend.domains.monthly_entries.service  # noqa: F401
import backend.domains.shopping.service  # noqa: F401

# Se aggiungi altri domini con seeder, importali qui:
# import backend.domains.nuovo_dominio.service  # noqa: F401
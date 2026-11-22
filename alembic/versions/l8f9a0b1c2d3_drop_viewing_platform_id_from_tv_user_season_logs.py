"""drop viewing_platform_id from tv_user_season_logs

Revision ID: l8f9a0b1c2d3
Revises: k7e8f9a0b1c2
Create Date: 2026-11-19 21:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "l8f9a0b1c2d3"
down_revision: Union[str, None] = "k7e8f9a0b1c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "tv_user_season_logs" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("tv_user_season_logs")}
    if "viewing_platform_id" not in columns:
        return

    for fk in inspector.get_foreign_keys("tv_user_season_logs"):
        if "viewing_platform_id" in fk.get("constrained_columns", []) and fk.get("name"):
            op.drop_constraint(fk["name"], "tv_user_season_logs", type_="foreignkey")

    op.drop_column("tv_user_season_logs", "viewing_platform_id")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "tv_user_season_logs" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("tv_user_season_logs")}
    if "viewing_platform_id" not in columns:
        op.add_column(
            "tv_user_season_logs",
            sa.Column(
                "viewing_platform_id",
                sa.Integer(),
                sa.ForeignKey("tv_user_platforms.id", ondelete="SET NULL"),
                nullable=True,
            ),
        )

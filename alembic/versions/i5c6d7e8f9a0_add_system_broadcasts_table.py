"""add system_broadcasts table

Revision ID: i5c6d7e8f9a0
Revises: h4c5d6e7f8a9
Create Date: 2026-11-13 23:45:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'i5c6d7e8f9a0'
down_revision: Union[str, None] = 'h4c5d6e7f8a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "system_broadcasts" not in tables:
        op.create_table(
            "system_broadcasts",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("title", sa.String(length=200), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("level", sa.String(length=50), nullable=False, server_default="WARNING"),
            sa.Column("show_popup", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_system_broadcasts_is_active", "system_broadcasts", ["is_active"])


def downgrade() -> None:
    op.drop_index("ix_system_broadcasts_is_active", table_name="system_broadcasts", if_exists=True)
    op.drop_table("system_broadcasts", if_exists=True)

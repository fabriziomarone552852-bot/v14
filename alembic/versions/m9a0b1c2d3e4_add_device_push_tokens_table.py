"""add device_push_tokens table

Revision ID: m9a0b1c2d3e4
Revises: l8f9a0b1c2d3
Create Date: 2026-11-22 20:30:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "m9a0b1c2d3e4"
down_revision: Union[str, None] = "l8f9a0b1c2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "device_push_tokens" not in tables:
        op.create_table(
            "device_push_tokens",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("token", sa.String(length=512), nullable=False),
            sa.Column("platform", sa.String(length=20), nullable=False, server_default="android"),
            sa.Column("device_name", sa.String(length=120), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
            sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("token", name="uq_device_push_tokens_token"),
        )
        op.create_index("ix_device_push_tokens_user_id", "device_push_tokens", ["user_id"])
        op.create_index("ix_device_push_tokens_token", "device_push_tokens", ["token"], unique=True)
        op.create_index("ix_device_push_tokens_is_active", "device_push_tokens", ["is_active"])


def downgrade() -> None:
    op.drop_index("ix_device_push_tokens_is_active", table_name="device_push_tokens", if_exists=True)
    op.drop_index("ix_device_push_tokens_token", table_name="device_push_tokens", if_exists=True)
    op.drop_index("ix_device_push_tokens_user_id", table_name="device_push_tokens", if_exists=True)
    op.drop_table("device_push_tokens", if_exists=True)

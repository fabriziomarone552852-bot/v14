"""add feedback_reports table

Revision ID: m2n3o4p5q6r7
Revises: l1m2n3o4p5q6
Create Date: 2026-09-14 23:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'm2n3o4p5q6r7'
down_revision: Union[str, Sequence[str], None] = 'l1m2n3o4p5q6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback_reports (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            report_type VARCHAR(50) NOT NULL DEFAULT 'bug',
            severity VARCHAR(20) NOT NULL DEFAULT 'medium',
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            steps_to_reproduce TEXT,
            app_version VARCHAR(30) NOT NULL,
            platform VARCHAR(50) NOT NULL,
            current_route VARCHAR(255) NOT NULL,
            error_context TEXT,
            screenshot_url VARCHAR(500),
            status VARCHAR(20) NOT NULL DEFAULT 'new',
            admin_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE,
            resolved_at TIMESTAMP WITH TIME ZONE
        );
        CREATE INDEX IF NOT EXISTS ix_feedback_reports_user_id ON feedback_reports (user_id);
        CREATE INDEX IF NOT EXISTS ix_feedback_reports_status ON feedback_reports (status);
        CREATE INDEX IF NOT EXISTS ix_feedback_reports_created_at ON feedback_reports (created_at DESC);
        """
    )


def downgrade() -> None:
    op.drop_table('feedback_reports')

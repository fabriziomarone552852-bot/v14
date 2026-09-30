// src/types/notifications.ts
// Unified Interaction types (Messages, Comments, Notifications)

export interface NotificationResponse {
  id: number;
  interaction_type: string; // e.g., 'EPHEMERAL_MSG', 'COMMENT', 'FRIEND_REQUEST', 'SYSTEM_ALERT'
  author_id: number | null;
  recipient_id: number | null;
  reference_id: number | null;
  content: string;
  created_at: string;
  read_at: string | null;
  
  // Extra dynamic fields
  author_name?: string | null;
  author_avatar?: string | null;
  context_title?: string | null;
  series_tmdb_id?: number | null;
  episode_id?: number | null;
}

export interface NotificationCreate {
  interaction_type: string;
  recipient_id?: number | null;
  reference_id?: number | null;
  content: string;
}

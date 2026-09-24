export interface NotificationResponse {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

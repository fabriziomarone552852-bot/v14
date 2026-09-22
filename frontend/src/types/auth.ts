export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  must_change_password?: boolean;
  access_scope?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_superuser?: boolean;
  max_subtask_depth_user?: number | null;
  profile_picture_url?: string | null;
  default_startup_page?: string | null;
  module_preferences?: Record<string, boolean> | null;
}
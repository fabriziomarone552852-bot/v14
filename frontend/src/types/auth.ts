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
}
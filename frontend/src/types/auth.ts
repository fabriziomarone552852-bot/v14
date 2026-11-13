import type { UserModulePreferences } from '@/types/settings';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  must_change_password?: boolean;
  access_scope?: string;
}

export interface UserStreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_superuser?: boolean;
  max_subtask_depth_user?: number | null;
  profile_picture_url?: string | null;
  default_startup_page?: string | null;
  module_preferences?: UserModulePreferences | null;
  streaming_providers?: UserStreamingProvider[] | null;
}
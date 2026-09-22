export interface FriendStatusResponse {
  user: {
    id: number;
    username: string;
    profile_picture_url?: string | null;
  };
  status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked';
}

export interface FriendshipResponse {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at?: string | null;
  requester?: {
    id: number;
    username: string;
    profile_picture_url?: string | null;
  };
  addressee?: {
    id: number;
    username: string;
    profile_picture_url?: string | null;
  };
}

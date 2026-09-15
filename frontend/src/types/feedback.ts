// src/types/feedback.ts

export type FeedbackType = 'bug' | 'visual' | 'feature_request' | 'other';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved' | 'dismissed';

export interface FeedbackReport {
  id: number;
  user_id: number;
  report_type: FeedbackType;
  severity: FeedbackSeverity;
  title: string;
  description: string;
  steps_to_reproduce?: string | null;
  app_version: string;
  platform: string;
  current_route: string;
  error_context?: string | null;
  screenshot_url?: string | null;
  status: FeedbackStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  resolved_at?: string | null;
  user_username?: string | null;
  user_email?: string | null;
}

export interface FeedbackReportCreatePayload {
  report_type: FeedbackType;
  severity: FeedbackSeverity;
  title: string;
  description: string;
  steps_to_reproduce?: string | null;
  app_version: string;
  platform: string;
  current_route: string;
  error_context?: string | null;
  screenshot_url?: string | null;
}

export interface FeedbackReportUpdatePayload {
  status?: FeedbackStatus;
  admin_notes?: string | null;
}

export interface FeedbackFilterParams {
  status?: FeedbackStatus | '';
  severity?: FeedbackSeverity | '';
  type?: FeedbackType | '';
  limit?: number;
  offset?: number;
}

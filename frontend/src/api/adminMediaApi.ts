// src/api/adminMediaApi.ts
import { apiClient } from './client';

export interface AdminViewingPlatformItem {
  id: number;
  user_id: number;
  username?: string | null;
  name: string;
  usage_count: number;
}

export interface AdminViewingPlatformUpdatePayload {
  name: string;
}

export interface AdminMediaListItem {
  id: number;
  user_id: number;
  username?: string | null;
  name: string;
  description?: string | null;
  visibility: string;
  items_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminMediaListUpdatePayload {
  name?: string;
  description?: string | null;
  visibility?: string;
}

export interface AdminMediaQuoteItem {
  id: number;
  user_id: number;
  username?: string | null;
  media_type: 'tv' | 'movie';
  media_title: string;
  quote_text: string;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminMediaQuoteUpdatePayload {
  quote_text: string;
}

// -------------------------------------------------------------
// VIEWING PLATFORMS
// -------------------------------------------------------------

export async function fetchAdminMediaPlatforms(): Promise<AdminViewingPlatformItem[]> {
  const res = await apiClient.get<AdminViewingPlatformItem[]>('/admin/media/platforms');
  return res.data;
}

export async function updateAdminMediaPlatform(
  platformId: number,
  payload: AdminViewingPlatformUpdatePayload
): Promise<AdminViewingPlatformItem> {
  const res = await apiClient.patch<AdminViewingPlatformItem>(`/admin/media/platforms/${platformId}`, payload);
  return res.data;
}

export async function deleteAdminMediaPlatform(platformId: number): Promise<void> {
  await apiClient.delete(`/admin/media/platforms/${platformId}`);
}

// -------------------------------------------------------------
// MEDIA LISTS
// -------------------------------------------------------------

export async function fetchAdminMediaLists(): Promise<AdminMediaListItem[]> {
  const res = await apiClient.get<AdminMediaListItem[]>('/admin/media/lists');
  return res.data;
}

export async function updateAdminMediaList(
  listId: number,
  payload: AdminMediaListUpdatePayload
): Promise<AdminMediaListItem> {
  const res = await apiClient.patch<AdminMediaListItem>(`/admin/media/lists/${listId}`, payload);
  return res.data;
}

export async function deleteAdminMediaList(listId: number): Promise<void> {
  await apiClient.delete(`/admin/media/lists/${listId}`);
}

// -------------------------------------------------------------
// MEDIA QUOTES (TV & MOVIES)
// -------------------------------------------------------------

export async function fetchAdminMediaQuotes(): Promise<AdminMediaQuoteItem[]> {
  const res = await apiClient.get<AdminMediaQuoteItem[]>('/admin/media/quotes');
  return res.data;
}

export async function updateAdminMediaQuote(
  mediaType: 'tv' | 'movie',
  quoteId: number,
  payload: AdminMediaQuoteUpdatePayload
): Promise<AdminMediaQuoteItem> {
  const res = await apiClient.patch<AdminMediaQuoteItem>(`/admin/media/quotes/${mediaType}/${quoteId}`, payload);
  return res.data;
}

export async function deleteAdminMediaQuote(
  mediaType: 'tv' | 'movie',
  quoteId: number
): Promise<void> {
  await apiClient.delete(`/admin/media/quotes/${mediaType}/${quoteId}`);
}

// src/api/mediaService.ts
import { api } from './apiService';
import { apiClient } from './client';

export interface MediaUploadResponse {
  url: string;
  filename: string;
  size_bytes: number;
  width: number;
  height: number;
  content_type: string;
}

export const mediaService = {
  /**
   * Carica un file immagine dal dispositivo al backend.
   * Il backend la ottimizza automaticamente in formato WebP.
   */
  uploadImage: async (file: File, folder: string = 'general'): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post<MediaUploadResponse>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Scarica e memorizza in locale un'immagine partendo da un URL esterno.
   */
  fetchImageFromUrl: async (url: string, folder: string = 'general'): Promise<MediaUploadResponse> => {
    const res = await api.post<MediaUploadResponse>('/media/fetch-url', {
      url,
      folder,
    });
    if (!res) {
      throw new Error("Nessuna risposta dal server per il download dell'immagine.");
    }
    return res;
  },
};

import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export interface TailscaleAuthUrlEvent {
  authUrl: string;
}

export interface TailscaleReadyEvent {
  ready: boolean;
}

export interface TailscaleErrorEvent {
  error: string;
}

export interface TailscaleStatusEvent {
  status: string;
}

export interface TailscalePluginInterface {
  getStatus(): Promise<{ ready: boolean; authUrl: string; status: string; localPort: number }>;
  start(): Promise<{ started: boolean }>;
  stop(): Promise<{ stopped: boolean }>;
  addListener(
    eventName: 'tailscale:auth-url',
    listenerFunc: (data: TailscaleAuthUrlEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'tailscale:ready',
    listenerFunc: (data: TailscaleReadyEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'tailscale:error',
    listenerFunc: (data: TailscaleErrorEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'tailscale:status',
    listenerFunc: (data: TailscaleStatusEvent) => void
  ): Promise<PluginListenerHandle>;
}

export const TailscaleNative = registerPlugin<TailscalePluginInterface>('TailscalePlugin');

export async function openTailscaleAuthUrl(url: string): Promise<void> {
  try {
    await Browser.open({ url, windowName: '_self' });
  } catch (e) {
    console.error('Failed to open browser for Tailscale auth:', e);
    window.open(url, '_blank');
  }
}

import { registerPlugin } from '@capacitor/core';

export interface GoogleSignInResult {
  serverAuthCode: string;
  email?: string;
  idToken?: string;
}

export interface GoogleAuthNativePluginInterface {
  signIn(options: { serverClientId: string }): Promise<GoogleSignInResult>;
  signOut(options?: { serverClientId?: string }): Promise<{ success: boolean }>;
}

export const GoogleAuthNative = registerPlugin<GoogleAuthNativePluginInterface>('GoogleAuthNative');

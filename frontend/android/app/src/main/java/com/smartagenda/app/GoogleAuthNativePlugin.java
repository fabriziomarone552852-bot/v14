package com.smartagenda.app;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "GoogleAuthNative")
public class GoogleAuthNativePlugin extends Plugin {
    private static final String TAG = "GoogleAuthNative";

    private GoogleSignInClient getClient(String serverClientId) {
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestServerAuthCode(serverClientId, true)
                .requestScopes(new Scope("https://www.googleapis.com/auth/calendar.events"))
                .build();
        return GoogleSignIn.getClient(getActivity(), gso);
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        if (serverClientId == null || serverClientId.isEmpty()) {
            call.reject("serverClientId is required");
            return;
        }

        try {
            GoogleSignInClient client = getClient(serverClientId);
            // Sign out first to ensure the user is prompted and refresh token is generated
            client.signOut().addOnCompleteListener(task -> {
                try {
                    Intent signInIntent = client.getSignInIntent();
                    startActivityForResult(call, signInIntent, "handleSignInResult");
                } catch (Exception e) {
                    Log.e(TAG, "Failed to start Google Sign-In intent", e);
                    call.reject("Errore avvio schermata Google: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error initiating Google Sign-In", e);
            call.reject("Errore inizializzazione Google Sign-In: " + e.getMessage());
        }
    }

    @ActivityCallback
    private void handleSignInResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() == Activity.RESULT_CANCELED) {
            call.reject("Accesso Google annullato.");
            return;
        }

        Intent data = result.getData();
        if (data == null) {
            call.reject("Nessun dato restituito dal servizio Google.");
            return;
        }

        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            if (account != null) {
                String authCode = account.getServerAuthCode();
                String email = account.getEmail();
                String idToken = account.getIdToken();

                if (authCode == null || authCode.isEmpty()) {
                    call.reject("Codice di autorizzazione Google (serverAuthCode) non presente.");
                    return;
                }

                JSObject ret = new JSObject();
                ret.put("serverAuthCode", authCode);
                ret.put("email", email != null ? email : "");
                ret.put("idToken", idToken != null ? idToken : "");
                call.resolve(ret);
            } else {
                call.reject("Nessun account Google trovato.");
            }
        } catch (ApiException e) {
            Log.e(TAG, "Google Sign-In failed with status: " + e.getStatusCode() + " - " + e.getMessage(), e);
            call.reject("Errore Google Sign-In (codice " + e.getStatusCode() + "): " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error during Google Sign-In", e);
            call.reject("Errore imprevisto durante l'accesso Google: " + e.getMessage());
        }
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        if (serverClientId != null && !serverClientId.isEmpty()) {
            try {
                GoogleSignInClient client = getClient(serverClientId);
                client.signOut().addOnCompleteListener(task -> {
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                });
                return;
            } catch (Exception ignored) {}
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}

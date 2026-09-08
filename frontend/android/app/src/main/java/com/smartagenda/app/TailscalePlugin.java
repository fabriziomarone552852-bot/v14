package com.smartagenda.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

@CapacitorPlugin(name = "TailscalePlugin")
public class TailscalePlugin extends Plugin {
    private static final String TAG = "TailscalePlugin";
    private static final String TARGET_HOST = "smartagenda.tailf3b58c.ts.net";
    private static final int TARGET_PORT = 8181;
    private static final int LOCAL_PORT = 8088;

    private String currentAuthUrl = "";
    private String currentStatus = "Inizializzazione...";
    private boolean isReady = false;
    private boolean isStarting = false;

    @Override
    public void load() {
        super.load();
        // Start tsnet in background after Activity is ready
        new Handler(Looper.getMainLooper()).postDelayed(this::startTsnet, 500);
    }

    public synchronized void startTsnet() {
        if (isReady || isStarting) {
            return;
        }
        isStarting = true;
        currentStatus = "Avvio Tailscale...";

        new Thread(() -> {
            try {
                File tsDir = new File(getContext().getFilesDir(), "tsnet");
                if (!tsDir.exists()) {
                    tsDir.mkdirs();
                }
                String stateDir = tsDir.getAbsolutePath();

                Log.i(TAG, "Starting tsnet with state dir: " + stateDir);

                // Interface implementation for tsnetproxy.Callback
                tsnetproxy.Callback callback = new tsnetproxy.Callback() {
                    @Override
                    public void onAuthURL(String authURL) {
                        Log.i(TAG, "Tailscale Auth URL received: " + authURL);
                        currentAuthUrl = authURL;
                        currentStatus = "Richiesta autenticazione Tailscale";
                        isReady = false;
                        isStarting = false;

                        JSObject ret = new JSObject();
                        ret.put("authUrl", authURL);
                        notifyListeners("tailscale:auth-url", ret);

                        // Try safe UI thread browser open
                        if (getActivity() != null) {
                            getActivity().runOnUiThread(() -> {
                                try {
                                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(authURL));
                                    browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    getContext().startActivity(browserIntent);
                                } catch (Throwable ignored) {}
                            });
                        }
                    }

                    @Override
                    public void onReady(long localPort) {
                        Log.i(TAG, "Tailscale ready! Proxy on port " + localPort);
                        isReady = true;
                        isStarting = false;
                        currentAuthUrl = "";
                        currentStatus = "Connesso";

                        JSObject ret = new JSObject();
                        ret.put("ready", true);
                        ret.put("localPort", (int) localPort);
                        notifyListeners("tailscale:ready", ret);
                    }

                    @Override
                    public void onError(String errMsg) {
                        Log.e(TAG, "Tailscale error: " + errMsg);
                        currentStatus = "Errore: " + errMsg;
                        isStarting = false;

                        JSObject ret = new JSObject();
                        ret.put("error", errMsg);
                        notifyListeners("tailscale:error", ret);
                    }

                    @Override
                    public void onStatusChange(String status) {
                        Log.i(TAG, "Tailscale status: " + status);
                        currentStatus = status;

                        JSObject ret = new JSObject();
                        ret.put("status", status);
                        notifyListeners("tailscale:status", ret);
                    }
                };

                tsnetproxy.Tsnetproxy.start(stateDir, TARGET_HOST, TARGET_PORT, LOCAL_PORT, callback);
            } catch (Throwable t) {
                Log.e(TAG, "Fatal error in tsnet: " + t.getMessage(), t);
                currentStatus = "Errore modulo nativo: " + t.getMessage();
                isStarting = false;

                JSObject ret = new JSObject();
                ret.put("error", t.getMessage());
                notifyListeners("tailscale:error", ret);
            }
        }).start();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("ready", isReady);
        ret.put("authUrl", currentAuthUrl);
        ret.put("status", currentStatus);
        ret.put("localPort", LOCAL_PORT);
        call.resolve(ret);
    }

    @PluginMethod
    public void start(PluginCall call) {
        startTsnet();
        JSObject ret = new JSObject();
        ret.put("started", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            tsnetproxy.Tsnetproxy.stop();
            isReady = false;
            isStarting = false;
            currentAuthUrl = "";
            currentStatus = "Fermato";
        } catch (Throwable ignored) {}
        JSObject ret = new JSObject();
        ret.put("stopped", true);
        call.resolve(ret);
    }
}

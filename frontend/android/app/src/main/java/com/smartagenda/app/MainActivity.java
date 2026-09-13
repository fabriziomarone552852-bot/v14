package com.smartagenda.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TailscalePlugin.class);
        registerPlugin(GoogleAuthNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}

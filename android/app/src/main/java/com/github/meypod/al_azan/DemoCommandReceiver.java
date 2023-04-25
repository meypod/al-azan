package com.github.meypod.al_azan;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class DemoCommandReceiver extends BroadcastReceiver {


    @Override
    public void onReceive(Context context, Intent intent) {
        if (ContextHolder.getApplicationContext() == null) {
            ContextHolder.setApplicationContext(context.getApplicationContext());
        }

        // check a permission not in manifest
        // reason:
        // originally I wanted to check if demo ui mode is active then process the request
        // But I believe this permission check is enough alone to handle the broadcast

        // handle commands for demo
        if (intent.getExtras() != null) {
            ReactUtils.sendEvent("demo_cmd", Arguments.fromBundle(intent.getExtras()));
        }
    }
}

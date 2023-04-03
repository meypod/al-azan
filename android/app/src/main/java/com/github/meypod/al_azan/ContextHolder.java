package com.github.meypod.al_azan;

import android.content.Context;
import android.util.Log;

public class ContextHolder {
    private static Context applicationContext;

    public static Context getApplicationContext() {
        return applicationContext;
    }

    public static void setApplicationContext(Context applicationContext) {
        Log.d("context", "received application context");
        ContextHolder.applicationContext = applicationContext;
    }
}

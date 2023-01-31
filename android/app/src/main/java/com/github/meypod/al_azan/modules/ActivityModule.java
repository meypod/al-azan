package com.github.meypod.al_azan.modules;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.logging.Logger;

public class ActivityModule extends ReactContextBaseJavaModule {
    ActivityModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "ActivityModule";
    }

    @ReactMethod
    public void restart() {
        // Systems at 29/Q and later don't allow relaunch, but System.exit(0) on
        // all supported systems will relaunch ... but by killing the process, then
        // restarting the process with the back stack intact. We must make sure that
        // the launch activity is the only thing in the back stack before exiting.
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            final PackageManager pm = currentActivity.getPackageManager();
            final Intent intent = pm.getLaunchIntentForPackage(currentActivity.getPackageName());
            currentActivity.finishAffinity(); // Finishes all activities.
            currentActivity.startActivity(intent);    // Start the launch activity
            System.exit(0);    // System finishes and automatically relaunches us.
        }

    }

    @ReactMethod
    public void finish() {
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            currentActivity.finish();
        }
    }

    @ReactMethod
    public void finishAndRemoveTask() {
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            currentActivity.finishAffinity();
            currentActivity.finishAndRemoveTask();
        }
    }


    @ReactMethod
    public void getActivityName(final Promise promise) {
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            promise.resolve(currentActivity.getLocalClassName());
            return;
        }
        promise.resolve("");
    }

    @ReactMethod
    public void isDndActive(final Promise promise) {
        try {
            int state = Settings.Global.getInt(getReactApplicationContext().getContentResolver(), "zen_mode");
            promise.resolve(state > 0);
        } catch (Exception _e) {
            promise.resolve(false);
        }
    }


    @ReactMethod
    public void openApplicationSettings(final Promise promise) {
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            try {
                Intent intent = new Intent();
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                String packageName = getReactApplicationContext().getPackageName();
                intent.setData(Uri.parse("package:" + packageName));

                currentActivity.runOnUiThread(
                        () -> {
                            try {
                                getReactApplicationContext().startActivity(intent);
                                promise.resolve(null);
                            } catch (Exception e) {
                                promise.reject("An error occurred whilst trying to start activity on Ui Thread", e);
                            }
                        });
            } catch (Exception e) {
                promise.reject("An error occurred whilst trying to open app settings", e);
            }
        }
    }

    // Required for rn built in EventEmitter Calls.
    @ReactMethod
    public void addListener(String eventName) {
        // do nothing
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // do nothing
    }
}

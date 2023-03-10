package com.github.meypod.al_azan.modules;

import static android.content.Context.CONNECTIVITY_SERVICE;
import static android.content.Context.LOCATION_SERVICE;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class ActivityModule extends ReactContextBaseJavaModule {
    private static final int REQUEST_ENABLE_LOCATION_SERVICES = 1000;
    private static final int REQUEST_ENABLE_DATA_ROAMING = 1001;
    private static final int REQUEST_ENABLE_WIFI = 1002;

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

    private boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager
                = (ConnectivityManager) getReactApplicationContext().getSystemService(CONNECTIVITY_SERVICE);

        if (connectivityManager == null) return false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            NetworkCapabilities capabilities = connectivityManager.getNetworkCapabilities(connectivityManager.getActiveNetwork());
            return capabilities != null && (capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET));
        } else {
            NetworkInfo activeNetworkInfo = connectivityManager != null ? connectivityManager.getActiveNetworkInfo() : null;
            return (activeNetworkInfo != null && (activeNetworkInfo.isConnectedOrConnecting() && activeNetworkInfo.isAvailable()));
        }
    }

    @ReactMethod
    public void isNetworkAvailable(final Promise promise) {
        promise.resolve(isNetworkAvailable());
    }

    private boolean isLocationEnabled() {
        final LocationManager locationManager = (LocationManager) getReactApplicationContext().getSystemService(LOCATION_SERVICE);
        final boolean enabled = locationManager != null && locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        return enabled;
    }

    @ReactMethod
    public void isLocationEnabled(final Promise promise) {
        promise.resolve(isLocationEnabled());
    }

    /**
     * resolve with true if user enabled location, false otherwise
     */
    @ReactMethod
    public void openLocationSettings(final Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            final String action = android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS;
            getReactApplicationContext().addActivityEventListener(new ActivityEventListener() {
                @Override
                public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent intent) {
                    if (requestCode == REQUEST_ENABLE_LOCATION_SERVICES) {
                        getReactApplicationContext().removeActivityEventListener(this);
                        promise.resolve(isLocationEnabled());
                    }
                }

                @Override
                public void onNewIntent(Intent intent) {
                }
            });
            activity.startActivityForResult(new Intent(action), REQUEST_ENABLE_LOCATION_SERVICES);

        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void openMobileDataSettings(final Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            final String action = android.provider.Settings.ACTION_DATA_ROAMING_SETTINGS;
            getReactApplicationContext().addActivityEventListener(new ActivityEventListener() {
                @Override
                public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent intent) {
                    if (requestCode == REQUEST_ENABLE_DATA_ROAMING) {
                        getReactApplicationContext().removeActivityEventListener(this);
                        promise.resolve(isNetworkAvailable());
                    }
                }

                @Override
                public void onNewIntent(Intent intent) {
                }
            });
            activity.startActivityForResult(new Intent(action), REQUEST_ENABLE_DATA_ROAMING);
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void openMobileWifiSettings(final Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            final String action = Settings.ACTION_WIFI_SETTINGS;
            getReactApplicationContext().addActivityEventListener(new ActivityEventListener() {
                @Override
                public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent intent) {
                    if (requestCode == REQUEST_ENABLE_WIFI) {
                        getReactApplicationContext().removeActivityEventListener(this);
                        promise.resolve(isNetworkAvailable());
                    }
                }

                @Override
                public void onNewIntent(Intent intent) {
                }
            });
            activity.startActivityForResult(new Intent(action), REQUEST_ENABLE_WIFI);
        } else {
            promise.resolve(false);
        }
    }

    private static int SAVE_REQUEST = 1;

    @ReactMethod
    public void saveJsonDocument(
            final String data,
            final String initialName,
            final Promise promise) {
        try {
            Intent intent = new Intent();
            intent.setAction(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            if (initialName != null) {
                intent.putExtra(Intent.EXTRA_TITLE, initialName);
            }
            intent.setType("application/json");

            ReactApplicationContext context = getReactApplicationContext();
            ActivityEventListener activityEventListener =
                    new ActivityEventListener() {
                        @Override
                        public void onActivityResult(
                                Activity activity, int requestCode, int resultCode, Intent intent) {
                            if (requestCode == SAVE_REQUEST) {
                                try {
                                    if (resultCode == Activity.RESULT_OK) {
                                        if (intent != null) {
                                            final Uri uri = intent.getData();
                                            byte[] bytes = data.getBytes(StandardCharsets.UTF_8);
                                            try (OutputStream os = context.getContentResolver().openOutputStream(uri)) {
                                                os.write(bytes);
                                            }
                                            promise.resolve(true);
                                        }
                                    }
                                } catch (Exception e) {
                                    promise.reject(e);
                                } finally {
                                    promise.resolve(false);
                                    context.removeActivityEventListener(this);
                                }
                            }


                        }

                        @Override
                        public void onNewIntent(Intent intent) {
                        }
                    };

            context.addActivityEventListener(activityEventListener);

            Activity activity = context.getCurrentActivity();
            if (activity != null) {
                activity.startActivityForResult(intent, SAVE_REQUEST);
            } else {
                context.removeActivityEventListener(activityEventListener);
                throw new Exception("activity not found");
            }
        } catch (Exception e) {
            promise.reject(e);
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

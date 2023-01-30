package com.github.meypod.al_azan.modules;

import androidx.annotation.NonNull;
import androidx.work.Data;
import androidx.work.ExistingWorkPolicy;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.concurrent.TimeUnit;

public class WorkModule extends ReactContextBaseJavaModule {
    WorkModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "WorkModule";
    }

    @ReactMethod
    public void scheduleWork(
            String taskName,
            String epochMilli,
            boolean keepAwake,
            boolean allowedInForeground,
            String extra,
            final Promise promise) {

        OneTimeWorkRequest.Builder workRequestBuilder = new OneTimeWorkRequest.Builder(Worker.class);
        workRequestBuilder.addTag(taskName);
        workRequestBuilder.addTag(epochMilli);
        Data.Builder workDataBuilder =
                new Data.Builder()
                        .putString("id", epochMilli)
                        .putString("taskName", taskName)
                        .putString("extra", extra)
                        .putBoolean("keepAwake", keepAwake)
                        .putBoolean("allowedInForeground", allowedInForeground);

        workRequestBuilder.setInputData(workDataBuilder.build());

        final long delay = Long.getLong(epochMilli) - System.currentTimeMillis();

        workRequestBuilder.setInitialDelay(delay, TimeUnit.MILLISECONDS);

        WorkManager workManager = WorkManager.getInstance(getReactApplicationContext());
        workManager.enqueueUniqueWork(
                epochMilli, ExistingWorkPolicy.REPLACE, workRequestBuilder.build());

        promise.resolve(null);
    }

    @ReactMethod
    public void cancelWorkByName(String taskName, Promise promise) {
        WorkManager workManager = WorkManager.getInstance(getReactApplicationContext());
        workManager.cancelUniqueWork(taskName);
        // Remove all cancelled and finished work from its internal database
        // states include SUCCEEDED, FAILED and CANCELLED
        workManager.pruneWork();
        promise.resolve(null);
    }

    @ReactMethod
    public void cancelWorkByTag(String tag, Promise promise) {
        WorkManager workManager = WorkManager.getInstance(getReactApplicationContext());
        workManager.cancelAllWorkByTag(tag);
        // Remove all cancelled and finished work from its internal database
        // states include SUCCEEDED, FAILED and CANCELLED
        workManager.pruneWork();
        promise.resolve(null);
    }

}

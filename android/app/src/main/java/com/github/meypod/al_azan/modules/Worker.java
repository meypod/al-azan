package com.github.meypod.al_azan.modules;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.work.Data;
import androidx.work.WorkerParameters;

import com.facebook.react.HeadlessJsTaskService;
import com.github.meypod.al_azan.UniversalTaskService;

public class Worker extends androidx.work.Worker {
    private final Context context;

    public Worker(
            @NonNull Context context,
            @NonNull WorkerParameters params
    ) {
        super(context, params);
        this.context = context;
    }

    @NonNull
    @Override
    public Result doWork() {
        Bundle extras = bundleExtras();

        Intent service = new Intent(this.context, UniversalTaskService.class);
        service.putExtras(extras);

        this.context.startService(service);
        if (extras.getBoolean("keepAwake")) {
            HeadlessJsTaskService.acquireWakeLockNow(this.context);
        }
        return Result.success();
    }

    private Bundle bundleExtras() {
        Data data = getInputData();
        Bundle extras = new Bundle();
        extras.putString("id", data.getString("id"));
        extras.putString("taskName", data.getString("taskName"));
        extras.putString("extra", data.getString("extra"));
        extras.putBoolean("keepAwake", data.getBoolean("keepAwake", false));
        extras.putBoolean("allowedInForeground", data.getBoolean("allowedInForeground", false));
        return extras;
    }
}

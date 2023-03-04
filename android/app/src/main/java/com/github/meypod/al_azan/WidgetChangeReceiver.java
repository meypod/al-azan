package com.github.meypod.al_azan;

import static com.github.meypod.al_azan.PrayerTimesWidget.requestWidgetUpdate;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class WidgetChangeReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        final String action = intent.getAction();
        if (
            action.equals(Intent.ACTION_DATE_CHANGED)
            || action.equals(Intent.ACTION_TIME_CHANGED)
            || action.equals(Intent.ACTION_LOCALE_CHANGED)
        ) {
            requestWidgetUpdate(context);
        }
    }
}

package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.utils.Utils.getLaunchPendingIntent;

import android.app.Notification;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.github.meypod.al_azan.R;
import com.github.meypod.al_azan.utils.WidgetUtils;

public class NotificationWidgetModule extends ReactContextBaseJavaModule {


    NotificationWidgetModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationWidgetModule";
    }

    @ReactMethod
    public void updateNotification(ReadableMap args, Promise promise) {
        if (args == null) {
            promise.reject("ERROR", "args cannot be null");
            return;
        }
        String channelId = args.getString("channelId");
        String notificationId = args.getString("notificationId");
        String topStartText = args.getString("topStartText");
        String topEndText = args.getString("topEndText");
        boolean adaptiveTheme = args.getBoolean("adaptiveTheme");
        boolean showCountdown = args.getBoolean("showCountdown");
        final String countdownLabel;
        final long countdownBase;
        if (!args.isNull("countdownLabel")) {
            countdownLabel = args.getString("countdownLabel");
            countdownBase = Long.parseLong(args.getString("countdownBase"));
        } else {
            countdownLabel = null;
            countdownBase = 0;
        }

        ReadableArray prayers = args.getArray("prayers");

        if (channelId == null || notificationId == null || topStartText == null || topEndText == null
                || prayers == null) {
            promise.reject("ERROR", "required args were missing.");
            return;
        }


        final int smallLayoutId;
        if (adaptiveTheme) {
            smallLayoutId = R.layout.notif_widget_small_adaptive;
        } else {
            smallLayoutId = R.layout.notif_widget_small;
        }

        RemoteViews notificationLayout = WidgetUtils.getViewUpdate(getReactApplicationContext(),
                smallLayoutId, topStartText, topEndText, prayers);


        final int layoutId;
        if (showCountdown) {
            if (adaptiveTheme) {
                layoutId = R.layout.notif_widget_big_countdown_adaptive;
            } else {
                layoutId = R.layout.notif_widget_big_countdown;
            }
        } else {
            if (adaptiveTheme) {
                layoutId = R.layout.notif_widget_big_adaptive;
            } else {
                layoutId = R.layout.notif_widget_big;
            }
        }

        RemoteViews notificationLayoutExpanded = WidgetUtils.getViewUpdate(
                getReactApplicationContext(),
                layoutId,
                topStartText, topEndText, prayers, countdownLabel, countdownBase);

        Notification customNotification = new NotificationCompat.Builder(
                getReactApplicationContext(), channelId) // channel is created with another module in js
                .setPriority(NotificationCompat.PRIORITY_MAX) // For N and below
                .setSortKey("-1")
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setStyle(new NotificationCompat.DecoratedCustomViewStyle())
                .setCustomContentView(notificationLayout)
                .setCustomBigContentView(notificationLayoutExpanded)
                .setOnlyAlertOnce(true)
                .setOngoing(true)
                .setAutoCancel(false)
                .setShowWhen(false)
                .setContentIntent(getLaunchPendingIntent(getReactApplicationContext()))
                .build();

        NotificationManagerCompat
                .from(getReactApplicationContext())
                .notify(
                        notificationId.hashCode(), // making it possible to cancel with "notifee" module
                        customNotification
                );
        promise.resolve(null);
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

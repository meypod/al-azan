package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.utils.Utils.getLaunchPendingIntent;

import android.app.Notification;
import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.res.ResourcesCompat;

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
    String hijriDate = args.getString("hijriDate");
    String secondaryDate = args.getString("secondaryDate");

    ReadableArray prayers = args.getArray("prayers");

    if (channelId == null || notificationId == null || hijriDate == null || secondaryDate == null
        || prayers == null) {
      promise.reject("ERROR", "required args were missing.");
      return;
    }


    RemoteViews notificationLayout =  WidgetUtils.getViewUpdate(getReactApplicationContext(),
            R.layout.notif_widget_small, hijriDate, secondaryDate, prayers);
    RemoteViews notificationLayoutExpanded = WidgetUtils.getViewUpdate(getReactApplicationContext(),
            R.layout.notif_widget_big, hijriDate, secondaryDate, prayers);

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

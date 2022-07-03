package com.github.meypod.al_azan.modules;

import android.app.Notification;
import android.view.View;
import android.widget.RemoteViews;
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

public class NotificationWidgetModule extends ReactContextBaseJavaModule {

  NotificationWidgetModule(ReactApplicationContext context) {
    super(context);
  }

  private final int[] prayersViewId = {
      R.id.prayer1,
      R.id.prayer2,
      R.id.prayer3,
      R.id.prayer4,
      R.id.prayer5,
      R.id.prayer6,
  };

  private final int[] prayersViewNameId = {
      R.id.prayer1_name,
      R.id.prayer2_name,
      R.id.prayer3_name,
      R.id.prayer4_name,
      R.id.prayer5_name,
      R.id.prayer6_name,
  };

  private final int[] prayersViewTimeId = {
      R.id.prayer1_time,
      R.id.prayer2_time,
      R.id.prayer3_time,
      R.id.prayer4_time,
      R.id.prayer5_time,
      R.id.prayer6_time,
  };

  @NonNull
  @Override
  public String getName() {
    return "NotificationWidgetModule";
  }

  private RemoteViews createNotifView(String[] names, String[] times, int activeIndex) {
    // TODO activeIndex style prayer index view as yellow
    RemoteViews view = new RemoteViews(getReactApplicationContext().getPackageName(),
        R.layout.notif_widget_small);

    for (int i = 0; i < names.length; i++) {
      view.setTextViewText(prayersViewNameId[i], names[i]);
      view.setTextViewText(prayersViewTimeId[i], times[i]);
    }

    if (activeIndex != -1) {
      int color = ResourcesCompat.getColor(getReactApplicationContext().getResources(),
          R.color.active_prayer,
          null);
      view.setTextColor(prayersViewNameId[activeIndex], color);
      view.setTextColor(prayersViewTimeId[activeIndex], color);
    }

    for (int i = names.length; i < prayersViewId.length; i++) {
      view.setViewVisibility(prayersViewId[i], View.GONE);
    }
    return view;
  }

  private RemoteViews createNotifBigView(String hijriDate, String dayAndMonth, String[] names,
      String[] times, int activeIndex) {
    RemoteViews bigView = new RemoteViews(getReactApplicationContext().getPackageName(),
        R.layout.notif_widget_big);

    bigView.setTextViewText(R.id.hijri_date_v, hijriDate);
    bigView.setTextViewText(R.id.day_v, dayAndMonth);

    for (int i = 0; i < names.length; i++) {
      bigView.setTextViewText(prayersViewNameId[i], names[i]);
      bigView.setTextViewText(prayersViewTimeId[i], times[i]);
    }

    if (activeIndex != -1) {
      int color = ResourcesCompat.getColor(getReactApplicationContext().getResources(),
          R.color.active_prayer,
          null);
      bigView.setTextColor(prayersViewNameId[activeIndex], color);
      bigView.setTextColor(prayersViewTimeId[activeIndex], color);
    }

    for (int i = names.length; i < prayersViewId.length; i++) {
      bigView.setViewVisibility(prayersViewId[i], View.GONE);
    }
    return bigView;
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
    String dayAndMonth = args.getString("dayAndMonth");

    ReadableArray prayers = args.getArray("prayers");

    if (channelId == null || notificationId == null || hijriDate == null || dayAndMonth == null
        || prayers == null) {
      promise.reject("ERROR", "required args were missing.");
      return;
    }

    String[] names = new String[prayers.size()];
    String[] times = new String[prayers.size()];
    int activeIndex = -1;
    for (int i = 0; i < names.length; i++) {
      ReadableArray nameTimePair = prayers.getArray(i);
      names[i] = nameTimePair.getString(0);
      times[i] = nameTimePair.getString(1);
      boolean isActive = nameTimePair.getBoolean(2);
      if (isActive) {
        activeIndex = i;
      }
    }

    RemoteViews notificationLayout = createNotifView(names, times, activeIndex);
    RemoteViews notificationLayoutExpanded = createNotifBigView(hijriDate, dayAndMonth, names,
        times,
        activeIndex);

    Notification customNotification = new NotificationCompat.Builder(
        getReactApplicationContext(), channelId) // channel is created with another module in js
        .setPriority(NotificationCompat.PRIORITY_DEFAULT) // For N and below
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setSmallIcon(R.drawable.ic_stat_name)
        .setStyle(new NotificationCompat.DecoratedCustomViewStyle())
        .setCustomContentView(notificationLayout)
        .setCustomBigContentView(notificationLayoutExpanded)
        .setOnlyAlertOnce(true)
        .setOngoing(true)
        .setAutoCancel(false)
        .setShowWhen(false)
        .build();// TODO add setContentIntent

    NotificationManagerCompat
        .from(getReactApplicationContext())
        .notify(
            notificationId.hashCode(), // making it possible to cancel with "notifee" module
            customNotification
        );
    promise.resolve(null);
  }

}

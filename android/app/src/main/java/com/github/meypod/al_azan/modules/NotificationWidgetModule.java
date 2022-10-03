package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.utils.Utils.getLaunchPendingIntent;
import static com.github.meypod.al_azan.utils.Utils.prayersViewId;
import static com.github.meypod.al_azan.utils.Utils.prayersViewNameId;
import static com.github.meypod.al_azan.utils.Utils.prayersViewTimeId;

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

public class NotificationWidgetModule extends ReactContextBaseJavaModule {


  NotificationWidgetModule(ReactApplicationContext context) {
    super(context);
  }

  @NonNull
  @Override
  public String getName() {
    return "NotificationWidgetModule";
  }

  public static RemoteViews createNotifView(Context context, String[] names, String[] times,
      int activeIndex) {
    RemoteViews view = new RemoteViews(context.getPackageName(),
        R.layout.notif_widget_small);

    if (names == null || times == null) {
      names = new String[]{"-", "-", "-", "-", "-", "-"};
      times = new String[]{"--:--", "--:--", "--:--", "--:--", "--:--", "--:--"};
    }

    for (int i = 0; i < names.length; i++) {
      view.setTextViewText(prayersViewNameId[i], names[i]);
      view.setTextViewText(prayersViewTimeId[i], times[i]);
    }

    if (activeIndex != -1) {
      int activeColor = ResourcesCompat.getColor(context.getResources(),
          R.color.active_prayer,
          null);
      view.setTextColor(prayersViewNameId[activeIndex], activeColor);
      view.setTextColor(prayersViewTimeId[activeIndex], activeColor);
    }

    for (int i = names.length; i < prayersViewId.length; i++) {
      view.setViewVisibility(prayersViewId[i], View.GONE);
    }
    return view;
  }

  public static RemoteViews createNotifBigView(Context context, String hijriDate,
      String dayAndMonth, String[] names,
      String[] times, int activeIndex) {
    RemoteViews bigView = new RemoteViews(context.getPackageName(),
        R.layout.notif_widget_big);

    if (names == null || times == null) {
      names = new String[]{"-", "-", "-", "-", "-", "-"};
      times = new String[]{"--:--", "--:--", "--:--", "--:--", "--:--", "--:--"};
    }

    bigView.setTextViewText(R.id.hijri_date_v, hijriDate);
    bigView.setTextViewText(R.id.day_v, dayAndMonth);

    // resetting color is needed for widget because of partial updates
    @ColorInt int color = ResourcesCompat.getColor(context.getResources(),
        R.color.secondary_text_color,
        null);

    for (int i = 0; i < names.length; i++) {
      bigView.setTextViewText(prayersViewNameId[i], names[i]);
      bigView.setTextViewText(prayersViewTimeId[i], times[i]);
      bigView.setTextColor(prayersViewNameId[i], color);
      bigView.setTextColor(prayersViewTimeId[i], color);
    }

    if (activeIndex != -1) {
      int activeColor = ResourcesCompat.getColor(context.getResources(),
          R.color.active_prayer,
          null);
      bigView.setTextColor(prayersViewNameId[activeIndex], activeColor);
      bigView.setTextColor(prayersViewTimeId[activeIndex], activeColor);
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

    RemoteViews notificationLayout = createNotifView(getReactApplicationContext(), names, times,
        activeIndex);
    RemoteViews notificationLayoutExpanded = createNotifBigView(getReactApplicationContext(),
        hijriDate, dayAndMonth, names,
        times,
        activeIndex);

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

}

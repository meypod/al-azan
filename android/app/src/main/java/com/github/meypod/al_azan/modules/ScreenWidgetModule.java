package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.modules.NotificationWidgetModule.createNotifBigView;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build.VERSION;
import android.widget.RemoteViews;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.github.meypod.al_azan.PrayerTimesWidget;
import com.github.meypod.al_azan.R;

public class ScreenWidgetModule extends ReactContextBaseJavaModule {

  ScreenWidgetModule(ReactApplicationContext context) {
    super(context);
  }

  @NonNull
  @Override
  public String getName() {
    return "ScreenWidgetModule";
  }

  @ReactMethod
  public void updateScreenWidget(ReadableMap args, Promise promise) {
    if (args == null) {
      promise.reject("ERROR", "args cannot be null");
      return;
    }
    String hijriDate = args.getString("hijriDate");
    String dayAndMonth = args.getString("dayAndMonth");
    ReadableArray prayers = args.getArray("prayers");

    if (prayers == null || hijriDate == null || dayAndMonth == null) {
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

    RemoteViews notificationLayout = createNotifBigView(getReactApplicationContext(), hijriDate,
        dayAndMonth, names, times,
        activeIndex);

    // request widget update when user touches widget
    int flag = PendingIntent.FLAG_UPDATE_CURRENT;
    if (VERSION.SDK_INT >= 23) {
      flag = flag | PendingIntent.FLAG_IMMUTABLE;
    }
    final PackageManager pm = getReactApplicationContext().getPackageManager();
    final Intent intent = pm.getLaunchIntentForPackage(
        getReactApplicationContext().getPackageName());
    PendingIntent launchIntent =
        PendingIntent.getActivity(getReactApplicationContext(), 0,
            intent, flag);
    notificationLayout.setOnClickPendingIntent(R.id.notif_widget_big_layout, launchIntent);

    AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getReactApplicationContext());
    ComponentName screenWidget = new ComponentName(getReactApplicationContext(),
        PrayerTimesWidget.class);
    int[] widgetIds = appWidgetManager.getAppWidgetIds(screenWidget);
    appWidgetManager.updateAppWidget(widgetIds, notificationLayout);

    promise.resolve(null);
  }
}

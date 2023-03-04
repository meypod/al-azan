package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.utils.Utils.getLaunchPendingIntent;
import static com.github.meypod.al_azan.utils.Utils.prayersViewId;
import static com.github.meypod.al_azan.utils.Utils.prayersViewNameId;
import static com.github.meypod.al_azan.utils.Utils.prayersViewTimeId;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.github.meypod.al_azan.PrayerTimesWidget;
import com.github.meypod.al_azan.PrayerTimesWidgetAdaptive;
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

  private RemoteViews getViewUpdate(String hijriDate, String secondaryDate, ReadableArray prayers, boolean adaptiveTheme){
    Context context = getReactApplicationContext();

    RemoteViews widgetView = new RemoteViews(context.getPackageName(),
            adaptiveTheme ? R.layout.screen_widget_adaptive : R.layout.screen_widget);

    String[] names = new String[prayers.size()];
    String[] times = new String[prayers.size()];
    int activeIndex = -1;
    for (int i = 0; i < names.length; i++) {
      ReadableArray nameTimePair = prayers.getArray(i);
      names[i] = nameTimePair.getString(0);
      times[i] = nameTimePair.getString(1);
      final boolean isActive = nameTimePair.getBoolean(2);
      if (isActive) {
        activeIndex = i;
      }
    }

    // set top views text first
    widgetView.setTextViewText(R.id.hijri_date_v, hijriDate);
    widgetView.setTextViewText(R.id.secondary_date_v, secondaryDate);

    // hide all views first
    for (int i = 0; i < prayersViewId.length; i++) {
      widgetView.setViewVisibility(prayersViewId[i], View.GONE);
    }

    if (activeIndex == -1) {
      // no prayer is active, simply make all visible
      for (int i = 0; i < names.length * 2; i+=2) {
        widgetView.setViewVisibility(prayersViewId[i], View.VISIBLE);
        widgetView.setTextViewText(prayersViewNameId[i], names[Math.floorDiv(i, 2)]);
        widgetView.setTextViewText(prayersViewTimeId[i], times[Math.floorDiv(i, 2)]);
      }
    } else {
      // make all inactive prayer views visible except one that is same as active
      for (int i = 1; i < names.length * 2; i+=2) {
        int valueIndex = Math.floorDiv(i, 2);
        if (valueIndex == activeIndex) {
          widgetView.setViewVisibility(prayersViewId[i], View.VISIBLE);
          widgetView.setTextViewText(prayersViewNameId[i], names[valueIndex]);
          widgetView.setTextViewText(prayersViewTimeId[i], times[valueIndex]);
        } else {
          widgetView.setViewVisibility(prayersViewId[i-1], View.VISIBLE);
          widgetView.setTextViewText(prayersViewNameId[i-1], names[valueIndex]);
          widgetView.setTextViewText(prayersViewTimeId[i-1], times[valueIndex]);
        }

      }
    }

    widgetView.setOnClickPendingIntent(R.id.screen_widget_layout,
            getLaunchPendingIntent(getReactApplicationContext()));

    return widgetView;
  }

  @ReactMethod
  public void updateScreenWidget(ReadableMap args, Promise promise) {
    if (args == null) {
      promise.reject("ERROR", "args cannot be null");
      return;
    }
    String hijriDate = args.getString("hijriDate");
    String secondaryDate = args.getString("secondaryDate");
    ReadableArray prayers = args.getArray("prayers");

    if (prayers == null || hijriDate == null || secondaryDate == null) {
      promise.reject("ERROR", "required args were missing.");
      return;
    }

    AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getReactApplicationContext());

    {
      ComponentName screenWidget = new ComponentName(getReactApplicationContext(),
              PrayerTimesWidget.class);
      int[] classicWidgetIds = appWidgetManager.getAppWidgetIds(screenWidget);
      if (classicWidgetIds.length > 0) {
        RemoteViews widgetView = getViewUpdate(hijriDate, secondaryDate, prayers, false);
        appWidgetManager.updateAppWidget(classicWidgetIds, widgetView);
      }
    }

    {
      ComponentName screenWidget = new ComponentName(getReactApplicationContext(),
              PrayerTimesWidgetAdaptive.class);
      int[] adaptiveWidgetIds = appWidgetManager.getAppWidgetIds(screenWidget);
      if (adaptiveWidgetIds.length > 0) {
        RemoteViews widgetView = getViewUpdate(hijriDate, secondaryDate, prayers, true);
        appWidgetManager.updateAppWidget(adaptiveWidgetIds, widgetView);
      }
    }

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

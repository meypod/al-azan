package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.utils.Utils.getLaunchPendingIntent;
import static com.github.meypod.al_azan.utils.Utils.prayersViewId;
import static com.github.meypod.al_azan.utils.Utils.prayersViewNameId;
import static com.github.meypod.al_azan.utils.Utils.prayersViewTimeId;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.TextView;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.core.content.res.ResourcesCompat;
import androidx.core.widget.TextViewCompat;

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

  private @ColorInt int getPrayerTextColor(boolean adaptiveTheme) {
    if (adaptiveTheme) {
      Resources.Theme currentTheme = getReactApplicationContext().getTheme();
      int styleResId = R.style.MyDynamicTheme;

      // Create a TypedArray from the style
      TypedArray styledAttributes = currentTheme.obtainStyledAttributes(styleResId, new int[] {
              android.R.attr.isLightTheme,
              android.R.attr.textColorSecondary,
              android.R.attr.textColorSecondaryInverse,
      });

      boolean isLightTheme = styledAttributes.getBoolean(0, true);
      int textColorSecondary = styledAttributes.getColor(1, 0);
      int textColorSecondaryInverse = styledAttributes.getColor(2, 0);
      styledAttributes.recycle();

      return isLightTheme ? textColorSecondary : textColorSecondaryInverse;
    } else {
      return ResourcesCompat.getColor(getReactApplicationContext().getResources(),
              R.color.secondary_text_color,
              null);
    }
  }

  private @ColorInt int getActivePrayerColor(boolean adaptiveTheme) {
    if (adaptiveTheme) {
      Resources.Theme currentTheme = getReactApplicationContext().getTheme();
      int styleResId = R.style.MyDynamicTheme;

      TypedArray styledAttributes = currentTheme.obtainStyledAttributes(styleResId, new int[] {
              android.R.attr.colorAccent,
      });

      int colorAccent = styledAttributes.getColor(0, 0);
      styledAttributes.recycle();

      return colorAccent;
    } else {
      return ResourcesCompat.getColor(getReactApplicationContext().getResources(),
              R.color.active_prayer,
              null);
    }
  }

  private RemoteViews getViewUpdate(String hijriDate, String secondaryDate, ReadableArray prayers, boolean adaptiveTheme){
    Context context = getReactApplicationContext();

    RemoteViews widgetView = new RemoteViews(context.getPackageName(),
            R.layout.screen_widget);

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

    for (int i = 0; i < names.length; i++) {
      widgetView.setViewVisibility(prayersViewId[i], View.VISIBLE);
    }

    for (int i = names.length; i < prayersViewId.length; i++) {
      widgetView.setViewVisibility(prayersViewId[i], View.GONE);
    }

    widgetView.setTextViewText(R.id.hijri_date_v, hijriDate);
    widgetView.setTextViewText(R.id.day_v, secondaryDate);

    // resetting color is needed for widget because of partial updates
    @ColorInt int color = getPrayerTextColor(adaptiveTheme);

    for (int i = 0; i < names.length; i++) {
      widgetView.setTextViewText(prayersViewNameId[i], names[i]);
      widgetView.setTextViewText(prayersViewTimeId[i], times[i]);
      widgetView.setTextColor(prayersViewNameId[i], color);
      widgetView.setTextColor(prayersViewTimeId[i], color);
    }

    if (activeIndex != -1) {
      int activeColor = getActivePrayerColor(adaptiveTheme);
      widgetView.setTextColor(prayersViewNameId[activeIndex], activeColor);
      widgetView.setTextColor(prayersViewTimeId[activeIndex], activeColor);
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
    String dayAndMonth = args.getString("dayAndMonth");
    ReadableArray prayers = args.getArray("prayers");

    if (prayers == null || hijriDate == null || dayAndMonth == null) {
      promise.reject("ERROR", "required args were missing.");
      return;
    }

    AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getReactApplicationContext());

    {
      ComponentName screenWidget = new ComponentName(getReactApplicationContext(),
              PrayerTimesWidget.class);
      int[] classicWidgetIds = appWidgetManager.getAppWidgetIds(screenWidget);
      if (classicWidgetIds.length > 0) {
        RemoteViews widgetView = getViewUpdate(hijriDate, dayAndMonth, prayers, false);
        appWidgetManager.updateAppWidget(classicWidgetIds, widgetView);
      }
    }

    {
      ComponentName screenWidget = new ComponentName(getReactApplicationContext(),
              PrayerTimesWidgetAdaptive.class);
      int[] adaptiveWidgetIds = appWidgetManager.getAppWidgetIds(screenWidget);
      if (adaptiveWidgetIds.length > 0) {
        RemoteViews widgetView = getViewUpdate(hijriDate, dayAndMonth, prayers, true);
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

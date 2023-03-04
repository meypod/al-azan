package com.github.meypod.al_azan.modules;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
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
import com.github.meypod.al_azan.utils.WidgetUtils;

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
                RemoteViews widgetView =  WidgetUtils.getViewUpdate(getReactApplicationContext(),
                        R.layout.screen_widget, hijriDate, secondaryDate, prayers);
                appWidgetManager.updateAppWidget(classicWidgetIds, widgetView);
            }
        }

        {
            ComponentName screenWidget = new ComponentName(getReactApplicationContext(),
                    PrayerTimesWidgetAdaptive.class);
            int[] adaptiveWidgetIds = appWidgetManager.getAppWidgetIds(screenWidget);
            if (adaptiveWidgetIds.length > 0) {
                RemoteViews widgetView = WidgetUtils.getViewUpdate(getReactApplicationContext(),
                        R.layout.screen_widget_adaptive, hijriDate, secondaryDate, prayers);
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

package com.github.meypod.al_azan.modules;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
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
        String topStartText = args.getString("topStartText");
        String topEndText = args.getString("topEndText");
        ReadableArray prayers = args.getArray("prayers");
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

        if (prayers == null || topStartText == null || topEndText == null) {
            promise.reject("ERROR", "required args were missing.");
            return;
        }

        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(getReactApplicationContext());

        {
            // normal widget
            final int layoutId;
            if (showCountdown) {
                if (adaptiveTheme) {
                    layoutId = R.layout.screen_widget_countdown_adaptive;
                } else {
                    layoutId = R.layout.screen_widget_countdown;
                }
            } else {
                if (adaptiveTheme) {
                    layoutId = R.layout.screen_widget_adaptive;
                } else {
                    layoutId = R.layout.screen_widget;
                }
            }
            ComponentName screenWidget = new ComponentName(getReactApplicationContext(),
                    PrayerTimesWidget.class);
            int[] classicWidgetIds = appWidgetManager.getAppWidgetIds(screenWidget);
            if (classicWidgetIds.length > 0) {
                RemoteViews widgetView = WidgetUtils.getViewUpdate(getReactApplicationContext(),
                        layoutId, topStartText, topEndText, prayers, countdownLabel, countdownBase);
                appWidgetManager.updateAppWidget(classicWidgetIds, widgetView);
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

package com.github.meypod.al_azan.utils;

import static com.github.meypod.al_azan.utils.Utils.getLaunchPendingIntent;

import android.content.Context;
import android.icu.text.DecimalFormat;
import android.icu.text.DecimalFormatSymbols;
import android.icu.text.SimpleDateFormat;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

import com.facebook.react.bridge.ReadableArray;
import com.github.meypod.al_azan.R;

import java.util.Date;
import java.util.Locale;

public class WidgetUtils {
    public static final int[] prayersViewId = {
            R.id.prayer1,
            R.id.prayer1active,
            R.id.prayer2,
            R.id.prayer2active,
            R.id.prayer3,
            R.id.prayer3active,
            R.id.prayer4,
            R.id.prayer4active,
            R.id.prayer5,
            R.id.prayer5active,
            R.id.prayer6,
            R.id.prayer6active,
    };

    public static final int[] prayersViewNameId = {
            R.id.prayer1_name,
            R.id.prayer1active_name,
            R.id.prayer2_name,
            R.id.prayer2active_name,
            R.id.prayer3_name,
            R.id.prayer3active_name,
            R.id.prayer4_name,
            R.id.prayer4active_name,
            R.id.prayer5_name,
            R.id.prayer5active_name,
            R.id.prayer6_name,
            R.id.prayer6active_name,
    };

    public static final int[] prayersViewTimeId = {
            R.id.prayer1_time,
            R.id.prayer1active_time,
            R.id.prayer2_time,
            R.id.prayer2active_time,
            R.id.prayer3_time,
            R.id.prayer3active_time,
            R.id.prayer4_time,
            R.id.prayer4active_time,
            R.id.prayer5_time,
            R.id.prayer5active_time,
            R.id.prayer6_time,
            R.id.prayer6active_time,
    };

    public static RemoteViews getViewUpdate(Context context, int layoutResourceId,String topStartText, String topEndText, ReadableArray prayers){
        return getViewUpdate(context, layoutResourceId, topStartText, topEndText, prayers, null, 0);
    }

    public static RemoteViews getViewUpdate(Context context, int layoutResourceId,String topStartText, String topEndText, ReadableArray prayers,String countdownLabel, long countdownBase){
        RemoteViews widgetView = new RemoteViews(context.getPackageName(), layoutResourceId);

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
        widgetView.setTextViewText(R.id.top_start_text, topStartText);
        widgetView.setTextViewText(R.id.top_end_text, topEndText);

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

        widgetView.setOnClickPendingIntent(R.id.screen_widget_layout, getLaunchPendingIntent(context));

        if (countdownLabel != null) {
            widgetView.setTextViewText(R.id.countdown_label, countdownLabel);
            widgetView.setChronometer(R.id.countdown, SystemClock.elapsedRealtime() + (countdownBase - System.currentTimeMillis()),null, true);
        }

        return widgetView;
    }
}

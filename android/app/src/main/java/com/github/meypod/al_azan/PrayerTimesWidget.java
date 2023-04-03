package com.github.meypod.al_azan;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/**
 * Implementation of App Widget functionality.
 */
public class PrayerTimesWidget extends AppWidgetProvider {

  public static void requestWidgetUpdate(Context context) {
    ReactUtils.startHeadlessTask("update_screen_widget_task",
            null,
            30000,
            null);
  }

  @Override
  public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
    requestWidgetUpdate(context);
  }

  @Override
  public void onEnabled(Context context) {
    // Enter relevant functionality for when the first widget is created
  }

  @Override
  public void onDisabled(Context context) {
    // Enter relevant functionality for when the last widget is disabled
  }
}
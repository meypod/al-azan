package com.github.meypod.al_azan;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

/**
 * Implementation of App Widget functionality.
 */
public class PrayerTimesWidget extends AppWidgetProvider {

  public static void requestWidgetUpdate(Context context) {
    Intent service = new Intent(context, UniversalTaskService.class);
    Bundle bundle = new Bundle();

    bundle.putLong("timeout", 30000);
    bundle.putBoolean("allowedInForeground", true);
    bundle.putString("taskName", "update_screen_widget_task");
    service.putExtras(bundle);

    context.startService(service);
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
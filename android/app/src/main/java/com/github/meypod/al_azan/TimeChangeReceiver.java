package com.github.meypod.al_azan;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

public class TimeChangeReceiver extends BroadcastReceiver {

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
  public void onReceive(Context context, Intent intent) {
    if (intent.getAction().equals(Intent.ACTION_DATE_CHANGED)
        || intent.getAction().equals(Intent.ACTION_TIME_CHANGED)) {
      requestWidgetUpdate(context);
    }
  }
}

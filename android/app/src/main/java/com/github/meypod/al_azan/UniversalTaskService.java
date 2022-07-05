package com.github.meypod.al_azan;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import javax.annotation.Nullable;

public class UniversalTaskService extends HeadlessJsTaskService {

  @Override
  protected @Nullable
  HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras != null) {
      long timeout = intent.getLongExtra("timeout", 5000);
      boolean allowedInForeground = intent.getBooleanExtra("allowedInForeground", false);
      String taskName = intent.getStringExtra("taskName");

      return new HeadlessJsTaskConfig(
          taskName,
          Arguments.fromBundle(extras),
          timeout, // timeout for the task
          allowedInForeground // optional: defines whether or not  the task is allowed in
          // foreground. Default is
          // false
      );
    }
    return null;
  }
}

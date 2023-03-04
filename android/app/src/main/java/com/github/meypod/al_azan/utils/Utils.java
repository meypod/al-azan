// with help from https://github.com/doublesymmetry/react-native-track-player/blob/9c1337283d940d0ef1a0103a7c2672ce058e0838/android/src/main/java/com/doublesymmetry/trackplayer/utils/Utils.kt

package com.github.meypod.al_azan.utils;

import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.net.Uri;
import android.os.Build.VERSION;
import android.os.Bundle;
import androidx.annotation.Nullable;
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper;
import com.github.meypod.al_azan.R;

public class Utils {

  public static final String RAW_RESOURCE_PREFIX = "rawresource:///";

  public static int getIdFromRawResourceUri(Uri uri) {
    if (!uri.toString().startsWith(RAW_RESOURCE_PREFIX)) {
      return 0;
    }
    String id = uri.getLastPathSegment();
    try {
      return Integer.parseInt(id);
    } catch (Exception ignored) {
      return 0;
    }
  }

  public static PendingIntent getLaunchPendingIntent(Context context) {
    final PackageManager pm = context.getPackageManager();
    final Intent intent = pm.getLaunchIntentForPackage(context.getPackageName());

    int flag = PendingIntent.FLAG_UPDATE_CURRENT;
    if (VERSION.SDK_INT >= 23) {
      flag = flag | PendingIntent.FLAG_IMMUTABLE;
    }

    return PendingIntent.getActivity(context, 0, intent, flag);
  }


  public static int getRawResourceId(Context context, Bundle data, @Nullable String key) {
    try {
      Object nameOrId = data.get(key);
      if (nameOrId == null) {
        throw new Exception("getRawResourceId: key not found in data");
      }

      String name = nameOrId + "";
      if (!name.isEmpty()) {
        name = name.toLowerCase().replace("-", "_");
        try {
          return (int) Math.floor(Double.parseDouble(name));
        } catch (NumberFormatException ex) {
          return context.getResources().getIdentifier(name, "raw", context.getPackageName());
        }
      }
    } catch (Exception ignored) {
      return 0;
    }
    return 0;
  }


  public static Uri getUri(Context context, @Nullable Bundle data, String key) {
    if (data != null) {
      if (data.containsKey(key)) {
        Object obj = data.get(key);
        if (obj instanceof String) {
          String nameOrUriStr = (String) obj;
          ResourceDrawableIdHelper helper = ResourceDrawableIdHelper.getInstance();
          int id = helper.getResourceDrawableId(context, nameOrUriStr);
          if (id > 0) {
            // In production, we can obtain the resource uri
            Resources res = context.getResources();
            return new Uri.Builder()
                .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
                .authority(res.getResourcePackageName(id))
                .appendPath(res.getResourceTypeName(id))
                .appendPath(res.getResourceEntryName(id))
                .build();
          } else {
            // During development, the resources might come directly from the metro server
            return Uri.parse(nameOrUriStr);
          }
        }
      }
    }
    return null;
  }

}

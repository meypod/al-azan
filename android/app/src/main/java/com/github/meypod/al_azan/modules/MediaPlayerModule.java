package com.github.meypod.al_azan.modules;
// with help from https://github.com/doublesymmetry/react-native-track-player

import static com.github.meypod.al_azan.utils.Utils.RAW_RESOURCE_PREFIX;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.database.Cursor;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.github.meypod.al_azan.utils.Async;
import com.github.meypod.al_azan.utils.Utils;

public class MediaPlayerModule extends ReactContextBaseJavaModule implements ServiceConnection {

  public static ReactApplicationContext ctx;
  private Promise playerSetupPromise;
  private MediaPlayerService.MusicBinder binder = null;
  private boolean isServiceBound = false;

  private MediaPlayerService mediaPlayerService;

  MediaPlayerModule(ReactApplicationContext context) {
    super(context);
    ctx = context;
  }

  @NonNull
  @Override
  public String getName() {
    return "MediaPlayerModule";
  }

  @Override
  public void onCatalystInstanceDestroy() {
    if (mediaPlayerService != null) {
      mediaPlayerService.destroy();
      mediaPlayerService = null;
    }
    unbindFromService();
  }

  @Override
  public void onServiceConnected(ComponentName name, IBinder service) {
    binder = (MediaPlayerService.MusicBinder) service;
    mediaPlayerService = binder.service;
    mediaPlayerService.setupPlayer();

    if (playerSetupPromise != null) {
      playerSetupPromise.resolve(null);
      playerSetupPromise = null;
    }
    isServiceBound = true;
  }

  @Override
  public void onServiceDisconnected(ComponentName name) {
    if (mediaPlayerService != null) {
      mediaPlayerService.destroy();
    }
    isServiceBound = false;
    binder = null;
  }

  private void unbindFromService() {
    if (isServiceBound) {
      try {
        ctx.unbindService(this);
      } catch (Exception e) {
        Log.d("MediaPlayerModule", "Tried to unbind service while it wasn't binded");
      }
    }
    isServiceBound = false;
    binder = null;
  }

  @ReactMethod
  public void setupPlayer(Promise promise) {
    if (isServiceBound) {
      promise.resolve(null);
      return;
    } else if (playerSetupPromise != null) {
      promise.reject("ERROR", "already setting up player.");
      return;
    }

    playerSetupPromise = promise;

    Intent mediaPlayerServiceIntent = new Intent(ctx, MediaPlayerService.class);
    ctx.bindService(mediaPlayerServiceIntent, this, Context.BIND_AUTO_CREATE);
  }

  @ReactMethod
  public void destroy(Promise promise) {
    if (mediaPlayerService != null) {
      mediaPlayerService.destroy();
    }
    unbindFromService();
    promise.resolve(null);
  }

  @ReactMethod
  public void setVolume(float volume, Promise promise) {
    if (mediaPlayerService != null) {
      mediaPlayerService.setVolume(volume);
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void setDataSource(ReadableMap data, Promise promise) {
    Bundle bundle = Arguments.toBundle(data);
    if (bundle == null) {
      promise.reject("ERROR", "arguments cannot be null");
      return;
    }
    if (mediaPlayerService != null) {
      Uri uri;
      int resourceId = Utils.getRawResourceId(ctx, bundle, "uri");
      if (resourceId == 0) {
        uri = Utils.getUri(ctx, bundle, "uri");
      } else {
        uri = Uri.parse(RAW_RESOURCE_PREFIX + resourceId);
      }
      boolean isLoopUri = bundle.getBoolean("loop", false);
      boolean preferExternalDevice = bundle.getBoolean("preferExternalDevice", false);
      // uri can be null
      mediaPlayerService.setDataSource(uri, isLoopUri, preferExternalDevice, promise);
    } else {
      promise.reject("ERROR", "MediaPlayer is not set up yet.");
    }
  }

  @ReactMethod
  public void getState(Promise promise) {
    String state = "stopped";
    if (mediaPlayerService != null) {
      state = mediaPlayerService.getState();
    }
    promise.resolve(state);
  }

  @ReactMethod
  public void start(Promise promise) {
    if (mediaPlayerService != null) {
      mediaPlayerService.start(false);
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void stop(Promise promise) {
    if (mediaPlayerService != null) {
      mediaPlayerService.stop();
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void pause(Promise promise) {
    if (mediaPlayerService != null) {
      mediaPlayerService.pause();
    }
    promise.resolve(null);
  }

  @ReactMethod
  public void getRingtones(Promise promise) {
    Async.execute(new Async.Task<Object>() {

      @Override
      public Object doAsync() {
        WritableArray ringtones = Arguments.createArray();
        try {
          {
            // NOTIFICATION DEFAULT Option
            WritableMap map = Arguments.createMap();
            map.putString("id", "default");
            map.putString("label", "");
            map.putString("filepath", null);
            map.putBoolean("notif", true);
            ringtones.pushMap(map);
          }

          {
            // NOTIFICATIONS
            RingtoneManager manager = new RingtoneManager(getReactApplicationContext());
            manager.setType(RingtoneManager.TYPE_NOTIFICATION);
            Cursor cursor = manager.getCursor();
            while (cursor.moveToNext()) {
              Long id = cursor.getLong(RingtoneManager.ID_COLUMN_INDEX);
              String title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);

              Uri ringtoneURI = manager.getRingtoneUri(cursor.getPosition());
              WritableMap map = Arguments.createMap();
              map.putString("id", Long.toString(id));
              map.putString("label", title);
              map.putString("filepath", ringtoneURI.toString());
              map.putBoolean("notif", true);
              ringtones.pushMap(map);
            }
          }

          {
            // ALARMS
            RingtoneManager manager = new RingtoneManager(getReactApplicationContext());
            manager.setType(RingtoneManager.TYPE_ALARM);
            Cursor cursor = manager.getCursor();
            while (cursor.moveToNext()) {
              Long id = cursor.getLong(RingtoneManager.ID_COLUMN_INDEX);
              String title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);

              Uri ringtoneURI = manager.getRingtoneUri(cursor.getPosition());
              WritableMap map = Arguments.createMap();
              map.putString("id", Long.toString(id));
              map.putString("label", title);
              map.putString("filepath", ringtoneURI.toString());
              map.putBoolean("loop", true);
              ringtones.pushMap(map);
            }
          }

          {
            // RINGTONES
            RingtoneManager manager = new RingtoneManager(getReactApplicationContext());
            manager.setType(RingtoneManager.TYPE_RINGTONE);
            Cursor cursor = manager.getCursor();
            while (cursor.moveToNext()) {
              Long id = cursor.getLong(RingtoneManager.ID_COLUMN_INDEX);
              String title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX);

              Uri ringtoneURI = manager.getRingtoneUri(cursor.getPosition());
              WritableMap map = Arguments.createMap();
              map.putString("id", Long.toString(id));
              map.putString("label", title);
              map.putString("filepath", ringtoneURI.toString());
              map.putBoolean("loop", true);
              ringtones.pushMap(map);
            }
          }

        } catch (Exception ignored) {
        }
        return ringtones;
      }

      @Override
      public void doSync(Object ringtones) {
        promise.resolve(ringtones);
      }

    });
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

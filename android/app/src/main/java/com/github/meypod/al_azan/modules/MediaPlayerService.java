package com.github.meypod.al_azan.modules;

import static com.github.meypod.al_azan.modules.MediaPlayerModule.ctx;
import static com.github.meypod.al_azan.utils.Utils.getIdFromRawResourceUri;

import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.content.res.Resources;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.AudioManager.OnAudioFocusChangeListener;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Binder;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.annotation.MainThread;
import androidx.annotation.Nullable;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MediaPlayerService extends HeadlessJsTaskService implements
    MediaPlayer.OnCompletionListener, MediaPlayer.OnPreparedListener, MediaPlayer.OnErrorListener,
    OnAudioFocusChangeListener {

  private static final String STATE_STOPPED = "stopped";
  private static final String STATE_STARTED = "started";
  private static final String STATE_PAUSED = "paused";


  private MediaPlayer player;
  private boolean wasPlaying = false;
  private boolean isPaused = false;
  private Promise setDataSourcePromise = null;


  @Nullable
  @Override
  protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    return new HeadlessJsTaskConfig("MediaPlayer", Arguments.createMap(), 0, true);
  }

  @Override
  public void onHeadlessJsTaskFinish(int taskId) {
    // Overridden to prevent the service from being terminated
  }

  @Override
  public void onAudioFocusChange(int focusChange) {
    if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
      if (wasPlaying) {
        start();
      }
    } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
      if (isPlaying()) {
        wasPlaying = true;
      }
      pause();
    }
  }

  @MainThread
  public boolean isPlaying() {
    if (player != null) {
      return player.isPlaying();
    }
    return false;
  }

  @MainThread
  public void pause() {
    try {
      player.pause();
      isPaused = true;
      ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("state", STATE_PAUSED);
    } catch (Exception ignored) {
    }
  }

  @MainThread
  public void stop() {
    try {
      player.stop();
      ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("state", STATE_STOPPED);
    } catch (Exception ignored) {
      AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
      audioManager.abandonAudioFocus(this);
    }
  }

  @MainThread
  public void start() {
    AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
    try {
      audioManager.requestAudioFocus(this, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN);
      player.start();
      isPaused = false;
      ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("state", STATE_STARTED);
    } catch (Exception ignored) {
      audioManager.abandonAudioFocus(this);
    }
  }

  @MainThread
  public String getState() {
    if (isPaused) {
      return "paused";
    }
    if (isPlaying()) {
      return "started";
    }
    return "stopped";
  }


  @MainThread
  public void setVolume(float volume) {
    try {
      player.setVolume(volume, volume);
    } catch (Exception ignored) {
    }
  }

  @MainThread
  public void setDataSource(Uri uri, Promise promise) {
    if (setDataSourcePromise != null) {
      promise.reject("ERROR", "A setDataSource Call is already pending");
      return;
    }
    try {
      setDataSourcePromise = promise;
      player.reset();
      int id = getIdFromRawResourceUri(uri);
      if (id > 0) {
        try {
          AssetFileDescriptor afd = getResources().openRawResourceFd(id);
          if (afd == null) {
            throw new Exception("file is compressed");
          }
          player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
          afd.close();
        } catch (Resources.NotFoundException e) {
          throw new Exception("resource with id " + id + " not found");
        }
      } else {
        player.setDataSource(ctx, uri);
      }

      player.prepareAsync();
    } catch (Exception e) {
      promise.reject("ERROR", "setDataSource: " + e.getLocalizedMessage());
      setDataSourcePromise = null;
    }
  }


  @MainThread
  public void setupPlayer() {
    releasePlayer();
    player = new MediaPlayer();
    player.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
    player.setAudioAttributes(
        new AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .build()
    );
    player.setOnErrorListener(this);
    player.setOnPreparedListener(this);
  }


  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return new MusicBinder();
  }

  @Override
  public boolean onError(MediaPlayer mp, int what, int extra) {
    String error = "";
    switch (extra) {
      case MediaPlayer.MEDIA_ERROR_IO:
        error = "IO";
        break;
      case MediaPlayer.MEDIA_ERROR_MALFORMED:
        error = "MALFORMED";
        break;
      case MediaPlayer.MEDIA_ERROR_UNSUPPORTED:
        error = "UNSUPPORTED";
        break;
      case MediaPlayer.MEDIA_ERROR_TIMED_OUT:
        error = "TIMED_OUT";
        break;
      default:
        error = "UNKNOWN";
        break;
    }
    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("error", error);
    return true;
  }

  @Override
  public void onPrepared(MediaPlayer mp) {
    if (setDataSourcePromise != null) {
      setDataSourcePromise.resolve(null);
      setDataSourcePromise = null;
    }
  }

  @Override
  public void onCompletion(MediaPlayer mp) {
    AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
    audioManager.abandonAudioFocus(this);
    ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("completed", null);
  }

  class MusicBinder extends Binder {

    MediaPlayerService service = MediaPlayerService.this;
  }

  @MainThread
  public void destroy() {
    releasePlayer();
    stopForeground(true);
    stopSelf();
  }

  @MainThread
  public void releasePlayer() {
    if (player != null) {
      player.stop();
      player.release();
      player = null;
    }
  }


  @Override
  public void onDestroy() {
    destroy();
    super.onDestroy();
  }
}

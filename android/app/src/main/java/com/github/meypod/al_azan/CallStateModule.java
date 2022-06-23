package com.github.meypod.al_azan;

import android.content.Context;
import android.media.AudioManager;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CallStateModule extends ReactContextBaseJavaModule {
  CallStateModule(ReactApplicationContext context) {
    super(context);
  }

  @NonNull
  @Override
  public String getName() {
    return "CallStateModule";
  }

  @ReactMethod
  public void isCallActive(final Promise promise){
    AudioManager manager = (AudioManager)getReactApplicationContext().getSystemService(Context.AUDIO_SERVICE);
    int mode = manager.getMode();
    if (mode == AudioManager.MODE_IN_CALL || mode == AudioManager.MODE_CALL_SCREENING || mode == AudioManager.MODE_IN_COMMUNICATION || mode == AudioManager.MODE_RINGTONE) {
      promise.resolve(true);
    } else {
      promise.resolve(false);
    }
  }
}

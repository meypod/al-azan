package com.github.meypod.al_azan.modules;

import android.os.Build.VERSION_CODES;
import android.telephony.TelephonyCallback;
import androidx.annotation.RequiresApi;
import androidx.core.util.Consumer;

@RequiresApi(api = VERSION_CODES.S)
public class TelephonyStateListener extends TelephonyCallback implements
    TelephonyCallback.CallStateListener {

  private final Consumer<Integer> callback;

  public TelephonyStateListener(Consumer<Integer> callback) {
    this.callback = callback;
  }
  
  @Override
  public void onCallStateChanged(int state) {
    callback.accept(state);
  }
}

package com.github.meypod.al_azan;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import io.invertase.notifee.NotifeeApiModule;
import android.content.Intent;
import android.content.res.Configuration;


public class MainActivity extends ReactActivity {

  // for react-navigation native
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return NotifeeApiModule.getMainComponent("main-app");
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled()
        );
  }

  @Override
 public void onConfigurationChanged(Configuration newConfig) {
     super.onConfigurationChanged(newConfig);
     Intent intent = new Intent("onConfigurationChanged");
     intent.putExtra("newConfig", newConfig);
     this.sendBroadcast(intent);
  }
}

package com.github.meypod.al_azan;

import android.os.Bundle;
import android.view.WindowManager;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.i18nmanager.I18nUtil;
import io.invertase.notifee.NotifeeApiModule;

public class AlarmActivity extends ReactActivity {

    // for react-navigation native
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
        I18nUtil sharedI18nUtilInstance = I18nUtil.getInstance();
        sharedI18nUtilInstance.allowRTL(getApplicationContext(), true);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return NotifeeApiModule.getMainComponent("fs-alarm");
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
}

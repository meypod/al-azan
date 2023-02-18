package com.github.meypod.al_azan.modules;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.github.meypod.al_azan.utils.CompassSensor;

public class CompassModule extends ReactContextBaseJavaModule {
    CompassModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "CompassModule";
    }

    private int listenerCount = 0;
    private CompassSensor compassSensor;

    @ReactMethod
    public void addListener(String eventName) {
        if (compassSensor == null) {
            compassSensor = new CompassSensor();
        }
        if (listenerCount == 0) {
            compassSensor.start(getReactApplicationContext());
        }

        listenerCount += 1;
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        listenerCount -= count;
        if (listenerCount == 0) {
            if (compassSensor != null) {
                compassSensor.stop();
            }
        }
    }

    @ReactMethod
    public void setLocation(double latitude, double longitude, double altitude) {
        if (compassSensor != null) {
            compassSensor.updateMagneticDeclination(latitude, longitude, altitude);
        }
    }

    @Override
    public void onCatalystInstanceDestroy() {
        if (compassSensor != null) {
            compassSensor.stop();
            compassSensor = null;
        }
    }
}

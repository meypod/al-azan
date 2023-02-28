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
    private static int updateRateMs = 25; // ms
    private CompassSensor compassSensor;

    @ReactMethod
    public void addListener(String eventName) {
        if (compassSensor == null) {
            compassSensor = new CompassSensor(getReactApplicationContext());
        }

        if (listenerCount == 0) {
            compassSensor.start(updateRateMs);
        }

        if (eventName.equals("accuracyChanged")) {
            compassSensor.setAccuracyReceived(false);
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
    public void setUpdateRate(int ms) {
        updateRateMs = ms;
        if (this.compassSensor != null) {
            compassSensor.setUpdateRate(ms);
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

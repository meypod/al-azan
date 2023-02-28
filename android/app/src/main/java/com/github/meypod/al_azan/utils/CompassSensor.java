package com.github.meypod.al_azan.utils;

import android.app.Activity;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.view.Display;
import android.view.Surface;
import android.view.WindowManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;


// with help from https://talesofcode.com/developing-compass-android-application/
public class CompassSensor implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor rotationSensor;
    private ReactApplicationContext context;
    private SensorEventListener oneTimeListener;
    private float magneticDeclination = 0;
    private final float[] rotationSensorReading = new float[3];
    private int currentReportRate;
    private int currentReportRateMs;
    private long lastReading;
    private boolean accuracyReceived = false;

    public CompassSensor(ReactApplicationContext context) {
        this.context = context;
    }

    private void init() {
        if (sensorManager == null) {
            sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
            rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        }
    }

    private void teardown() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
            if (oneTimeListener != null) {
                sensorManager.unregisterListener(oneTimeListener);
                oneTimeListener = null;
            }
            sensorManager = null;
            rotationSensor = null;
        }
        accuracyReceived = false;
    }

    public void setUpdateRate(int updateRateMs) {
        currentReportRateMs = updateRateMs; // millisecond to microsecond
        currentReportRate = updateRateMs * 1000; // millisecond to microsecond
    }

    public void setAccuracyReceived(boolean value){
        this.accuracyReceived = value;
    }

    public void start(int updateRateMs) {
        init();
        setUpdateRate(updateRateMs);

        if (rotationSensor == null) {
            context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("accuracyChanged", -3);
            return;
        }

        boolean hasSensor = sensorManager.registerListener(this, rotationSensor, currentReportRate);

        if (!hasSensor) {
            context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("accuracyChanged", -2);
            stop();
        }
    }

    public void stop() {
        teardown();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        long tempMs = System.currentTimeMillis();
        if (tempMs - lastReading >= currentReportRateMs) {
            lastReading = tempMs;
            if (event.sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
                updateCompass(event);
            }
            if (!accuracyReceived) {
                accuracyReceived = true;
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("accuracyChanged", event.accuracy);
            }
        }
    }

    private void updateCompass(SensorEvent event) {
        //make sensor readings smoother using a low pass filter
        MathUtils.lowPassFilter(event.values, rotationSensorReading);
        DisplayRotation displayRotation = getDisplayRotation();
        float normalizedAzimuth = MathUtils.calculateAzimuth(rotationSensorReading, displayRotation);

        if (!Float.isNaN(normalizedAzimuth)) {
            if (this.magneticDeclination != 0) {
                float trueHeading = normalizedAzimuth + magneticDeclination;
                if (trueHeading > 360) { //if trueHeading was 362 degrees for example, it should be adjusted to be 2 degrees instead
                    trueHeading = trueHeading - 360;
                }
                context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("heading", trueHeading);
            } else {
                context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("heading", normalizedAzimuth);
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
            context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("accuracyChanged", accuracy);
        }
    }

    public void updateMagneticDeclination(double latitude, double longitude, double altitude) {
        this.magneticDeclination = MathUtils.calculateMagneticDeclination(latitude, longitude, altitude);
    }

    private DisplayRotation getDisplayRotation() {
        final Display display = getDisplayCompat();
        final int rotation;
        if (display != null) {
            rotation = display.getRotation();
        } else {
            rotation = 0;
        }
        switch (rotation) {
            case Surface.ROTATION_90:
                return DisplayRotation.ROTATION_90;
            case Surface.ROTATION_180:
                return DisplayRotation.ROTATION_180;
            case Surface.ROTATION_270:
                return DisplayRotation.ROTATION_270;
            default:
                return DisplayRotation.ROTATION_0;
        }
    }


    private Display getDisplayCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Activity activity = context.getCurrentActivity();
            if (activity != null) {
                return activity.getDisplay();
            }
            return null;
        } else {
            return ((WindowManager) context.getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
        }
    }

}
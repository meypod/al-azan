package com.github.meypod.al_azan.utils;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;


// with help from https://talesofcode.com/developing-compass-android-application/
public class CompassSensor implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor magneticSensor;
    private Sensor accelerometerSensor;
    private ReactContext context;
    private SensorEventListener oneTimeListener;

    private float heading = 0;
    private float trueHeading = 0;
    private float magneticDeclination = 0;

    private final float[] accelerometerReading = new float[3];
    private final float[] magnetometerReading = new float[3];

    public void start(ReactContext context) {
        start(context, 120);
    }

    public void start(ReactContext context, int updateRateMs) {
        if (sensorManager == null) {
            this.context = context;
            sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
            magneticSensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
            accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        }

        final int updateRate = updateRateMs * 1000; // millisecond to microsecond
        sensorManager.registerListener(this, accelerometerSensor, updateRate);
        boolean hasMagnetSensor =
                sensorManager.registerListener(this, magneticSensor, updateRate);

        if (hasMagnetSensor) {
            oneTimeListener = new SensorEventListener() {
                @Override
                public void onSensorChanged(SensorEvent event) {
                    context
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("accuracyChanged", event.accuracy);
                    sensorManager.unregisterListener(oneTimeListener);
                    oneTimeListener = null;
                }

                @Override
                public void onAccuracyChanged(Sensor sensor, int accuracy) {
                }
            };

            sensorManager.registerListener(oneTimeListener, magneticSensor, updateRate);
        } else {
            context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("accuracyChanged", -1);
            stop();
        }

    }

    public void stop() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
            if (oneTimeListener != null) {
                sensorManager.unregisterListener(oneTimeListener);
                oneTimeListener = null;
            }
            sensorManager = null;
            magneticSensor = null;
            accelerometerSensor = null;
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            //make sensor readings smoother using a low pass filter
            CompassHelper.lowPassFilter(event.values.clone(), accelerometerReading);
        } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            //make sensor readings smoother using a low pass filter
            CompassHelper.lowPassFilter(event.values.clone(), magnetometerReading);
        }
        updateHeading();
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("accuracyChanged", accuracy);
        }
    }

    private void updateHeading() {
        heading = CompassHelper.calculateHeading(accelerometerReading, magnetometerReading);
        heading = CompassHelper.convertRadtoDeg(heading);
        heading = CompassHelper.map180to360(heading);

        if (!Float.isNaN(heading)) {
            if (this.magneticDeclination != 0) {
                trueHeading = heading + magneticDeclination;
                if (trueHeading > 360) { //if trueHeading was 362 degrees for example, it should be adjusted to be 2 degrees instead
                    trueHeading = trueHeading - 360;
                }
                context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("heading", trueHeading);
            } else {
                context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("heading", heading);
            }
        }
    }

    public void updateMagneticDeclination(double latitude, double longitude, double altitude) {
        this.magneticDeclination = CompassHelper.calculateMagneticDeclination(latitude, longitude, altitude);
    }

}
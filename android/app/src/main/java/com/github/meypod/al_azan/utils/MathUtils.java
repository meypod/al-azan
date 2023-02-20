package com.github.meypod.al_azan.utils;

import android.hardware.SensorManager;

import java.util.GregorianCalendar;

// converted from https://github.com/Kr0oked/Compass
// with modification
public class MathUtils {

    private static final int AZIMUTH = 0;
    private static final int AXIS_SIZE = 3;
    private static final int ROTATION_MATRIX_SIZE = 9;

    public static float calculateAzimuth(float[] rotationVector, DisplayRotation displayRotation) {
        float[] rotationMatrix = getRotationMatrix(rotationVector);
        float[] remappedRotationMatrix = remapRotationMatrix(rotationMatrix, displayRotation);
        float[] orientationInRadians = new float[AXIS_SIZE];
        SensorManager.getOrientation(remappedRotationMatrix, orientationInRadians);
        float azimuthInRadians = orientationInRadians[AZIMUTH];
        float azimuthInDegrees = (float) Math.toDegrees(azimuthInRadians);
        return (azimuthInDegrees + 360f) % 360f;
    }

    private static float[] getRotationMatrix(float[] rotationVector) {
        float[] rotationMatrix = new float[ROTATION_MATRIX_SIZE];
        SensorManager.getRotationMatrixFromVector(rotationMatrix, rotationVector);
        return rotationMatrix;
    }

    private static float[] remapRotationMatrix(float[] rotationMatrix, DisplayRotation displayRotation) {
        switch (displayRotation) {
            case ROTATION_0:
                return remapRotationMatrix(rotationMatrix, SensorManager.AXIS_X, SensorManager.AXIS_Y);
            case ROTATION_90:
                return remapRotationMatrix(rotationMatrix, SensorManager.AXIS_Y, SensorManager.AXIS_MINUS_X);
            case ROTATION_180:
                return remapRotationMatrix(rotationMatrix, SensorManager.AXIS_MINUS_X, SensorManager.AXIS_MINUS_Y);
            case ROTATION_270:
                return remapRotationMatrix(rotationMatrix, SensorManager.AXIS_MINUS_Y, SensorManager.AXIS_X);
        }
        return null;
    }

    private static float[] remapRotationMatrix(float[] rotationMatrix, int newX, int newY) {
        float[] remappedRotationMatrix = new float[ROTATION_MATRIX_SIZE];
        SensorManager.remapCoordinateSystem(rotationMatrix, newX, newY, remappedRotationMatrix);
        return remappedRotationMatrix;
    }


    //0 ≤ ALPHA ≤ 1
    //smaller ALPHA results in smoother sensor data but slower updates
    public static final float ALPHA = 0.96f;

    public static float[] lowPassFilter(float[] input, float[] output) {
        if (output == null) return input;

        for (int i = 0; i < 3; i++) { // input can have more than 3 elements
            output[i] = output[i] + ALPHA * (input[i] - output[i]);
        }
        return output;
    }

    public static float calculateMagneticDeclination(double latitude, double longitude, double altitude) {
        TSAGeoMag geoMag = new TSAGeoMag();
        return (float) geoMag
                .getDeclination(latitude, longitude, geoMag.decimalYear(new GregorianCalendar()), altitude);
    }

}
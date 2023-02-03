package com.github.meypod.al_azan.utils;

import java.util.GregorianCalendar;

public class CompassHelper {
    public static float calculateHeading(float[] accelerometerReading, float[] magnetometerReading) {
        float Ax = accelerometerReading[0];
        float Ay = accelerometerReading[1];
        float Az = accelerometerReading[2];

        float Ex = magnetometerReading[0];
        float Ey = magnetometerReading[1];
        float Ez = magnetometerReading[2];

        //cross product of the magnetic field vector and the gravity vector
        float Hx = Ey * Az - Ez * Ay;
        float Hy = Ez * Ax - Ex * Az;
        float Hz = Ex * Ay - Ey * Ax;

        //normalize the values of resulting vector
        final float invH = 1.0f / (float) Math.sqrt(Hx * Hx + Hy * Hy + Hz * Hz);
        Hx *= invH;
        Hy *= invH;
        Hz *= invH;

        //normalize the values of gravity vector
        final float invA = 1.0f / (float) Math.sqrt(Ax * Ax + Ay * Ay + Az * Az);
        Ax *= invA;
        Ay *= invA;
        Az *= invA;

        //cross product of the gravity vector and the new vector H
        final float Mx = Ay * Hz - Az * Hy;
        final float My = Az * Hx - Ax * Hz;
        final float Mz = Ax * Hy - Ay * Hx;

        //arctangent to obtain heading in radians
        return (float) Math.atan2(Hy, My);
    }


    public static float convertRadtoDeg(float rad) {
        return (float) (rad / Math.PI) * 180;
    }

    //map angle from [-180,180] range to [0,360] range
    public static float map180to360(float angle) {
        return (angle + 360) % 360;
    }

    //0 ≤ ALPHA ≤ 1
    //smaller ALPHA results in smoother sensor data but slower updates
    public static final float ALPHA = 0.5f;

    public static float[] lowPassFilter(float[] input, float[] output) {
        if (output == null) return input;

        for (int i = 0; i < input.length; i++) {
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

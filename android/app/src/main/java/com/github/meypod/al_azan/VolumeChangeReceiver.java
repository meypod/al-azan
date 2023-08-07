package com.github.meypod.al_azan;

import static com.github.meypod.al_azan.PrayerTimesWidget.requestWidgetUpdate;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class VolumeChangeReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (ContextHolder.getApplicationContext() == null) {
            ContextHolder.setApplicationContext(context.getApplicationContext());
        }


        int stream = intent.getIntExtra(
                "android.media.EXTRA_VOLUME_STREAM_TYPE",
                AudioManager.STREAM_DTMF // just a value we are not interested in, nothing important
        );

        if (stream == AudioManager.STREAM_MUSIC) {
            int newVolume = intent.getIntExtra("android.media.EXTRA_VOLUME_STREAM_VALUE", -1);
            if (newVolume >= 0) {
                AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
                int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                double sliderValue = newVolume == 0 ? 0 : newVolume / maxVolume;
                double scaledVolume = scaleVolume(sliderValue);
                WritableMap data = Arguments.createMap();
                data.putDouble("volume", scaledVolume);
                ReactUtils.startHeadlessTask("volume_changed",
                        data,
                        30000,
                        null);
            }
        }
    }

    // from https://stackoverflow.com/a/17033404/20861939
    private float scaleVolume(double sliderValue) { // assumes slidervalue is between 0 and 100
        if (sliderValue == 0) return 0;
        double logSliderValue = Math.log10(sliderValue / 10);
        double logMaxSliderValue = Math.log10(10);
        float scaledVolume = (float) (logSliderValue / logMaxSliderValue);
        return scaledVolume;
    }
}

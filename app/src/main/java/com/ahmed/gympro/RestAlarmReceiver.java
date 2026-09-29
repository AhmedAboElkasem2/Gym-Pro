package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;

public class RestAlarmReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    final PendingResult pending = goAsync();

    new Thread(() -> {
      PowerManager.WakeLock wakeLock = null;
      Ringtone ringtone = null;
      try {
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
          wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "GymPro:RestAlarm");
          wakeLock.acquire(8000L);
        }

        Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        if (alarmUri == null) alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        ringtone = RingtoneManager.getRingtone(context.getApplicationContext(), alarmUri);
        if (ringtone != null) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ringtone.setAudioAttributes(new AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_ALARM)
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .build());
          }
          ringtone.play();
        }

        Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
          long[] pattern = new long[]{0, 350, 180, 350, 180, 650};
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
          } else {
            vibrator.vibrate(pattern, -1);
          }
        }

        Thread.sleep(5000L);
      } catch (Exception ignored) {
      } finally {
        try {
          if (ringtone != null && ringtone.isPlaying()) ringtone.stop();
        } catch (Exception ignored) {}
        try {
          if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
        } catch (Exception ignored) {}
        pending.finish();
      }
    }).start();
  }
}

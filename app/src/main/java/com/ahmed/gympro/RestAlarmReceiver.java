package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;

public class RestAlarmReceiver extends BroadcastReceiver {
  private static final long ALERT_DURATION_MS = 6000L;

  @Override public void onReceive(Context context, Intent intent) {
    final PendingResult pending = goAsync();
    final Context appContext = context.getApplicationContext();

    new Thread(() -> playAlert(appContext, pending), "VantaLiftRestAlarm").start();
  }

  private void playAlert(Context context, PendingResult pending) {
    PowerManager.WakeLock wakeLock = null;
    Ringtone ringtone = null;
    Vibrator vibrator = null;
    AudioManager audioManager = null;
    AudioFocusRequest audioFocusRequest = null;
    boolean legacyAudioFocusGranted = false;

    try {
      PowerManager powerManager =
        (PowerManager) context.getSystemService(Context.POWER_SERVICE);
      if (powerManager != null) {
        wakeLock = powerManager.newWakeLock(
          PowerManager.PARTIAL_WAKE_LOCK,
          "VantaLift:RestAlarm"
        );
        wakeLock.acquire(ALERT_DURATION_MS + 3000L);
      }

      AudioAttributes alarmAttributes = new AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_ALARM)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build();

      audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
      if (audioManager != null) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          audioFocusRequest = new AudioFocusRequest.Builder(
            AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
          )
            .setAudioAttributes(alarmAttributes)
            .setAcceptsDelayedFocusGain(false)
            .build();
          audioManager.requestAudioFocus(audioFocusRequest);
        } else {
          legacyAudioFocusGranted = audioManager.requestAudioFocus(
            null,
            AudioManager.STREAM_ALARM,
            AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
          ) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
        }
      }

      Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
      if (alarmUri == null) {
        alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
      }

      ringtone = RingtoneManager.getRingtone(context, alarmUri);
      if (ringtone != null) {
        ringtone.setAudioAttributes(alarmAttributes);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          ringtone.setLooping(true);
          ringtone.setVolume(1.0f);
        }
        ringtone.play();
      }

      vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
      if (vibrator != null && vibrator.hasVibrator()) {
        long[] pattern = new long[]{0, 350, 180, 350, 180, 650};
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
        } else {
          vibrator.vibrate(pattern, 0);
        }
      }

      Thread.sleep(ALERT_DURATION_MS);
    } catch (Exception ignored) {
    } finally {
      try {
        if (vibrator != null) vibrator.cancel();
      } catch (Exception ignored) {}

      try {
        if (ringtone != null && ringtone.isPlaying()) ringtone.stop();
      } catch (Exception ignored) {}

      try {
        if (audioManager != null) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
            audioManager.abandonAudioFocusRequest(audioFocusRequest);
          } else if (legacyAudioFocusGranted) {
            audioManager.abandonAudioFocus(null);
          }
        }
      } catch (Exception ignored) {}

      try {
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
      } catch (Exception ignored) {}

      pending.finish();
    }
  }
}

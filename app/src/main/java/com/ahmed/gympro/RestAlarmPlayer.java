package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
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

final class RestAlarmPlayer {
  private static final long PLAY_DURATION_MS = 7000L;
  private static final long WAKE_LOCK_DURATION_MS = 10000L;

  private RestAlarmPlayer() {}

  static void playAsync(Context context, BroadcastReceiver.PendingResult pendingResult) {
    new Thread(() -> playBlocking(context, pendingResult), "VantaLiftRestAlarm").start();
  }

  private static void playBlocking(
    Context context,
    BroadcastReceiver.PendingResult pendingResult
  ) {
    PowerManager.WakeLock wakeLock = null;
    Ringtone ringtone = null;
    Vibrator vibrator = null;
    AudioManager audioManager = null;
    AudioFocusRequest focusRequest = null;
    AudioManager.OnAudioFocusChangeListener focusListener = focusChange -> {};

    try {
      PowerManager powerManager =
        (PowerManager) context.getSystemService(Context.POWER_SERVICE);
      if (powerManager != null) {
        wakeLock = powerManager.newWakeLock(
          PowerManager.PARTIAL_WAKE_LOCK,
          "VantaLift:RestAlarm"
        );
        wakeLock.acquire(WAKE_LOCK_DURATION_MS);
      }

      AudioAttributes alarmAttributes = new AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_ALARM)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build();

      audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
      if (audioManager != null) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
            .setAudioAttributes(alarmAttributes)
            .setAcceptsDelayedFocusGain(false)
            .setOnAudioFocusChangeListener(focusListener)
            .build();
          audioManager.requestAudioFocus(focusRequest);
        } else {
          audioManager.requestAudioFocus(
            focusListener,
            AudioManager.STREAM_ALARM,
            AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
          );
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
          ringtone.setVolume(1.0f);
        }
        ringtone.play();
      }

      vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
      if (vibrator != null && vibrator.hasVibrator()) {
        long[] pattern = new long[] {0, 350, 180, 350, 180, 650};
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator.vibrate(VibrationEffect.createWaveform(pattern, 1));
        } else {
          vibrator.vibrate(pattern, 1);
        }
      }

      Thread.sleep(PLAY_DURATION_MS);
    } catch (InterruptedException interrupted) {
      Thread.currentThread().interrupt();
    } catch (Exception ignored) {
    } finally {
      try {
        if (ringtone != null && ringtone.isPlaying()) ringtone.stop();
      } catch (Exception ignored) {}

      try {
        if (vibrator != null) vibrator.cancel();
      } catch (Exception ignored) {}

      try {
        if (audioManager != null) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && focusRequest != null) {
            audioManager.abandonAudioFocusRequest(focusRequest);
          } else {
            audioManager.abandonAudioFocus(focusListener);
          }
        }
      } catch (Exception ignored) {}

      try {
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
      } catch (Exception ignored) {}

      pendingResult.finish();
    }
  }
}

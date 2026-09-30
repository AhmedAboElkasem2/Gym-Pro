package com.ahmed.gympro;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;

public final class RestAlarmService extends Service {
  static final String ACTION_START = "com.ahmed.gympro.REST_ALARM_START";
  static final String ACTION_STOP = "com.ahmed.gympro.REST_ALARM_STOP";

  private static final String CHANNEL_ID = "vantalift_rest_alarm";
  private static final int NOTIFICATION_ID = 9413;

  private MediaPlayer mediaPlayer;
  private Vibrator vibrator;
  private AudioManager audioManager;
  private AudioFocusRequest audioFocusRequest;
  private boolean legacyAudioFocusGranted;

  static void start(Context context) {
    Intent intent = new Intent(context, RestAlarmService.class)
      .setAction(ACTION_START);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(intent);
    } else {
      context.startService(intent);
    }
  }

  static void stop(Context context) {
    Intent intent = new Intent(context, RestAlarmService.class)
      .setAction(ACTION_STOP);
    try {
      context.startService(intent);
    } catch (Exception ignored) {
      context.stopService(new Intent(context, RestAlarmService.class));
      RestAlarmState.deactivate(context);
    }
  }

  @Override
  public void onCreate() {
    super.onCreate();
    ensureNotificationChannel();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    String action = intent == null ? ACTION_START : intent.getAction();

    if (ACTION_STOP.equals(action)) {
      acknowledgeAndStop();
      return START_NOT_STICKY;
    }

    startForeground(NOTIFICATION_ID, buildNotification());
    RestAlarmState.activate(this);
    startAlarmOutput();
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    releaseAlarmOutput();
    super.onDestroy();
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void startAlarmOutput() {
    if (mediaPlayer != null && mediaPlayer.isPlaying()) return;

    AudioAttributes attributes = new AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build();

    requestAudioFocus(attributes);

    try {
      Uri uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
      if (uri == null) {
        uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
      }

      mediaPlayer = new MediaPlayer();
      mediaPlayer.setAudioAttributes(attributes);
      mediaPlayer.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
      mediaPlayer.setDataSource(this, uri);
      mediaPlayer.setLooping(true);
      mediaPlayer.prepare();
      mediaPlayer.start();
    } catch (Exception ignored) {
      releaseMediaPlayer();
    }

    vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
    if (vibrator != null && vibrator.hasVibrator()) {
      long[] pattern = new long[]{0, 450, 220, 450, 220, 900};
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
      } else {
        vibrator.vibrate(pattern, 0);
      }
    }
  }

  private void requestAudioFocus(AudioAttributes attributes) {
    audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
    if (audioManager == null) return;

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        audioFocusRequest = new AudioFocusRequest.Builder(
          AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
        )
          .setAudioAttributes(attributes)
          .setAcceptsDelayedFocusGain(false)
          .build();
        audioManager.requestAudioFocus(audioFocusRequest);
      } else {
        legacyAudioFocusGranted = audioManager.requestAudioFocus(
          null,
          AudioManager.STREAM_ALARM,
          AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
        ) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
      }
    } catch (Exception ignored) {}
  }

  private void acknowledgeAndStop() {
    RestAlarmState.deactivate(this);
    releaseAlarmOutput();
    stopForeground(true);
    stopSelf();
  }

  private void releaseAlarmOutput() {
    try {
      if (vibrator != null) vibrator.cancel();
    } catch (Exception ignored) {}
    vibrator = null;

    releaseMediaPlayer();
    abandonAudioFocus();
  }

  private void releaseMediaPlayer() {
    try {
      if (mediaPlayer != null) {
        if (mediaPlayer.isPlaying()) mediaPlayer.stop();
        mediaPlayer.release();
      }
    } catch (Exception ignored) {}
    mediaPlayer = null;
  }

  private void abandonAudioFocus() {
    if (audioManager == null) return;

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
        audioManager.abandonAudioFocusRequest(audioFocusRequest);
      } else if (legacyAudioFocusGranted) {
        audioManager.abandonAudioFocus(null);
      }
    } catch (Exception ignored) {}

    audioManager = null;
    audioFocusRequest = null;
    legacyAudioFocusGranted = false;
  }

  private Notification buildNotification() {
    Intent openApp = new Intent(this, MainActivity.class)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

    int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
    }

    PendingIntent contentIntent = PendingIntent.getActivity(
      this,
      NOTIFICATION_ID,
      openApp,
      pendingFlags
    );

    Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
      ? new Notification.Builder(this, CHANNEL_ID)
      : new Notification.Builder(this);

    builder
      .setSmallIcon(R.drawable.ic_vantalift)
      .setContentTitle("Rest time is over")
      .setContentText("Open VantaLift and tap OK to stop the alarm.")
      .setContentIntent(contentIntent)
      .setOngoing(true)
      .setAutoCancel(false)
      .setCategory(Notification.CATEGORY_ALARM)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setPriority(Notification.PRIORITY_MAX);

    return builder.build();
  }

  private void ensureNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

    NotificationManager manager =
      (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    if (manager == null) return;

    NotificationChannel channel = new NotificationChannel(
      CHANNEL_ID,
      "Rest timer alarm",
      NotificationManager.IMPORTANCE_HIGH
    );
    channel.setDescription("Persistent VantaLift rest timer alerts.");
    channel.setSound(null, null);
    channel.enableVibration(false);
    manager.createNotificationChannel(channel);
  }
}

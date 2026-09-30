package com.ahmed.gympro.testmusic;

import android.app.*;
import android.content.Intent;
import android.media.*;
import android.os.*;

public final class MusicService extends Service {
  private MediaPlayer player;
  private AudioManager manager;
  private AudioFocusRequest focus;
  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    NotificationManager notifications = getSystemService(NotificationManager.class);
    notifications.createNotificationChannel(new NotificationChannel("music", "Test music", NotificationManager.IMPORTANCE_LOW));
    startForeground(1, new Notification.Builder(this, "music").setSmallIcon(android.R.drawable.ic_media_play).setContentTitle("Test music playing").build());
    if (player != null) return START_NOT_STICKY;
    AudioAttributes attributes = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
    manager = getSystemService(AudioManager.class);
    focus = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN).setAudioAttributes(attributes)
      .setOnAudioFocusChangeListener(change -> {
        if (player == null) return;
        if (change == AudioManager.AUDIOFOCUS_LOSS || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) player.pause();
        if (change == AudioManager.AUDIOFOCUS_GAIN) { player.setVolume(1, 1); player.start(); }
        if (change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) player.setVolume(.2f, .2f);
      }).build();
    if (manager.requestAudioFocus(focus) != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) throw new IllegalStateException("Fixture has no focus");
    player = MediaPlayer.create(this, R.raw.rest_alarm, attributes, 0);
    player.setLooping(true);
    player.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
    player.start();
    return START_NOT_STICKY;
  }
  @Override public void onDestroy() {
    if (player != null) player.release();
    if (manager != null && focus != null) manager.abandonAudioFocusRequest(focus);
    super.onDestroy();
  }
  @Override public IBinder onBind(Intent intent) { return null; }
}

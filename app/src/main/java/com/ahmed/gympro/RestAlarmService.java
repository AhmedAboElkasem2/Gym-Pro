package com.ahmed.gympro;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

public final class RestAlarmService extends Service {
  static final String ACTION_START = "com.ahmed.gympro.REST_ALARM_START";

  private static final String CHANNEL_ID = "vantalift_rest_alarm";
  private static final int NOTIFICATION_ID = 9413;

  private RestAlarmAudio audio;
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
    context.stopService(new Intent(context, RestAlarmService.class));
  }

  @Override
  public void onCreate() {
    super.onCreate();
    ensureNotificationChannel();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    synchronized (RestAlarmState.class) {
      // A late start/restart must never resurrect an acknowledged alarm.
      startForeground(NOTIFICATION_ID, buildNotification());
      if (!RestAlarmState.isActive(this)) {
        stopForeground(true);
        stopSelf();
        return START_NOT_STICKY;
      }
      if (audio == null) audio = new RestAlarmAudio(this);
      audio.start();
      return START_STICKY;
    }
  }

  @Override
  public void onDestroy() {
    if (audio != null) audio.close();
    super.onDestroy();
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
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

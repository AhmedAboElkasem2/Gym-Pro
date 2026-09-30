package com.ahmed.gympro;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;
import android.widget.RemoteViews;

/** System-owned chronometer keeps counting even when the WebView is suspended. */
final class RestAlarmNotification {
  static final int ID = 9413;
  private static final String TIMER_CHANNEL = "vantalift_rest_countdown_v2";
  private static final String ALARM_CHANNEL = "vantalift_rest_alarm";
  private final Context context;

  RestAlarmNotification(Context context) {
    this.context = context;
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationManager manager = context.getSystemService(NotificationManager.class);
      NotificationChannel timer = new NotificationChannel(TIMER_CHANNEL, "Rest countdown", NotificationManager.IMPORTANCE_DEFAULT);
      // Channel importance is immutable: v2 migrates the old LOW/silent channel.
      // DEFAULT ranks with normal notifications; countdown updates never make sound.
      timer.setSound(null, null);
      timer.enableVibration(false);
      timer.setShowBadge(false);
      manager.createNotificationChannel(timer);
      NotificationChannel alarm = new NotificationChannel(ALARM_CHANNEL, "Rest timer alarm", NotificationManager.IMPORTANCE_HIGH);
      alarm.setSound(null, null);
      alarm.enableVibration(false);
      manager.createNotificationChannel(alarm);
    }
  }

  static Intent openWorkout(Context context) {
    return new Intent(context, MainActivity.class).addFlags(
      Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
  }

  Notification build(boolean ringing, long remainingMillis) {
    PendingIntent open = PendingIntent.getActivity(context, ID, openWorkout(context),
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Notification.Builder builder = Build.VERSION.SDK_INT >= 26
      ? new Notification.Builder(context, ringing ? ALARM_CHANNEL : TIMER_CHANNEL)
      : new Notification.Builder(context);
    builder.setSmallIcon(R.drawable.ic_vantalift).setContentIntent(open)
      .setContentTitle(ringing ? "Rest time is over" : "Rest timer")
      .setContentText(ringing ? "Open your workout and tap OK to stop the alarm." : "Recovery · Next set")
      .setColor(0xFFE53935).setOngoing(true).setAutoCancel(false).setOnlyAlertOnce(true)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setCategory(ringing ? Notification.CATEGORY_ALARM : Notification.CATEGORY_PROGRESS)
      .setPriority(ringing ? Notification.PRIORITY_HIGH : Notification.PRIORITY_DEFAULT);
    if (!ringing) {
      if (Build.VERSION.SDK_INT >= 24) {
        builder.setWhen(System.currentTimeMillis() + remainingMillis).setShowWhen(true)
          .setUsesChronometer(true).setChronometerCountDown(true);
        long base = SystemClock.elapsedRealtime() + Math.max(0, remainingMillis);
        builder.setStyle(new Notification.DecoratedCustomViewStyle())
          .setCustomContentView(countdownView(R.layout.notification_rest_compact, base))
          .setCustomBigContentView(countdownView(R.layout.notification_rest_expanded, base));
      } else {
        long seconds = (remainingMillis + 999) / 1000;
        builder.setContentText(String.format(java.util.Locale.US, "%02d:%02d remaining · Tap for workout", seconds / 60, seconds % 60));
      }
    }
    return builder.build();
  }

  private RemoteViews countdownView(int layout, long base) {
    RemoteViews view = new RemoteViews(context.getPackageName(), layout);
    view.setChronometer(R.id.rest_countdown, base, null, true);
    if (Build.VERSION.SDK_INT >= 24) view.setChronometerCountDown(R.id.rest_countdown, true);
    return view;
  }
}

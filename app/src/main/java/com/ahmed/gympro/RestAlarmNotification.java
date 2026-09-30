package com.ahmed.gympro;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** System-owned chronometer keeps counting even when the WebView is suspended. */
final class RestAlarmNotification {
  static final int ID = 9413;
  private static final String TIMER_CHANNEL = "vantalift_rest_countdown";
  private static final String ALARM_CHANNEL = "vantalift_rest_alarm";
  private final Context context;

  RestAlarmNotification(Context context) {
    this.context = context;
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationManager manager = context.getSystemService(NotificationManager.class);
      NotificationChannel timer = new NotificationChannel(TIMER_CHANNEL, "Rest countdown", NotificationManager.IMPORTANCE_LOW);
      timer.setSound(null, null);
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
      .setContentText(ringing ? "Open your workout and tap OK to stop the alarm." : "Next set is coming. Tap to return to your workout.")
      .setOngoing(true).setAutoCancel(false).setOnlyAlertOnce(true)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setCategory(ringing ? Notification.CATEGORY_ALARM : Notification.CATEGORY_PROGRESS)
      .setPriority(ringing ? Notification.PRIORITY_HIGH : Notification.PRIORITY_LOW);
    if (!ringing) {
      if (Build.VERSION.SDK_INT >= 24) {
        builder.setWhen(System.currentTimeMillis() + remainingMillis).setShowWhen(true)
          .setUsesChronometer(true).setChronometerCountDown(true);
      } else {
        long seconds = (remainingMillis + 999) / 1000;
        builder.setContentText(String.format(java.util.Locale.US, "%02d:%02d remaining · Tap for workout", seconds / 60, seconds % 60));
      }
    }
    return builder.build();
  }
}

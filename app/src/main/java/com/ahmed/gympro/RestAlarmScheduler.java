package com.ahmed.gympro;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

final class RestAlarmScheduler {
  private static final int ALARM_REQUEST_CODE = 9411;
  private static final int SHOW_REQUEST_CODE = 9412;
  private final Context context;

  RestAlarmScheduler(Context context) {
    this.context = context.getApplicationContext();
  }

  private PendingIntent alarmIntent() {
    Intent intent = new Intent(context, RestAlarmReceiver.class);
    intent.setAction("com.ahmed.gympro.REST_COMPLETE");
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    return PendingIntent.getBroadcast(context, ALARM_REQUEST_CODE, intent, flags);
  }

  private PendingIntent showIntent() {
    Intent intent = new Intent(context, MainActivity.class);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    return PendingIntent.getActivity(context, SHOW_REQUEST_CODE, intent, flags);
  }

  boolean schedule(int seconds) {
    try {
      AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      if (manager == null) return false;

      cancel();
      long triggerAt = System.currentTimeMillis() + Math.max(1, seconds) * 1000L;
      PendingIntent operation = alarmIntent();

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        AlarmManager.AlarmClockInfo info =
          new AlarmManager.AlarmClockInfo(triggerAt, showIntent());
        manager.setAlarmClock(info, operation);
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        manager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, operation);
      } else {
        manager.set(AlarmManager.RTC_WAKEUP, triggerAt, operation);
      }
      return true;
    } catch (Exception ignored) {
      return false;
    }
  }

  void cancel() {
    AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (manager != null) manager.cancel(alarmIntent());
  }
}

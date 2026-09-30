package com.ahmed.gympro;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import java.util.UUID;

final class RestAlarmScheduler {
  private static final int ALARM_REQUEST_CODE = 9411;
  private static final int SHOW_REQUEST_CODE = 9412;
  private final Context context;

  RestAlarmScheduler(Context context) {
    this.context = context.getApplicationContext();
  }

  private PendingIntent alarmIntent(String token) {
    Intent intent = new Intent(context, RestAlarmReceiver.class);
    intent.setAction("com.ahmed.gympro.REST_COMPLETE");
    intent.putExtra("token", token);
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    return PendingIntent.getBroadcast(context, ALARM_REQUEST_CODE, intent, flags);
  }

  private PendingIntent showIntent() {
    Intent intent = RestAlarmNotification.openWorkout(context);
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
      if (Build.VERSION.SDK_INT >= 31 && !manager.canScheduleExactAlarms()) return false;

      cancel();
      long triggerAt = System.currentTimeMillis() + Math.max(1, seconds) * 1000L;
      String token = UUID.randomUUID().toString();
      RestAlarmState.pending(context, token, Math.max(1, seconds) * 1000L);
      PendingIntent operation = alarmIntent(token);

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
    } catch (RuntimeException error) {
      RestAlarmState.pending(context, null);
      Log.e("RestAlarm", "Exact rest alarm could not be scheduled", error);
      return false;
    }
  }

  void cancel() {
    RestAlarmState.pending(context, null);
    AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (manager != null) manager.cancel(alarmIntent(null));
  }
}

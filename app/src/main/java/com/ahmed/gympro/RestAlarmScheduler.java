package com.ahmed.gympro;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

final class RestAlarmScheduler {
  private static final int REQUEST_CODE = 9411;
  private static final int SHOW_APP_REQUEST_CODE = 9412;
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

    return PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags);
  }

  private PendingIntent showAppIntent() {
    Intent intent = new Intent(context, MainActivity.class);
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }

    return PendingIntent.getActivity(context, SHOW_APP_REQUEST_CODE, intent, flags);
  }

  boolean schedule(int seconds) {
    AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (manager == null) return false;

    cancel();

    long triggerAt = System.currentTimeMillis() + (Math.max(1, seconds) * 1000L);
    PendingIntent alarmIntent = alarmIntent();

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !manager.canScheduleExactAlarms()) {
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, alarmIntent);
        return true;
      }

      AlarmManager.AlarmClockInfo alarmClockInfo =
        new AlarmManager.AlarmClockInfo(triggerAt, showAppIntent());
      manager.setAlarmClock(alarmClockInfo, alarmIntent);
      return true;
    } catch (SecurityException ignored) {
      try {
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, alarmIntent);
        return true;
      } catch (Exception fallbackError) {
        return false;
      }
    } catch (Exception ignored) {
      return false;
    }
  }

  void cancel() {
    AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (manager != null) {
      manager.cancel(alarmIntent());
    }
  }
}

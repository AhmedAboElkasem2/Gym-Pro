package com.ahmed.gympro;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

final class RestAlarmScheduler {
  private static final int REQUEST_CODE = 9411;
  private final Context context;

  RestAlarmScheduler(Context context) {
    this.context = context;
  }

  private PendingIntent pendingIntent() {
    Intent intent = new Intent(context, RestAlarmReceiver.class);
    intent.setAction("com.ahmed.gympro.REST_COMPLETE");
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    return PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags);
  }

  boolean schedule(int seconds) {
    try {
      AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      if (manager == null) return false;
      cancel();
      long triggerAt = System.currentTimeMillis() + (Math.max(1, seconds) * 1000L);
      PendingIntent intent = pendingIntent();
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, intent);
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        manager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, intent);
      } else {
        manager.set(AlarmManager.RTC_WAKEUP, triggerAt, intent);
      }
      return true;
    } catch (Exception ignored) {
      return false;
    }
  }

  void cancel() {
    AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (manager != null) manager.cancel(pendingIntent());
  }
}

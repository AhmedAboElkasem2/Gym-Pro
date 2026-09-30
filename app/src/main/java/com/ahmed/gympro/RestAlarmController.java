package com.ahmed.gympro;

import android.content.Context;

final class RestAlarmController {
  private final Context context;
  private final RestAlarmScheduler scheduler;

  RestAlarmController(Context context) {
    this.context = context.getApplicationContext();
    this.scheduler = new RestAlarmScheduler(this.context);
  }

  boolean schedule(int seconds) {
    synchronized (RestAlarmState.class) {
      if (isActive()) return false;
      if (!scheduler.schedule(seconds)) return false;
      try {
        RestAlarmService.start(context);
        return true;
      } catch (RuntimeException error) {
        scheduler.cancel();
        android.util.Log.e("RestAlarm", "Countdown service could not start", error);
        return false;
      }
    }
  }

  void cancel() {
    synchronized (RestAlarmState.class) {
      scheduler.cancel();
      if (!isActive()) RestAlarmService.stop(context);
    }
  }

  void acknowledge() {
    synchronized (RestAlarmState.class) {
      scheduler.cancel();
      RestAlarmState.deactivate(context);
      RestAlarmService.stop(context);
    }
  }

  boolean isActive() {
    return RestAlarmState.isActive(context);
  }

}

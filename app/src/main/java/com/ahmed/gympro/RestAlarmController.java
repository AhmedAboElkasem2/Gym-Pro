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
      return scheduler.schedule(seconds);
    }
  }

  void cancel() {
    synchronized (RestAlarmState.class) {
      scheduler.cancel();
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

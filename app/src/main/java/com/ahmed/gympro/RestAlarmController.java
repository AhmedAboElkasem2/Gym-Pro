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
    stopActiveAlarm();
    return scheduler.schedule(seconds);
  }

  void cancel() {
    scheduler.cancel();
    stopActiveAlarm();
  }

  void acknowledge() {
    scheduler.cancel();
    stopActiveAlarm();
  }

  boolean isActive() {
    return RestAlarmState.isActive(context);
  }

  private void stopActiveAlarm() {
    RestAlarmService.stop(context);
    RestAlarmState.deactivate(context);
  }
}

package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Notification controls only affect the countdown token that rendered them. */
public final class RestTimerActionReceiver extends BroadcastReceiver {
  static final String EXTEND = "com.ahmed.gympro.REST_EXTEND";
  static final String SKIP = "com.ahmed.gympro.REST_SKIP";

  @Override public void onReceive(Context context, Intent intent) {
    synchronized (RestAlarmState.class) {
      String token = intent.getStringExtra("token");
      if (token == null || !token.equals(RestAlarmState.pendingToken(context))) return;
      RestAlarmController controller = new RestAlarmController(context);
      if (EXTEND.equals(intent.getAction())) {
        long remaining = RestAlarmState.remainingMillis(context);
        if (remaining > 0) controller.schedule((int) ((remaining + 999) / 1000) + 30);
      } else if (SKIP.equals(intent.getAction())) {
        controller.cancel();
      }
    }
  }
}

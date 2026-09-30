package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class RestAlarmReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    RestAlarmState.activate(context);

    try {
      RestAlarmService.start(context.getApplicationContext());
    } catch (Exception ignored) {
      RestAlarmState.deactivate(context);
    }
  }
}

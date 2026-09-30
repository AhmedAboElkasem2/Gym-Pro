package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public final class RestAlarmReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    synchronized (RestAlarmState.class) {
      if (!RestAlarmState.claim(context, intent.getStringExtra("token"))) return;
      try {
        RestAlarmService.start(context.getApplicationContext());
      } catch (RuntimeException error) {
        // Keep completion pending for the next foreground launch; never silently lose it.
        Log.e("RestAlarm", "Could not start alarm output; completion remains pending", error);
      }
    }
  }
}
